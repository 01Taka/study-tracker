import { useCallback, useEffect, useState } from 'react';
import { generateId } from '@/shared/functions/generate-id';
import { ProblemUnit, ProblemUnitData, UnitVersionRecord } from '@/shared/types/app.types';
import { useHierarchyData } from './useHierarchyData';

const UNITS_STORAGE_KEY = 'app_units_record';

export const useProblemUnitData = (reloadWorkbook?: () => void) => {
  const [unitRecord, setUnitRecord] = useState<UnitVersionRecord>({});

  // hierarchy側の操作関数（onAddUnitPathsはtargetIndexをサポート済みと想定）
  const { onAddUnitPaths, onRemoveUnitPath, onReplaceUnitPath } = useHierarchyData(reloadWorkbook);

  /**
   * ローカルストレージから最新状態を読み込み
   */
  const reloadUnitRecord = useCallback(() => {
    const saved = localStorage.getItem(UNITS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUnitRecord(parsed);
        return parsed as UnitVersionRecord;
      } catch (e) {
        console.error('Failed to load units:', e);
      }
    }
    return null;
  }, []);

  useEffect(() => {
    reloadUnitRecord();
  }, [reloadUnitRecord]);

  /**
   * 状態保存・永続化・リロード
   */
  const updateAndSaveRecord = useCallback(
    (nextRecord: UnitVersionRecord) => {
      setUnitRecord(nextRecord);
      try {
        localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(nextRecord));
      } catch (e) {
        console.error('Failed to save units:', e);
      }
      reloadWorkbook?.();
    },
    [reloadWorkbook]
  );

  /**
   * 取得ユーティリティ
   */
  const getProblemUnit = useCallback(
    (id: string | undefined) => (id ? unitRecord[id] || null : null),
    [unitRecord]
  );

  const getProblemUnits = useCallback(
    (paths: string[], filterIds?: string[]) => {
      return paths
        .map((path) => unitRecord[path])
        .filter((unit): unit is ProblemUnit => {
          // 1. まずユニットが存在するかチェック
          if (!unit) return false;
          // 2. フィルター配列がない場合はすべて通す
          if (!filterIds) return true;
          // 3. フィルター配列がある場合は、含まれているかチェック
          return filterIds.includes(unit.unitId);
        });
    },
    [unitRecord]
  );

  const getProblemUnitsByIds = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      units: ProblemUnit[] = Object.values(unitRecord)
    ): ProblemUnit[] => {
      return units.filter(
        (unit) =>
          unit.problemListId === problemListId &&
          unit.workbookId === workbookId &&
          unit.hierarchyId === hierarchyId
      );
    },
    [unitRecord]
  );

  /**
   * 共通処理: 特定階層の全ユニットの problemNumber を1から振り直す
   * 既存の sortedUnits の各ユニットを走査し、番号が変わるものは新IDで保存し、パスを置換する
   */
  const reindexHierarchyUnits = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      currentRecord: UnitVersionRecord,
      additionalUnits: { index: number; units: ProblemUnit[] } = { index: 0, units: [] }
    ) => {
      const nextRecord = { ...currentRecord };

      // 1. 現在のユニットを番号順に取得
      const existingSortedUnits = getProblemUnitsByIds(workbookId, problemListId, hierarchyId).sort(
        (a, b) => (a.problems[0]?.problemNumber || 0) - (b.problems[0]?.problemNumber || 0)
      );

      // 2. 新規ユニットを指定位置に挿入した仮想的な全リストを作成
      const combinedUnits = [...existingSortedUnits];
      combinedUnits.splice(additionalUnits.index, 0, ...additionalUnits.units);

      let currentNum = 1;
      const finalNewUnitIds: string[] = []; // 新規追加されたユニットの新しいID群

      combinedUnits.forEach((unit) => {
        const isNewlyAdded = additionalUnits.units.includes(unit);

        // 番号がずれている、または新規追加されたユニットの場合は新バージョンを発行
        const needsNewVersion = isNewlyAdded || unit.problems[0]?.problemNumber !== currentNum;

        if (needsNewVersion) {
          const newId = generateId();
          const updatedUnit: ProblemUnit = {
            ...unit,
            unitId: newId,
            problems: unit.problems.map((p) => ({
              ...p,
              problemNumber: currentNum++,
            })),
          };

          nextRecord[newId] = updatedUnit;

          if (isNewlyAdded) {
            finalNewUnitIds.push(newId);
          } else {
            // 既存ユニットのIDが変わった場合は、階層側のパスを置換
            onReplaceUnitPath(workbookId, problemListId, hierarchyId, unit.unitId, newId);
          }
        } else {
          // 番号が変わらない既存ユニット
          currentNum += unit.problems.length;
        }
      });

      updateAndSaveRecord(nextRecord);
      return finalNewUnitIds;
    },
    [getProblemUnitsByIds, onReplaceUnitPath, updateAndSaveRecord]
  );

  /**
   * 2. Unit一括追加
   */
  const insertUnitsToHierarchy = useCallback(
    ({
      workbookId,
      problemListId,
      hierarchyId,
      dataList,
      index,
    }: {
      workbookId: string;
      problemListId: string;
      hierarchyId: string;
      dataList: ProblemUnitData[];
      index?: number;
    }) => {
      // 既存ユニットのリストを取得して挿入位置を確定
      const sameHierarchyUnits = getProblemUnitsByIds(workbookId, problemListId, hierarchyId).sort(
        (a, b) => (a.problems[0]?.problemNumber || 0) - (b.problems[0]?.problemNumber || 0)
      );
      const targetIndex = index ?? sameHierarchyUnits.length;

      // 追加するユニットの雛形（IDや番号は reindex 内で確定させる）
      const newUnitsToInsert = dataList.map(
        (data) =>
          ({
            ...data,
            unitId: '', // placeholder
            workbookId,
            problemListId,
            hierarchyId,
            lastAttemptedAt: 0,
            answerStructureId: generateId(),
            problems: data.answers.map((ans) => ({ problemNumber: 0, answer: ans })),
          }) as ProblemUnit
      );

      // 共通リマッピング処理を実行
      const newPathIds = reindexHierarchyUnits(workbookId, problemListId, hierarchyId, unitRecord, {
        index: targetIndex,
        units: newUnitsToInsert,
      });

      // 階層側にパスを追加
      onAddUnitPaths(workbookId, problemListId, hierarchyId, newPathIds, targetIndex);

      return newPathIds;
    },
    [unitRecord, getProblemUnitsByIds, reindexHierarchyUnits, onAddUnitPaths]
  );

  /**
   * 4. Unit編集
   */
  const updateUnit = useCallback(
    (unitId: string, newData: ProblemUnitData) => {
      const currentUnit = unitRecord[unitId];
      if (!currentUnit) return;

      const isAnswerUnchanged =
        currentUnit.problems.length === newData.answers.length &&
        currentUnit.problems.every((p, i) => p.answer === newData.answers[i]);

      const structureId = isAnswerUnchanged ? currentUnit.answerStructureId : generateId();

      // 更新後のデータを持つ仮オブジェクトを作成（IDなし）
      const updatedUnitBase: ProblemUnit = {
        ...currentUnit,
        ...newData,
        lastAttemptedAt: 0,
        answerStructureId: structureId,
        problems: newData.answers.map((ans) => ({
          problemNumber: 0, // placeholder
          answer: ans,
        })),
      };

      // 既存レコードの中で対象の unitId を持つものを一時的に置換した状態で reindex を走らせる
      // 実際には update される unit も reindex の過程で new ID になる
      const nextRecordPreUpdate = { ...unitRecord, [unitId]: updatedUnitBase };

      return reindexHierarchyUnits(
        currentUnit.workbookId,
        currentUnit.problemListId,
        currentUnit.hierarchyId,
        nextRecordPreUpdate
      );
    },
    [unitRecord, reindexHierarchyUnits]
  );

  return {
    unitRecord,
    reloadUnitRecord,
    getProblemUnit,
    getProblemUnits,
    insertUnitsToHierarchy,
    removeUnitFromHierarchy: onRemoveUnitPath,
    updateUnit,
  };
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateId } from '@/shared/functions/generate-id';
import { findHierarchy } from '@/shared/functions/workbook-utils';
import { ProblemUnit, ProblemUnitData, UnitVersionRecord } from '@/shared/types/app.types';
import { useHierarchyData } from './useHierarchyData';

const UNITS_STORAGE_KEY = 'app_units_record';

export const useProblemUnitData = (reloadWorkbook?: () => void) => {
  const [unitRecord, setUnitRecord] = useState<UnitVersionRecord>({});

  // onUpdateHierarchyPaths を使用するために取得
  const { workbooks, onUpdateHierarchyPaths, onRemoveUnitPath } = useHierarchyData(reloadWorkbook);

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

  const getProblemUnit = useCallback(
    (id: string | undefined) => (id ? unitRecord[id] || null : null),
    [unitRecord]
  );

  const getProblemUnits = useCallback(
    (paths: string[], filterIds?: string[]) => {
      return paths
        .map((path) => unitRecord[path])
        .filter((unit): unit is ProblemUnit => {
          if (!unit) return false;
          if (!filterIds) return true;
          return filterIds.includes(unit.unitId);
        });
    },
    [unitRecord]
  );

  // --------------------------------------------------------
  // コアロジック: リインデックスと一括保存
  // --------------------------------------------------------

  /**
   * 仮想的なユニットリストを受け取り、問題番号を1から振り直して保存する共通処理
   * 階層へのパス反映もここから呼び出し元へ返す情報を元に行います。
   */
  const processAndReindexUnits = useCallback(
    (virtualUnits: ProblemUnit[]) => {
      const nextRecord = { ...unitRecord };
      let currentNum = 1;

      // 結果追跡用
      const newPathsSequence: string[] = []; // 最終的な並び順のIDリスト
      const newlyGeneratedIds: string[] = []; // 今回新規発行されたID

      virtualUnits.forEach((unit) => {
        const isNewEntry = !unit.unitId; // unitIdが空なら新規追加行

        // 再計算が必要か判定
        // 1. 新規追加行である
        // 2. 現在の問題番号開始位置と、ユニットの番号がずれている
        const needsNewVersion = isNewEntry || unit.problems[0]?.problemNumber !== currentNum;

        if (needsNewVersion) {
          const newId = generateId();
          const updatedUnit: ProblemUnit = {
            ...unit,
            unitId: newId,
            problems: unit.problems.map((p) => ({
              ...p,
              problemNumber: currentNum++, // 連番付与
            })),
          };

          nextRecord[newId] = updatedUnit;
          newPathsSequence.push(newId);
          newlyGeneratedIds.push(newId);
        } else {
          // 変更なし（番号も合致している）
          newPathsSequence.push(unit.unitId);
          currentNum += unit.problems.length;
        }
      });

      // LocalStorage更新
      updateAndSaveRecord(nextRecord);

      return {
        newPathsSequence,
        newlyGeneratedIds,
      };
    },
    [unitRecord, updateAndSaveRecord]
  );

  // --------------------------------------------------------
  // 操作アクション
  // --------------------------------------------------------

  /**
   * Unit一括追加
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
      const hierarchy = findHierarchy(workbooks, workbookId, problemListId, hierarchyId);
      if (!hierarchy) return [];

      // 1. 現在の並び順でユニットを展開
      const currentOrderedUnits = hierarchy.unitVersionPaths
        .map((pathId) => unitRecord[pathId])
        .filter((u): u is ProblemUnit => !!u);

      // 2. 挿入用データ作成 (IDは空文字)
      const newUnitsToInsert = dataList.map((data) => {
        const { answers, question, scoring, problemType, answerType } = data;
        return {
          answers,
          question,
          scoring,
          problemType,
          answerType,
          unitId: '', // processAndReindexUnitsで生成
          workbookId,
          problemListId,
          hierarchyId,
          lastAttemptedAt: 0,
          answerStructureId: generateId(),
          problems: data.answers.map((ans) => ({ problemNumber: 0, answer: ans })),
        } as ProblemUnit;
      });

      // 3. 配列に挿入
      const targetIndex = index ?? currentOrderedUnits.length;
      const virtualUnits = [...currentOrderedUnits];
      virtualUnits.splice(targetIndex, 0, ...newUnitsToInsert);

      // 4. 再計算 (Local Storage更新は内部で行われる)
      const { newPathsSequence, newlyGeneratedIds } = processAndReindexUnits(virtualUnits);

      // 5. Hierarchyへの反映: パス配列を一括置換
      onUpdateHierarchyPaths(workbookId, problemListId, hierarchyId, newPathsSequence);

      return newlyGeneratedIds;
    },
    [workbooks, unitRecord, processAndReindexUnits, onUpdateHierarchyPaths]
  );

  /**
   * Unit編集
   */
  const updateUnit = useCallback(
    (unitId: string, newData: ProblemUnitData) => {
      const currentUnit = unitRecord[unitId];
      if (!currentUnit) return;

      const { workbookId, problemListId, hierarchyId } = currentUnit;
      const hierarchy = findHierarchy(workbooks, workbookId, problemListId, hierarchyId);
      if (!hierarchy) return;

      // 1. 変更があるかどうかの厳密なチェック（早期リターン用）
      const isAnswerUnchanged =
        currentUnit.problems.length === newData.answers.length &&
        currentUnit.problems.every((p, i) => p.answer === newData.answers[i]);

      const isSettingsUnchanged =
        currentUnit.question === newData.question &&
        currentUnit.scoring === newData.scoring &&
        currentUnit.problemType === newData.problemType &&
        currentUnit.answerType === newData.answerType;

      // 値が全く変わっていない場合は、何もしない
      if (isAnswerUnchanged && isSettingsUnchanged) {
        return [];
      }

      // 2. 回答構造IDの判定 (回答内容が変わった場合のみ新しいIDを発行)
      const structureId = isAnswerUnchanged ? currentUnit.answerStructureId : generateId();

      // 3. 仮想リスト作成 (対象のみ置換)
      const virtualUnits = hierarchy.unitVersionPaths
        .map((pathId) => {
          const unit = unitRecord[pathId];
          if (!unit) return null;

          if (pathId === unitId) {
            return {
              ...unit,
              ...newData,
              lastAttemptedAt: 0, // 値が変わったので最終取組日時をリセット
              answerStructureId: structureId,
              problems: newData.answers.map((ans) => ({
                problemNumber: 0, // processAndReindexUnits内で決定
                answer: ans,
              })),
            } as ProblemUnit;
          }
          return unit;
        })
        .filter((u): u is ProblemUnit => !!u);

      // 4. 再計算と一括保存
      const { newPathsSequence, newlyGeneratedIds } = processAndReindexUnits(virtualUnits);

      // 5. Hierarchyへの反映
      onUpdateHierarchyPaths(workbookId, problemListId, hierarchyId, newPathsSequence);

      return newlyGeneratedIds;
    },
    [workbooks, unitRecord, processAndReindexUnits, onUpdateHierarchyPaths]
  );

  return {
    unitRecord,
    updateAndSaveRecord,
    reloadUnitRecord,
    getProblemUnit,
    getProblemUnits,
    insertUnitsToHierarchy,
    removeUnitFromHierarchy: onRemoveUnitPath,
    updateUnit,
  };
};

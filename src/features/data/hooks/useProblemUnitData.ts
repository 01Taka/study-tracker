import { useCallback, useEffect, useState } from 'react';
import { generateId } from '@/shared/functions/generate-id';
import { ProblemUnit, ProblemUnitData, UnitVersionRecord } from '@/shared/types/app.types';
import { useHierarchyData } from './useHierarchyData';

const UNITS_STORAGE_KEY = 'app_units_record';

export const useProblemUnitData = (reloadWorkbook?: () => void) => {
  const [unitRecord, setUnitRecord] = useState<UnitVersionRecord>({});

  // reloadWorkbook を useHierarchyData にもリレーする
  const { onAddUnitPaths, onRemoveUnitPath, onReplaceUnitPath } = useHierarchyData(reloadWorkbook);

  /**
   * ローカルストレージから最新状態を強制再読み込みする関数
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

  // 初期ロード
  useEffect(() => {
    reloadUnitRecord();
  }, [reloadUnitRecord]);

  /**
   * 状態更新、LocalStorage保存、さらにワークブックのリロードを順に行う
   */
  const updateAndSaveRecord = useCallback(
    (nextRecord: UnitVersionRecord) => {
      // 1. Reactの状態を更新
      setUnitRecord(nextRecord);

      // 2. localStorageに保存
      try {
        localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(nextRecord));
      } catch (e) {
        console.error('Failed to save units:', e);
      }

      // 3. 外部のリロード関数を呼び出す
      reloadWorkbook?.();
    },
    [reloadWorkbook]
  );

  const getProblemUnit = useCallback(
    (id: string | undefined) => (id ? unitRecord[id] || null : null),
    [unitRecord]
  );

  const getProblemUnits = useCallback(
    (paths: string[]) => paths.map((path) => unitRecord[path]).filter(Boolean),
    [unitRecord]
  );

  /**
   * 1. Record追加
   */
  const addUnitRecord = useCallback(
    (data: ProblemUnitData, answerStructureId?: string): string => {
      const newUnitId = generateId();
      const newUnit: ProblemUnit = {
        ...data,
        unitId: newUnitId,
        lastAttemptedAt: 0,
        answerStructureId: answerStructureId || generateId(),
      };

      setUnitRecord((prev) => {
        const next = { ...prev, [newUnitId]: newUnit };
        updateAndSaveRecord(next);
        return next;
      });

      return newUnitId;
    },
    [updateAndSaveRecord]
  );

  /**
   * 2. Unit一括追加
   */
  const addUnitsToHierarchy = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      dataList: ProblemUnitData[]
    ) => {
      let currentRecord = { ...unitRecord };
      const newIds: string[] = [];

      dataList.forEach((data) => {
        const newUnitId = generateId();
        const newUnit: ProblemUnit = {
          ...data,
          unitId: newUnitId,
          lastAttemptedAt: 0,
          answerStructureId: generateId(),
        };
        currentRecord[newUnitId] = newUnit;
        newIds.push(newUnitId);
      });

      // 保存 + reloadWorkbook
      updateAndSaveRecord(currentRecord);

      // Hierarchy側の更新 (ここでも内部で reloadWorkbook が呼ばれる)
      onAddUnitPaths(workbookId, problemListId, hierarchyId, newIds);

      return newIds;
    },
    [unitRecord, updateAndSaveRecord, onAddUnitPaths]
  );

  /**
   * 4. Unit編集
   */
  const updateUnit = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      unitId: string,
      newData: ProblemUnitData
    ) => {
      const currentUnit = unitRecord[unitId];
      if (!currentUnit) return;

      const isAnswerUnchanged =
        currentUnit.answers.length === newData.answers.length &&
        currentUnit.answers.every((val, index) => val === newData.answers[index]);

      const structureId = isAnswerUnchanged ? currentUnit.answerStructureId : generateId();

      const newUnitId = generateId();
      const newUnit: ProblemUnit = {
        ...newData,
        unitId: newUnitId,
        lastAttemptedAt: 0,
        answerStructureId: structureId,
      };

      const nextRecord = { ...unitRecord, [newUnitId]: newUnit };
      updateAndSaveRecord(nextRecord);

      onReplaceUnitPath(workbookId, problemListId, hierarchyId, unitId, newUnitId);
      return newUnitId;
    },
    [unitRecord, updateAndSaveRecord, onReplaceUnitPath]
  );

  return {
    unitRecord,
    reloadUnitRecord,
    getProblemUnit,
    getProblemUnits,
    addUnitRecord,
    addUnitsToHierarchy,
    removeUnitFromHierarchy: onRemoveUnitPath,
    updateUnit,
  };
};

import { useCallback, useEffect, useState } from 'react';
import { generateId } from '@/shared/functions/generate-id';
import { ProblemUnit, ProblemUnitData, UnitVersionRecord } from '@/shared/types/app.types';
import { useHierarchyData } from './useHierarchyData';

const UNITS_STORAGE_KEY = 'app_units_record';

export const useProblemUnitData = () => {
  const [unitRecord, setUnitRecord] = useState<UnitVersionRecord>({});

  // 引数なしで初期化
  const { onAddUnitPaths, onRemoveUnitPath, onReplaceUnitPath } = useHierarchyData();

  // --- 中略 (load/save/get系は変更なし) ---
  useEffect(() => {
    const saved = localStorage.getItem(UNITS_STORAGE_KEY);
    if (saved) {
      try {
        setUnitRecord(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(unitRecord));
  }, [unitRecord]);

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
  const addUnitRecord = useCallback((data: ProblemUnitData, answerStructureId?: string): string => {
    const newUnitId = generateId();
    const newUnit: ProblemUnit = {
      ...data,
      unitId: newUnitId,
      lastAttemptedAt: 0,
      answerStructureId: answerStructureId || generateId(),
    };
    setUnitRecord((prev) => ({ ...prev, [newUnitId]: newUnit }));
    return newUnitId;
  }, []);

  /**
   * 2. Unit一括追加 (IDをリレー)
   */
  const addUnitsToHierarchy = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      dataList: ProblemUnitData[]
    ) => {
      const newIds = dataList.map((data) => addUnitRecord(data));
      onAddUnitPaths(workbookId, problemListId, hierarchyId, newIds);
      return newIds;
    },
    [addUnitRecord, onAddUnitPaths]
  );

  /**
   * 3. Unit削除 (IDをリレー)
   */
  const removeUnitFromHierarchy = useCallback(
    (workbookId: string, problemListId: string, hierarchyId: string, targetPath: string) => {
      onRemoveUnitPath(workbookId, problemListId, hierarchyId, targetPath);
    },
    [onRemoveUnitPath]
  );

  /**
   * 4. Unit編集 (IDをリレー)
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
      const newUnitId = addUnitRecord(newData, structureId);

      onReplaceUnitPath(workbookId, problemListId, hierarchyId, unitId, newUnitId);
      return newUnitId;
    },
    [unitRecord, addUnitRecord, onReplaceUnitPath]
  );

  return {
    unitRecord,
    getProblemUnit,
    getProblemUnits,
    addUnitRecord,
    addUnitsToHierarchy,
    removeUnitFromHierarchy,
    updateUnit,
  };
};

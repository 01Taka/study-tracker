import { useCallback, useEffect, useState } from 'react';
import { generateId } from '@/shared/functions/generate-id';
import { HierarchyArchiveRecord, UserDefinedHierarchy } from '@/shared/types/app.types';

const HIERARCHY_STORAGE_KEY = 'app_hierarchy_record';

export const useHierarchyArchive = (reloadWorkbook?: () => void) => {
  const [hierarchyRecord, setHierarchyRecord] = useState<HierarchyArchiveRecord>({});

  /**
   * 1. データの読み込み
   */
  const reloadHierarchyRecord = useCallback(() => {
    const saved = localStorage.getItem(HIERARCHY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHierarchyRecord(parsed);
        return parsed as HierarchyArchiveRecord;
      } catch (e) {
        console.error('Failed to load hierarchies:', e);
      }
    }
    return null;
  }, []);

  /**
   * 2. 初回マウント時に同期
   */
  useEffect(() => {
    reloadHierarchyRecord();
  }, [reloadHierarchyRecord]);

  /**
   * 3. データの保存
   */
  const updateAndSaveHierarchyRecord = useCallback(
    (nextRecord: HierarchyArchiveRecord) => {
      setHierarchyRecord(nextRecord);
      try {
        localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(nextRecord));
      } catch (e) {
        console.error('Failed to save hierarchies:', e);
      }
      // 必要に応じてワークブック全体を再読み込み
      reloadWorkbook?.();
    },
    [reloadWorkbook]
  );

  /**
   * 4. 単一階層の取得
   */
  const getHierarchy = useCallback(
    (id: string | undefined) => (id ? hierarchyRecord[id] || null : null),
    [hierarchyRecord]
  );

  /**
   * 5. 特定のProblemListに属する階層リストの取得
   */
  const getHierarchiesByList = useCallback(
    (problemListId: string) => {
      return Object.values(hierarchyRecord).filter((h) => h.problemListId === problemListId);
    },
    [hierarchyRecord]
  );

  /**
   * 6. パス（unitAchieveIds）の更新用ショートカット
   */
  const updateHierarchyPaths = useCallback(
    (hierarchyId: string, nextUnitIds: string[]) => {
      const current = hierarchyRecord[hierarchyId];
      if (!current) return;

      const nextRecord: HierarchyArchiveRecord = {
        ...hierarchyRecord,
        [hierarchyId]: {
          ...current,
          unitAchieveIds: nextUnitIds,
        },
      };
      updateAndSaveHierarchyRecord(nextRecord);
    },
    [hierarchyRecord, updateAndSaveHierarchyRecord]
  );

  /**
   * 7. 階層の追加
   * IDがない場合は自動生成し、既存のRecordにマージして保存します。
   */
  const addHierarchy = useCallback(
    (hierarchy: Partial<UserDefinedHierarchy> & Omit<UserDefinedHierarchy, 'hierarchyId'>) => {
      // IDが指定されていない、または空の場合は新規発行
      const id = hierarchy.hierarchyId || generateId();

      const newHierarchy: UserDefinedHierarchy = {
        ...hierarchy,
        hierarchyId: id,
      };

      const nextRecord: HierarchyArchiveRecord = {
        ...hierarchyRecord,
        [id]: newHierarchy,
      };

      updateAndSaveHierarchyRecord(nextRecord);

      return newHierarchy; // 生成されたIDを含むオブジェクトを返す
    },
    [hierarchyRecord, updateAndSaveHierarchyRecord]
  );

  return {
    hierarchyRecord,
    reloadHierarchyRecord,
    updateAndSaveHierarchyRecord,
    getHierarchy,
    getHierarchiesByList,
    updateHierarchyPaths,
    addHierarchy,
  };
};

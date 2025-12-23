import { useCallback } from 'react';
import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { generateId } from '@/shared/functions/generate-id';
import { UserDefinedHierarchy, Workbook } from '@/shared/types/app.types';
import { useHierarchyArchive } from './useHierarchyArchive';

export const useHierarchyData = () => {
  const { workbooks, updateWorkbooks } = useWorkbookData();
  const { hierarchyRecord, updateAndSaveHierarchyRecord } = useHierarchyArchive();

  /**
   * 1. 階層の新規作成
   * 実体は hierarchyRecord へ、参照IDは Workbook 側へ保存します。
   */
  const onCreateHierarchy = useCallback(
    (workbookId: string, problemListId: string, data: { name: string }) => {
      const newId = generateId();
      const newHierarchy: UserDefinedHierarchy = {
        hierarchyId: newId,
        problemListId,
        workbookId,
        name: data.name,
        unitAchieveIds: [],
      };

      // A. 実体データの保存 (HierarchyArchive)
      const nextRecord = { ...hierarchyRecord, [newId]: newHierarchy };
      updateAndSaveHierarchyRecord(nextRecord);

      // B. 構造の更新 (Workbook 側の ID リスト)
      updateWorkbooks((prevWorkbooks) =>
        prevWorkbooks.map((wb): Workbook => {
          if (wb.id !== workbookId) return wb;
          return {
            ...wb,
            problemLists: wb.problemLists.map((pl) => {
              if (pl.id !== problemListId) return pl;
              return {
                ...pl,
                // IDのポインタのみを追加
                currentHierarchyAchieveIds: [...pl.currentHierarchyAchieveIds, newId],
              };
            }),
          };
        })
      );
    },
    [hierarchyRecord, updateAndSaveHierarchyRecord, updateWorkbooks]
  );

  /**
   * 2. 階層の削除
   * 実体と参照の両方を削除します。
   */
  const onDeleteHierarchy = useCallback(
    (workbookId: string, problemListId: string, hierarchyId: string) => {
      // A. 実体データの削除
      const { [hierarchyId]: _, ...nextRecord } = hierarchyRecord;
      updateAndSaveHierarchyRecord(nextRecord);

      // B. 構造の更新 (IDリストからの除外)
      updateWorkbooks((prevWorkbooks) =>
        prevWorkbooks.map((wb): Workbook => {
          if (wb.id !== workbookId) return wb;
          return {
            ...wb,
            problemLists: wb.problemLists.map((pl) => {
              if (pl.id !== problemListId) return pl;
              return {
                ...pl,
                currentHierarchyAchieveIds: pl.currentHierarchyAchieveIds.filter(
                  (id) => id !== hierarchyId
                ),
              };
            }),
          };
        })
      );
    },
    [hierarchyRecord, updateAndSaveHierarchyRecord, updateWorkbooks]
  );

  /**
   * 3. ユニットパスの削除 (単一削除)
   * ※実体(hierarchyRecord)内の ID 配列を更新します。
   * Workbook側の構造に変更はないため、updateWorkbooks は呼び出しません。
   */
  const onRemoveUnitPath = useCallback(
    (hierarchyId: string, targetPath: string) => {
      const targetHierarchy = hierarchyRecord[hierarchyId];
      if (!targetHierarchy) return;

      const nextHierarchy: UserDefinedHierarchy = {
        ...targetHierarchy,
        unitAchieveIds: targetHierarchy.unitAchieveIds.filter((id) => id !== targetPath),
      };

      updateAndSaveHierarchyRecord({
        ...hierarchyRecord,
        [hierarchyId]: nextHierarchy,
      });
    },
    [hierarchyRecord, updateAndSaveHierarchyRecord]
  );

  /**
   * 4. 階層内のパス配列を完全に置き換える (一括更新用)
   * ※再インデックス時などに使用。実体側のみ更新。
   */
  const onUpdateHierarchyPaths = useCallback(
    (hierarchyId: string, newPaths: string[]) => {
      const targetHierarchy = hierarchyRecord[hierarchyId];
      if (!targetHierarchy) return;

      const nextHierarchy: UserDefinedHierarchy = {
        ...targetHierarchy,
        unitAchieveIds: newPaths,
      };

      updateAndSaveHierarchyRecord({
        ...hierarchyRecord,
        [hierarchyId]: nextHierarchy,
      });
    },
    [hierarchyRecord, updateAndSaveHierarchyRecord]
  );

  return {
    workbooks,
    hierarchyRecord,
    onCreateHierarchy,
    onDeleteHierarchy,
    onRemoveUnitPath,
    onUpdateHierarchyPaths,
  };
};

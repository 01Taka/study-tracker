import { useCallback, useMemo } from 'react';
import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { generateId } from '@/shared/functions/generate-id';
import { ProblemList, UserDefinedHierarchy } from '@/shared/types/app.types';
import { useHierarchyArchive } from './useHierarchyArchive';

export const useProblemListData = (workbookId: string) => {
  const { workbooks, updateWorkbooks } = useWorkbookData();
  const { addHierarchy } = useHierarchyArchive();

  /**
   * 原因対策: workbooks 自体を依存配列に入れ、
   * ステートが更新されたら必ず再計算されるようにする
   */
  const currentWorkbook = useMemo(() => {
    return workbooks.find((wb) => wb.id === workbookId) || null;
  }, [workbooks, workbookId]); // getWorkbook ではなく生の workbooks を監視

  const problemLists = useMemo(() => {
    return currentWorkbook?.problemLists || [];
  }, [currentWorkbook]);

  const onCreateProblemList = useCallback(
    (data: { name: string; defaultHierarchyName: string }) => {
      const newProblemListId = generateId();
      const newHierarchyId = generateId();

      const defaultHierarchy: UserDefinedHierarchy = {
        hierarchyId: newHierarchyId,
        problemListId: newProblemListId,
        workbookId,
        name: data.defaultHierarchyName,
        unitAchieveIds: [],
      };

      addHierarchy(defaultHierarchy);

      const newProblemList: ProblemList = {
        id: newProblemListId,
        name: data.name,
        createdAt: Date.now(),
        currentHierarchyAchieveIds: [newHierarchyId],
      };

      // 保存機能付きの updater を使用
      updateWorkbooks((latestWorkbooks) =>
        latestWorkbooks.map((wb) =>
          wb.id === workbookId ? { ...wb, problemLists: [...wb.problemLists, newProblemList] } : wb
        )
      );
    },
    [workbookId, updateWorkbooks, addHierarchy]
  );

  const getProblemList = useCallback(
    (problemListId: string | undefined): ProblemList | null => {
      if (!problemListId || !currentWorkbook) return null;
      return currentWorkbook.problemLists.find((pl) => pl.id === problemListId) || null;
    },
    [currentWorkbook]
  );

  return {
    currentWorkbook,
    problemLists,
    onCreate: onCreateProblemList,
    getProblemList,
    workbookName: currentWorkbook?.name || '',
  };
};

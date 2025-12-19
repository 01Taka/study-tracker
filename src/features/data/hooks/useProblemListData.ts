import { useCallback, useMemo } from 'react';
import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { generateId } from '@/shared/functions/generate-id';
import { ProblemList } from '@/shared/types/app.types';

export const useProblemListData = (workbookId: string) => {
  const { workbooks, setWorkbooks, getWorkbook } = useWorkbookData();

  // 対象のワークブックを特定
  const currentWorkbook = useMemo(() => getWorkbook(workbookId), [workbooks, workbookId]);

  // 表示用のリスト
  const problemLists = useMemo(() => currentWorkbook?.problemLists || [], [currentWorkbook]);

  const onCreateProblemList = useCallback(
    (data: { name: string }) => {
      const newProblemList: ProblemList = {
        id: generateId(),
        name: data.name,
        createdAt: Date.now(),
        hierarchies: [],
      };

      setWorkbooks((prev) =>
        prev.map((wb) =>
          wb.id === workbookId ? { ...wb, problemLists: [...wb.problemLists, newProblemList] } : wb
        )
      );
    },
    [workbookId, setWorkbooks]
  );

  /**
   * 特定のIDのproblemListを取得する
   */
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

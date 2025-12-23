import { useCallback } from 'react';
import { useAppStore } from '@/features/data/store/useAppStore';
import { generateId } from '@/shared/functions/generate-id';
import { Workbook } from '@/shared/types/app.types';

export const useWorkbookData = () => {
  const workbooks = useAppStore((state) => state.workbooks);
  const setWorkbooks = useAppStore((state) => state.setWorkbooks);

  /**
   * ワークブックデータの更新
   */
  const updateWorkbooks = useCallback(
    (updater: (latest: Workbook[]) => Workbook[]) => {
      // 最新のstate（workbooks）を元に更新
      const next = updater(workbooks);
      setWorkbooks(next);
    },
    [workbooks, setWorkbooks]
  );

  /**
   * ワークブックの新規作成
   */
  const onCreate = useCallback(
    (data: { name: string }) => {
      const newWorkbook: Workbook = {
        id: generateId(),
        name: data.name,
        createdAt: Date.now(),
        problemLists: [],
      };
      setWorkbooks([...workbooks, newWorkbook]);
    },
    [workbooks, setWorkbooks]
  );

  const getWorkbook = useCallback(
    (id: string | undefined) => {
      return workbooks.find((w) => w.id === id) || null;
    },
    [workbooks]
  );

  return {
    workbooks,
    updateWorkbooks,
    onCreate,
    getWorkbook,
  };
};

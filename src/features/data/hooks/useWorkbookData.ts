import { useCallback, useEffect, useState } from 'react';
import { generateId } from '@/shared/functions/generate-id';
import { Workbook } from '@/shared/types/app.types';

const STORAGE_KEY = 'app_workbooks_data';

export const useWorkbookData = () => {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);

  /**
   * ストレージから直接データを読み取る（同期）
   */
  const getLatestWorkbooksFromStorage = useCallback((): Workbook[] => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return [];
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('Failed to parse storage data:', e);
      return [];
    }
  }, []);

  /**
   * 明示的な保存関数
   */
  const saveWorkbooks = useCallback((updatedWorkbooks: Workbook[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkbooks));
      setWorkbooks(updatedWorkbooks);
    } catch (e) {
      console.error('Failed to save workbooks:', e);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    setWorkbooks(getLatestWorkbooksFromStorage());
  }, [getLatestWorkbooksFromStorage]);

  /**
   * ワークブックデータの更新
   * 引数のupdaterにはストレージから読み取った最新のデータが渡される
   */
  const updateWorkbooks = useCallback(
    (updater: (latest: Workbook[]) => Workbook[]) => {
      // 1. ストレージから最新の状態を取得
      const latestFromStorage = getLatestWorkbooksFromStorage();

      // 2. 最新の状態に対して更新を適用
      const next = updater(latestFromStorage);

      // 3. ストレージに保存し、Reactのステートも更新
      saveWorkbooks(next);
    },
    [getLatestWorkbooksFromStorage, saveWorkbooks]
  );

  /**
   * ワークブックの新規作成
   */
  const onCreate = useCallback(
    (data: { name: string }) => {
      updateWorkbooks((prev) => [
        ...prev,
        {
          id: generateId(),
          name: data.name,
          createdAt: Date.now(),
          problemLists: [],
        },
      ]);
    },
    [updateWorkbooks]
  );

  const getWorkbook = useCallback(
    (id: string | undefined) => {
      return workbooks.find((w) => w.id === id) || null;
    },
    [workbooks]
  );

  return {
    workbooks,
    setWorkbooks: updateWorkbooks,
    onCreate,
    getWorkbook,
    saveWorkbooks,
  };
};

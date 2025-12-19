import { useCallback, useEffect, useState } from 'react';
import { generateId } from '@/shared/functions/generate-id';
import { Workbook } from '@/shared/types/app.types';

const STORAGE_KEY = 'app_workbooks_data';

export const useWorkbookData = () => {
  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);

  // 読み込み
  const loadWorkbooks = useCallback(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setWorkbooks(JSON.parse(savedData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    loadWorkbooks();
  }, [loadWorkbooks]);

  // 保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workbooks));
  }, [workbooks]);

  // 新規作成
  const onCreate = useCallback((data: { name: string }) => {
    const newWorkbook: Workbook = {
      id: generateId(),
      name: data.name,
      createdAt: Date.now(),
      problemLists: [], // ここに直接データが入る
    };
    setWorkbooks((prev) => [...prev, newWorkbook]);
  }, []);

  const getWorkbook = useCallback(
    (id: string | undefined) => {
      return workbooks.find((w) => w.id === id) || null;
    },
    [workbooks]
  );

  return { workbooks, setWorkbooks, onCreate, getWorkbook };
};

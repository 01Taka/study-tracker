import { useCallback } from 'react';
import { transformWorkbooksToJSON } from '@/shared/functions/json/export';
import { importWorkbooksFromJSON } from '@/shared/functions/json/import';
import { UnitVersionRecord, Workbook } from '@/shared/types/app.types';

export const useWorkbookTransfer = (
  workbooks: Workbook[],
  unitRecord: UnitVersionRecord,
  updateWorkbooks: (updater: (latest: Workbook[]) => Workbook[]) => void,
  updateAndSaveUnitRecord: (nextRecord: UnitVersionRecord) => void
) => {
  /**
   * 指定したIDのワークブック配列をJSON文字列として書き出す
   */
  const exportWorkbooks = useCallback(
    (ids: string[]): string => {
      const targetWorkbooks = workbooks.filter((wb) => ids.includes(wb.id));
      return transformWorkbooksToJSON(targetWorkbooks, unitRecord);
    },
    [workbooks, unitRecord]
  );

  /**
   * JSON文字列を読み込み、現在のデータに追加する
   */
  const importWorkbooks = useCallback(
    (jsonString: string) => {
      try {
        const { workbooks: importedWorkbooks, unitRecords: importedUnits } =
          importWorkbooksFromJSON(jsonString);

        // 1. Workbook一覧に新しいWorkbookを追加
        updateWorkbooks((prev) => [...prev, ...importedWorkbooks]);

        // 2. UnitRecordに新しいUnit群を追加（マージ）
        updateAndSaveUnitRecord({
          ...unitRecord,
          ...importedUnits,
        });

        return { success: true, count: importedWorkbooks.length };
      } catch (e) {
        console.error('Import failed:', e);
        return { success: false, error: e };
      }
    },
    [unitRecord, updateWorkbooks, updateAndSaveUnitRecord]
  );

  return {
    exportWorkbooks,
    importWorkbooks,
  };
};

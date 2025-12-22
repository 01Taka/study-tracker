import { UnitVersionRecord, Workbook } from '@/shared/types/app.types';
import { ExportedWorkbookBundle } from '@/shared/types/json.types';

/**
 * 複数のWorkbookをコンテンツデータに変換し、JSON文字列にする
 */
export function transformWorkbooksToJSON(
  workbooks: Workbook[],
  unitRecords: UnitVersionRecord
): string {
  const bundle: ExportedWorkbookBundle = {
    workbooks: workbooks.map((wb) => {
      return {
        name: wb.name,
        problemLists: wb.problemLists.map((list) => ({
          name: list.name,
          hierarchies: list.hierarchies.map((hiero) => ({
            name: hiero.name,
            units: hiero.unitVersionPaths
              .map((path) => unitRecords[path])
              .filter(Boolean) // 念のため存在チェック
              .map((unit) => {
                const {
                  unitId,
                  problemListId,
                  workbookId,
                  hierarchyId,
                  lastAttemptedAt,
                  answerStructureId,
                  ...cleanUnit
                } = unit;
                return cleanUnit;
              }),
          })),
        })),
      };
    }),
  };

  return JSON.stringify(bundle, null, 2);
}

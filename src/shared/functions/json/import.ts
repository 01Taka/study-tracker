import {
  ProblemList,
  ProblemUnit,
  UnitArchiveRecord,
  UserDefinedHierarchy,
  Workbook,
} from '@/shared/types/app.types';
import { ExportedWorkbookBundle } from '@/shared/types/json.types';
import { generateId } from '../generate-id';

/**
 * 配列形式のJSONから複数のWorkbookと全UnitRecordsを復元する
 */
export function importWorkbooksFromJSON(jsonString: string): {
  workbooks: Workbook[];
  unitRecords: UnitArchiveRecord;
} {
  const data: ExportedWorkbookBundle = JSON.parse(jsonString);
  const now = Date.now();
  const allUnitRecords: UnitArchiveRecord = {};

  const workbooks: Workbook[] = data.workbooks.map((wbData) => {
    const workbookId = generateId();

    const problemLists: ProblemList[] = wbData.problemLists.map((listData) => {
      const problemListId = generateId();

      const hierarchies: UserDefinedHierarchy[] = listData.hierarchies.map((hieroData) => {
        const hierarchyId = generateId();
        const unitAchieveIds: string[] = [];

        hieroData.units.forEach((unitData) => {
          const unitId = generateId();

          const newUnit: ProblemUnit = {
            ...unitData,
            unitId,
            problemListId,
            workbookId,
            hierarchyId,
            lastAttemptedAt: 0,
            answerStructureId: generateId(),
          };

          allUnitRecords[unitId] = newUnit;
          unitAchieveIds.push(unitId);
        });

        return {
          id: hierarchyId,
          name: hieroData.name,
          unitAchieveIds,
        };
      });

      return {
        id: problemListId,
        name: listData.name,
        createdAt: now,
        hierarchies,
      };
    });

    return {
      id: workbookId,
      name: wbData.name,
      createdAt: now,
      problemLists,
    };
  });

  return { workbooks, unitRecords: allUnitRecords };
}

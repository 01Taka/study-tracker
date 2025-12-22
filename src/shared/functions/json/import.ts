import {
  ProblemList,
  ProblemUnit,
  UnitVersionRecord,
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
  unitRecords: UnitVersionRecord;
} {
  const data: ExportedWorkbookBundle = JSON.parse(jsonString);
  const now = Date.now();
  const allUnitRecords: UnitVersionRecord = {};

  const workbooks: Workbook[] = data.workbooks.map((wbData) => {
    const workbookId = generateId();

    const problemLists: ProblemList[] = wbData.problemLists.map((listData) => {
      const problemListId = generateId();

      const hierarchies: UserDefinedHierarchy[] = listData.hierarchies.map((hieroData) => {
        const hierarchyId = generateId();
        const unitVersionPaths: string[] = [];

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
          unitVersionPaths.push(unitId);
        });

        return {
          id: hierarchyId,
          name: hieroData.name,
          unitVersionPaths,
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

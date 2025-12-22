import { UserDefinedHierarchy, Workbook } from '../types/app.types';

/**
 * 指定されたIDに一致するヒエラルキーを検索する
 */
export function findHierarchy(
  workbooks: Workbook[],
  workbookId: string,
  problemListId: string,
  hierarchyId: string
): UserDefinedHierarchy | undefined {
  // 1. ワークブックを検索
  const workbook = workbooks.find((wb) => wb.id === workbookId);
  if (!workbook) return undefined;

  // 2. 問題リストを検索
  const problemList = workbook.problemLists.find((pl) => pl.id === problemListId);
  if (!problemList) return undefined;

  // 3. ヒエラルキーを検索して返す
  return problemList.hierarchies.find((h) => h.id === hierarchyId);
}

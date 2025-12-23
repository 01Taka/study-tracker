import { ProblemList, ProblemUnit, ProblemUnitProblem, UserDefinedHierarchy } from './app.types';

/** * エクスポート用：問題ユニットの設問
 */
export type ExportableProblemUnitProblem = Omit<ProblemUnitProblem, 'problemNumber'>;

/** * エクスポート用：問題ユニット
 * メタデータや履歴情報を除外
 */
export type ExportableProblemUnit = Omit<
  ProblemUnit,
  | 'unitId'
  | 'problemListId'
  | 'workbookId'
  | 'hierarchyId'
  | 'lastAttemptedAt'
  | 'answerStructureId'
  | 'problems'
> & {
  problems: ProblemUnitProblem[]; // 設問番号は構造維持のため保持（またはanswerのみの配列に変換）
};

/** * エクスポート用：ユーザー定義階層
 */
export type ExportableUserDefinedHierarchy = Omit<UserDefinedHierarchy, 'id' | 'unitAchieveIds'> & {
  units: ExportableProblemUnit[]; // IDの配列ではなく実体をネストさせる
};

/** * エクスポート用：問題リスト
 */
export type ExportableProblemList = Omit<ProblemList, 'id' | 'createdAt' | 'hierarchies'> & {
  hierarchies: ExportableUserDefinedHierarchy[];
};

/** * エクスポート用：ワークブック全体（最終形）
 */
export interface ExportableWorkbook {
  name: string;
  problemLists: ExportableProblemList[];
}

/** * JSONファイルとして保存される際のルート構造
 */
export interface ExportedWorkbookBundle {
  workbooks: ExportableWorkbook[];
}

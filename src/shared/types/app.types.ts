/** * ============================================================
 * 1. 定数・共通型 (Enums & Utility Types)
 * ============================================================
 */

/** 回答タイプ */
export type AnswerType = 'MARK' | 'TEXT';

/** 問題タイプ */
export type ProblemType =
  | 'SINGLE' // 単一回答
  | 'ORDERED_SET' // 完答・順序固定
  | 'UNORDERED' // 順不同・部分点あり
  | 'UNORDERED_SET'; // 順不同・完答

/** 自己評価タイプ (○, △, ✕) */
export type SelfEvalType = 'CONFIDENT' | 'UNSURE' | 'NONE' | 'UNRATED';

/** 判定結果のステータス */
export type JudgeStatus = 'CORRECT' | 'WRONG';

/** 自己評価と正誤判定の組み合わせ型 */
export type SelfEvalResultKey = `${SelfEvalType}_${JudgeStatus}`;

/** セッション開始時のフィルタリング条件 */
export type StartSessionFilterType = 'all' | 'miss' | 'recommended';

/** 拡張された問題範囲の定義 */
export interface ProblemRange {
  start: number;
  end: number;
  problemNumbers: number[];
  count: number;
  isSingle: boolean;
}

export type ProblemNumberResult = Record<string, Record<string, ProblemRange>>;

/** * ============================================================
 * 2. 階層構造定義 (Core Entities)
 * ============================================================
 */

/** 階層1: 問題集 (Workbook) */
export interface Workbook {
  id: string;
  name: string;
  createdAt: number;
  problemLists: ProblemList[];
}

/** 階層2: 問題リスト (ProblemList) */
export interface ProblemList {
  id: string;
  name: string;
  createdAt: number;
  currentHierarchyAchieveIds: string[];
}

/** 階層3: ユーザー定義階層 (大問・章など) */
export interface UserDefinedHierarchy {
  hierarchyId: string;
  problemListId: string; // 親の問題集
  workbookId: string; // 親の問題集が所属するワークブック
  name: string; // 「第1章」「大問1」など
  unitAchieveIds: string[];
}

/** 階層4: 問題ユニット (ProblemUnit)
 * ユニットはイミュータブルであり、編集時は新規IDが発行される
 */
export interface ProblemUnit {
  unitId: string;
  hierarchyId: string; // 親のヒエラルキー
  problemListId: string; // 親のヒエラルキーが所属する問題集
  workbookId: string; // 親のヒエラルキーが所属する問題集が所属するワークブック
  question?: string; // オプショナル
  problems: ProblemUnitProblem[];
  scoring: number; // 配点
  problemType: ProblemType;
  answerType: AnswerType;
  lastAttemptedAt: number; // 最終取組日時
  answerStructureId: string; // 回答構造の同一性を識別するID
}

/** ユニット内の設問個票 */
export interface ProblemUnitProblem {
  problemNumber: number;
  answer: string;
}

/** * ============================================================
 * 3. 学習履歴・回答データ (Attempt & Results)
 * ============================================================
 */

/** 回答履歴のルート (AttemptHistory) */
export interface AttemptHistory {
  id: string;
  workbookId: string;
  problemListId: string;
  startTime: number;
  endTime: number;
  problemListVersionId: string;
  unitAttempts: UnitAttemptResult;
}

/** ユニットごとの結果マップ */
export type UnitAttemptResult = {
  [unitId: string]: UnitAttemptResultData;
};

/** ユニットごとの具体的な回答内容と判定結果 */
export type UnitAttemptResultData = {
  hierarchyId: string;
  results: UnitAttemptResultProblemData[];
  resultKey: SelfEvalResultKey;
  selfEval: SelfEvalType;
  problemType: ProblemType;
  scoring: number;
};

export type UnitAttemptResultProblemData = {
  problemNumber: number;
  answer: string;
  collectAnswer: string;
  judge: JudgeStatus;
};

/** 日時情報を含む試行データ */
export type UnitAttempt = UnitAttemptResultData & { attemptAt: number };

/** ユーザーが入力中の回答データ */
export type UnitAttemptUserAnswers = {
  answers: Record<string, string>; // problemNumber, valueが回答
  selfEval: SelfEvalType;
};

/** 取得したい結合データの型 */
export type CombinedProblemResult = UnitAttemptResultProblemData & {
  parent: Omit<UnitAttemptResultData, 'results'>; // 無限ループを避けるためresultsは除外
};

/** * 最終的な参照用オブジェクトの型
 * Record<AttemptId, Record<HierarchyId, Record<ProblemNumber, CombinedProblemResult>>>
 */
export type HistoryLookupMap = Record<
  string,
  Record<string, Record<number, CombinedProblemResult>>
>;

/** * ============================================================
 * 4. セッション・管理・編集用 (Management & UI)
 * ============================================================
 */

/** 実行中の学習セッションデータ */
export interface AttemptingSessionData {
  id: string;
  workbookId: string;
  problemListId: string;
  startTime: number;
  problemListVersionId: string;
  attemptingUnitIds: string[];
}

export interface HierarchyArchiveRecord {
  [hierarchyId: string]: UserDefinedHierarchy;
}

/** ユニットバージョン記録 (履歴追跡用) */
export interface UnitArchiveRecord {
  [unitId: string]: ProblemUnit;
}

/** 回答構造記録 (作成日管理) */
export interface AnswerStructureRecord {
  [answerStructureId: string]: number; // key: ID, value: 作成日時
}

/** 編集用設定ベース */
export interface ProblemUnitSettings {
  question?: string;
  scoring: number;
  problemType: ProblemType;
  answerType: AnswerType;
}

/** 編集用データ本体 */
export type ProblemUnitData = ProblemUnitSettings & {
  answers: string[]; // 複数の回答を保持可能
};

/** 下書き状態を含む編集用データ */
export interface ProblemUnitDataWithDraft extends ProblemUnitSettings {
  answers: string[];
  answerDraft: string;
}

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
  hierarchies: UserDefinedHierarchy[]; // 問題定義配列
}

/** ユーザー定義階層 (大問・章など) */
export interface UserDefinedHierarchy {
  id: string; // 不変ID
  name: string; // 「第1章」「大問1」など
  unitVersionPaths: string[]; // ProblemUnit.unitId の配列
}

/** 回答タイプ */
export type AnswerType = 'MARK' | 'TEXT';

/** 問題タイプ */
export type ProblemType =
  | 'SINGLE' // 単一回答
  | 'ORDERED_SET' // 完答・順序固定
  | 'UNORDERED' // 順不同・部分点あり
  | 'UNORDERED_SET'; // 順不同・完答

/** 問題ユニット (ProblemUnit)
 * ユニットはイミュータブルであり、編集時は新規IDが発行される
 */
export interface ProblemUnit {
  unitId: string; // ユニットバージョンパスと同義
  question?: string; // オプショナル
  answers: string[]; // 複数の回答を保持可能
  scoring: number; // 配点
  problemType: ProblemType;
  answerType: AnswerType;
  lastAttemptedAt: number; // 最終取組日時
  answerStructureId: string; // 回答構造の同一性を識別するID
}

export interface ProblemUnitSettings {
  question?: string; // オプショナル
  scoring: number; // 配点
  problemType: ProblemType;
  answerType: AnswerType;
}

export interface ProblemUnitDataWithDraft extends ProblemUnitSettings {
  answers: string[]; // 複数の回答を保持可能
  answerDraft: string;
}

export interface ProblemUnitData extends ProblemUnitSettings {
  answers: string[]; // 複数の回答を保持可能
}

/** 回答構造記録 (AnswerStructureRecord) */
export interface AnswerStructureRecord {
  [answerStructureId: string]: number; // key: ID, value: 作成日時
}

/** ユニットバージョン記録 (UnitVersionRecord)
 * 履歴追跡用
 */
export interface UnitVersionRecord {
  [unitVersionPath: string]: ProblemUnit;
}

export type SelfEvalType = 'CONFIDENT' | 'UNSURE' | 'NONE' | 'UNRATED'; // ○, △, ✕

/** 回答履歴 (AttemptHistory) */
export interface AttemptHistory {
  id: string;
  startTime: number;
  endTime: number;
  problemListVersionId: string;
  unitAttempts: UnitAttemptResult;
}

export type UnitAttemptResult = {
  [unitId: string]: {
    answers: Record<string, string>; // keyがindex, valueが回答
    selfEval: SelfEvalType;
  };
};

export type StartSessionFilterType = 'all' | 'miss' | 'recommended';

export interface ProblemRange {
  start: number;
  end: number;
  problemNumbers: number[];
}

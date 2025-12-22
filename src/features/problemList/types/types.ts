import { AnswerType, ProblemRange, ProblemType } from '@/shared/types/app.types';

// 型定義（変更なし部分は省略、FormValues等は既存準拠）
export interface UnitBulkAddFormUnit {
  question?: string;
  answers: string[]; // 複数回答保持用
  scoring: number;
  problemType: ProblemType;
  answerType: AnswerType;
  id: string; // dnd-kit用に一意なIDが必要（今回は簡易的に生成）
}

export interface UnitBulkAddFormValues {
  units: UnitBulkAddFormUnit[];
  questionDraft: string;
  answerDraft: string[];
  pushAnswerDraft: {
    answer: string;
    unitIndex?: number;
  };
  unitSetting: {
    scoring: number;
    problemType: ProblemType;
    answerType: AnswerType;
  };
}

// Extended props for the form components
export interface UnitCardProps {
  unit: UnitBulkAddFormUnit; // FormUnit from your code
  range: ProblemRange;
  index: number;
  isMergeMode: boolean;
  isSelectedForMerge: boolean;
  onToggleMergeSelect: () => void;
  removeUnit: (index: number) => void;
  updateUnitFields: (index: number, val: Partial<UnitBulkAddFormUnit>) => void;
  updateUnitAnswer: (uIdx: number, aIdx: number, val: string) => void;
  removeAnswer: (uIdx: number, aIdx: number) => void;
  commitPushAnswerDraft: (uIdx: number, answers: string[]) => void;
  expandedDraftId: string | null;
  setExpandedDraftId: React.Dispatch<React.SetStateAction<string | null>>;
}

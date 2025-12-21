import { ProblemType } from '@/shared/types/app.types';

export const PROBLEM_TYPE_LABELS: Record<ProblemType, string> = {
  SINGLE: '一問',
  ORDERED_SET: '完答',
  UNORDERED: '部分点',
  UNORDERED_SET: '順不同',
};

export const PROBLEM_TYPE_COLORS: Record<ProblemType, string> = {
  SINGLE: 'blue',
  ORDERED_SET: 'cyan',
  UNORDERED: 'indigo',
  UNORDERED_SET: 'violet',
};

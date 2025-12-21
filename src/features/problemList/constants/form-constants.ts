export const ANSWER_TYPE_SELECTIONS = [
  { value: 'MARK', label: 'マーク' },
  { value: 'TEXT', label: '記述' },
] as const;

export const PROBLEM_TYPE_SELECTIONS = [
  { value: 'SINGLE', label: '一問' },
  { value: 'ORDERED_SET', label: '完答' },
  { value: 'UNORDERED_SET', label: '順不同' },
  { value: 'UNORDERED', label: '順不可(部分点)' },
];

import { ProblemUnit } from '@/shared/types/app.types';

export const DUMMY_UNITS: ProblemUnit[] = [
  {
    unitId: 'unit-v1-001',
    question: '2次方程式 x² - 5x + 6 = 0 の解のうち、大きい方を答えなさい。',
    answers: ['3'],
    scoring: 10,
    problemType: 'SINGLE',
    answerType: 'MARK', // 0-9のトグルで回答
    lastAttemptedAt: 1734567890000,
    answerStructureId: 'struct-math-001',
  },
  {
    unitId: 'unit-v1-002',
    question: '「吾輩は猫である」の著者を漢字で答えなさい。',
    answers: ['夏目漱石'],
    scoring: 10,
    problemType: 'SINGLE',
    answerType: 'TEXT', // 自由入力で回答
    lastAttemptedAt: 1734500000000,
    answerStructureId: 'struct-lit-002',
  },
  {
    unitId: 'unit-v1-003',
    question: '次のうち、素数を小さい順にすべて選びなさい（順不同）。',
    answers: ['2', '3', '5', '7'],
    scoring: 20,
    problemType: 'UNORDERED', // 順不同・部分点あり
    answerType: 'MARK',
    lastAttemptedAt: 0, // 未着手
    answerStructureId: 'struct-math-003',
  },
  {
    unitId: 'unit-v1-004',
    question: '徳川家康が江戸幕府を開いたのは西暦何年ですか？',
    answers: ['1603'],
    scoring: 10,
    problemType: 'SINGLE',
    answerType: 'TEXT',
    lastAttemptedAt: 1734600000000,
    answerStructureId: 'struct-hist-004',
  },
];

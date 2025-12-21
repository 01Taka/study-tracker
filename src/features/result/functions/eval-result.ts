import { ProblemUnit, SelfEvalResultKey, UnitAttemptResultData } from '@/shared/types/app.types';

/**
 * 回答の正誤と自己評価を組み合わせたキーを生成する
 * フォーマット: "CONFIDENT_CORRECT", "UNSURE_WRONG" など
 */
export const getEvalResultKey = (
  unit: ProblemUnit,
  attempt: UnitAttemptResultData
): SelfEvalResultKey => {
  const { answers: userAnswersMap, selfEval } = attempt;
  const correctAnswers = unit.answers;

  // ユーザーの回答を配列に変換（Record<string, string> の value部分）
  // index順に並べる必要があるため、keyでソートして抽出
  const userAnswers = Object.keys(userAnswersMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => userAnswersMap[key]);

  let isCorrect = false;

  switch (unit.problemType) {
    case 'SINGLE':
    case 'ORDERED_SET':
      // 順序を含めて完全一致か
      isCorrect =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((val, index) => val === correctAnswers[index]);
      break;

    case 'UNORDERED':
    case 'UNORDERED_SET':
      // 順不同：ソートして比較
      if (userAnswers.length !== correctAnswers.length) {
        isCorrect = false;
      } else {
        const sortedUser = [...userAnswers].sort();
        const sortedCorrect = [...correctAnswers].sort();
        isCorrect = sortedUser.every((val, index) => val === sortedCorrect[index]);
      }
      break;

    default:
      isCorrect = false;
  }

  const status = isCorrect ? 'CORRECT' : 'WRONG';
  return `${selfEval}_${status}`;
};

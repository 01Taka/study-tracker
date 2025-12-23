import {
  JudgeStatus,
  ProblemUnit,
  SelfEvalResultKey,
  UnitAttemptResult,
  UnitAttemptResultData,
  UnitAttemptUserAnswers,
} from '../types/app.types';

/**
 * 文字列を判定用に正規化する
 * 1. 全角英数字を半角に変換
 * 2. 前後の空白を削除
 * 3. 大文字を小文字に変換
 */
const normalize = (str: string | undefined | null): string => {
  if (!str) return '';
  return str
    .replace(/[！-～]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .trim()
    .toLowerCase();
};

/**
 * 回答の正誤と自己評価を組み合わせたキーを生成する
 */
export const getEvalResultKey = (
  unit: ProblemUnit,
  attempt: UnitAttemptUserAnswers
): SelfEvalResultKey => {
  const { answers: userAnswersMap, selfEval } = attempt;

  // 正規化した配列を作成
  const correctAnswers = unit.problems.map((p) => normalize(p.answer));
  const userAnswers = Object.keys(userAnswersMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => normalize(userAnswersMap[key]));

  let isCorrect = false;

  if (userAnswers.length !== correctAnswers.length) {
    return `${selfEval}_WRONG`;
  }

  switch (unit.problemType) {
    case 'SINGLE':
    case 'ORDERED_SET':
      isCorrect = userAnswers.every((val, index) => val === correctAnswers[index]);
      break;

    case 'UNORDERED':
    case 'UNORDERED_SET':
      const sortedUser = [...userAnswers].sort();
      const sortedCorrect = [...correctAnswers].sort();
      isCorrect = sortedUser.every((val, index) => val === sortedCorrect[index]);
      break;

    default:
      isCorrect = false;
  }

  return `${selfEval}_${isCorrect ? 'CORRECT' : 'WRONG'}`;
};

export const createUnitAttemptResult = (
  userAnswersMap: Record<string, UnitAttemptUserAnswers>,
  units: ProblemUnit[]
): UnitAttemptResult | null => {
  const attemptResult: UnitAttemptResult = {};

  for (let unit of units) {
    const userAttempt = userAnswersMap[unit.unitId];
    if (!userAttempt) continue;

    const userAnswers = Object.values(userAttempt.answers);

    if (unit.problems.length !== userAnswers.length) {
      console.error(`[データ不一致] ユニットID: ${unit.unitId}`);
      console.error(`- 期待される問題数: ${unit.problems.length}`);
      console.error(`- 送信された回答数: ${userAnswers.length}`);

      console.table({
        problems: unit.problems.map((p) => `番号: ${p.problemNumber}, 正解: ${p.answer}`),
        answers: userAnswers.map((a) => `回答: ${a}` || 'N/A'),
      });

      return null;
    }

    const evalResultKey = getEvalResultKey(unit, userAttempt);

    // 各問題の判定にも normalize を適用
    const results = userAnswers.map((answer, idx) => {
      const correctAnswer = unit.problems[idx]?.answer || '';
      const isItemCorrect = normalize(answer) === normalize(correctAnswer);

      return {
        problemNumber: unit.problems[idx]?.problemNumber || -1,
        collectAnswer: correctAnswer,
        answer: answer, // ユーザーが入力した生の値を保存
        judge: (isItemCorrect ? 'CORRECT' : 'WRONG') as JudgeStatus,
      };
    });

    const resultData: UnitAttemptResultData = {
      hierarchyId: unit.hierarchyId,
      results,
      resultKey: evalResultKey,
      selfEval: userAttempt.selfEval,
      scoring: unit.scoring,
      problemType: unit.problemType,
    };

    attemptResult[unit.unitId] = resultData;
  }

  return attemptResult;
};

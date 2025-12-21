import {
  ProblemUnit,
  UnitAttemptResult,
  UnitAttemptResultData,
  UnitAttemptUserAnswers,
} from '../types/app.types';
import { getEvalResultKey } from './eval-result';

export const createUnitAttemptResult = (
  userAnswersMap: Record<string, UnitAttemptUserAnswers>,
  units: ProblemUnit[]
): UnitAttemptResult => {
  const attemptResult: UnitAttemptResult = {};

  units.forEach((unit) => {
    const userAttempt = userAnswersMap[unit.unitId];
    if (!userAttempt) return;

    // 1. 全体判定の取得
    const evalResultKey = getEvalResultKey(unit, userAttempt);

    const resultData: UnitAttemptResultData = {
      results: {},
      resultKey: evalResultKey,
      selfEval: userAttempt.selfEval,
    };

    // 2. 各回答ごとの詳細を格納
    Object.keys(userAttempt.answers).forEach((index) => {
      const idx = Number(index);
      resultData.results[index] = {
        answer: userAttempt.answers[index],
        collectAnswer: unit.answers[idx] || '', // 当時の正解を保存
        judge: unit.answers[idx] === userAttempt.answers[index] ? 'CORRECT' : 'WRONG',
      };
    });

    attemptResult[unit.unitId] = resultData;
  });

  return attemptResult;
};

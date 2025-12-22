import { UnitAttemptResultData } from '@/shared/types/app.types';

export const calculateScore = (attempt: UnitAttemptResultData | undefined) => {
  if (!attempt) return { earned: 0, isPerfect: false };

  // resultKey (例: "CONFIDENT_CORRECT", "NONE_WRONG") から判定ステータスを抽出
  const isUnitCorrect = attempt.resultKey.endsWith('_CORRECT');

  // 1. 完答・順序固定・順不同完答などの「完答が条件」のタイプ
  if (attempt.problemType !== 'UNORDERED') {
    return {
      earned: isUnitCorrect ? attempt.scoring : 0,
      isPerfect: isUnitCorrect,
    };
  }

  // 2. UNORDERED（部分点あり）の場合
  // このタイプのみ、個別の judge ステータスを見て配点を按分する
  const totalProblems = attempt.results.length;
  if (totalProblems === 0) return { earned: 0, isPerfect: false };

  const correctCount = attempt.results.filter((r) => r.judge === 'CORRECT').length;

  // 浮動小数点誤差を考慮して丸め処理
  const earned = Math.round((attempt.scoring / totalProblems) * correctCount);

  return {
    earned,
    isPerfect: isUnitCorrect, // UNORDEREDでも全問正解なら resultKey は CORRECT になる想定
  };
};

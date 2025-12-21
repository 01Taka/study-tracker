import {
  AttemptHistory,
  ProblemList,
  ProblemUnit,
  UnitAttempt,
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

export const getLatestAttemptMap = (problemList: ProblemList, histories: AttemptHistory[]) => {
  // 1. 対象の problemListId に絞り込み、新しい順（降順）に並び替え
  const filteredSortedHistories = histories
    .filter((h) => h.problemListId === problemList.id)
    .sort((a, b) => b.startTime - a.startTime); // 新しい順

  const unitPaths = problemList.hierarchies.flatMap((h) => h.unitVersionPaths);
  const latestAttemptMap: Record<string, UnitAttempt | null> = {};

  // 2. unitPaths をキーとして初期化
  unitPaths.forEach((path) => {
    latestAttemptMap[path] = null;
  });

  // 3. 履歴を一度だけ走査して、まだ値が入っていない（＝最新の）試行を埋める
  for (const history of filteredSortedHistories) {
    for (const path of unitPaths) {
      // すでに最新（最初に見つかったもの）が入っていればスキップ
      if (latestAttemptMap[path]) continue;

      const attempt = history.unitAttempts[path];
      if (attempt) {
        latestAttemptMap[path] = { ...attempt, attemptAt: history.startTime };
      }
    }

    // 全てのパスが埋まったら早期終了（パフォーマンス最適化）
    if (Object.values(latestAttemptMap).every((val) => val !== null)) {
      break;
    }
  }

  return latestAttemptMap;
};

import {
  AttemptHistory,
  HierarchyArchiveRecord,
  ProblemList,
  UnitAttempt,
} from '../types/app.types';

export const getLatestAttemptMap = (
  problemList: ProblemList,
  histories: AttemptHistory[],
  hierarchyRecord: HierarchyArchiveRecord
) => {
  // 1. 対象の problemListId に絞り込み、新しい順（降順）に並び替え
  const filteredSortedHistories = histories
    .filter((h) => h.problemListId === problemList.id)
    .sort((a, b) => b.startTime - a.startTime); // 新しい順

  const unitPaths = problemList.currentHierarchyAchieveIds.flatMap(
    (id) => hierarchyRecord[id]?.unitAchieveIds ?? []
  );
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

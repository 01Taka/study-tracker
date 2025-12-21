import { StartSessionFilterType, UnitAttempt } from '../types/app.types';
import { getDiffDays } from './datetime-utils';

const checkIsSelected = (
  unitId: string,
  filter: StartSessionFilterType,
  latestAttemptMap: Record<string, UnitAttempt | null>
) => {
  if (filter === 'all') return true;
  const latestAttempt = latestAttemptMap[unitId];
  if (!latestAttempt) return filter !== 'miss';
  const resultKey = latestAttempt?.resultKey ?? 'UNRATED_CORRECT';
  const isMissed = resultKey.endsWith('WRONG');
  if (filter === 'miss') return isMissed;
  const dateDiff = getDiffDays(Date.now(), latestAttempt?.attemptAt ?? 0);
  return resultKey !== 'CONFIDENT_CORRECT' || dateDiff > 7;
};

export const getUnitSelectedStateMap = (
  unitIds: string[],
  filter: StartSessionFilterType,
  latestAttemptMap: Record<string, UnitAttempt | null>
): Record<string, boolean> => {
  const entries = unitIds.map((unitId) => [
    unitId,
    checkIsSelected(unitId, filter, latestAttemptMap),
  ]);
  return Object.fromEntries(entries);
};

/**
 * ユニットが選択状態かどうかを判定するコールバック関数を生成する
 */
export const createUnitSelectionChecker = (
  latestAttemptMap: Record<string, UnitAttempt | null>
) => {
  // この関数が「unitIdとfilterを渡したらフラグを返すコールバック」です
  return (unitId: string, filter: StartSessionFilterType): boolean => {
    if (filter === 'all') return true;

    const latestAttempt = latestAttemptMap[unitId];

    // 過去の試行がない場合：'miss'フィルター以外なら表示
    if (!latestAttempt) {
      return filter !== 'miss';
    }

    const resultKey = latestAttempt?.resultKey ?? 'UNRATED_CORRECT';
    const isMissed = resultKey.endsWith('WRONG');

    // 'miss'フィルターの場合：間違えたもののみ
    if (filter === 'miss') {
      return isMissed;
    }

    // 'review'フィルター（想定）の場合：
    // 「正解したが自信がない」 or 「7日以上経過している」
    const dateDiff = getDiffDays(Date.now(), latestAttempt?.attemptAt ?? 0);
    return resultKey !== 'CONFIDENT_CORRECT' || dateDiff > 7;
  };
};

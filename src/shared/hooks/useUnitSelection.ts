import { useCallback } from 'react';
import { getDiffDays } from '../functions/datetime-utils';
import { StartSessionFilterType, UnitAttempt } from '../types/app.types';

export const useUnitSelection = (
  unitIds: string[],
  latestAttemptMap: Record<string, UnitAttempt | null>
) => {
  /**
   * 1. 判定ロジック本体 (内部用)
   */
  const checkIsSelected = useCallback(
    (unitId: string, filter: StartSessionFilterType): boolean => {
      if (filter === 'all') return true;

      const latestAttempt = latestAttemptMap[unitId];
      if (!latestAttempt) return filter !== 'miss';

      const resultKey = latestAttempt?.resultKey ?? 'UNRATED_CORRECT';
      const isMissed = resultKey.endsWith('WRONG');

      if (filter === 'miss') return isMissed;

      const dateDiff = getDiffDays(Date.now(), latestAttempt?.attemptAt ?? 0);
      return resultKey !== 'CONFIDENT_CORRECT' || dateDiff > 7;
    },
    [latestAttemptMap]
  );

  /**
   * 2. 外部へ公開する関数：特定のユニットが選択されているか判定
   */
  const getIsSelected = useCallback(
    (unitId: string, filter: StartSessionFilterType) => {
      return checkIsSelected(unitId, filter);
    },
    [checkIsSelected]
  );

  /**
   * 3. フィルターに合致するユニットIDの配列を取得
   */
  const getSelectedUnitIds = useCallback(
    (filter: StartSessionFilterType): string[] => {
      return unitIds.filter((unitId) => checkIsSelected(unitId, filter));
    },
    [unitIds, checkIsSelected]
  );

  /**
   * 4. 外部へ公開する関数：現在のフィルターでの合計選択数を取得
   */
  const getSelectedCount = useCallback(
    (filter: StartSessionFilterType): number => {
      return unitIds.reduce((count, unitId) => {
        return checkIsSelected(unitId, filter) ? count + 1 : count;
      }, 0);
    },
    [unitIds, checkIsSelected]
  );

  return {
    getIsSelected,
    getSelectedUnitIds,
    getSelectedCount,
  };
};

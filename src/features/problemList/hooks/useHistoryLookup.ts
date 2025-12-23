import { useMemo } from 'react';
import { AttemptHistory, HistoryLookupMap, UnitArchiveRecord } from '@/shared/types/app.types';

/**
 * 履歴データを高速参照可能なオブジェクトに変換する
 */
export const useHistoryLookup = (
  histories: AttemptHistory[],
  unitRecords: UnitArchiveRecord
): HistoryLookupMap => {
  return useMemo(() => {
    const lookup: HistoryLookupMap = {};

    histories.forEach((history) => {
      const attemptId = history.id;
      lookup[attemptId] = {};

      // ユニットごとの結果を走査
      Object.entries(history.unitAttempts).forEach(([unitId, unitData]) => {
        const unitMeta = unitRecords[unitId];
        if (!unitMeta) return;

        const hierarchyId = unitMeta.hierarchyId;

        // 階層(Hierarchy)の階層を初期化
        if (!lookup[attemptId][hierarchyId]) {
          lookup[attemptId][hierarchyId] = {};
        }

        // ユニット内の個別の問題結果を走査
        unitData.results.forEach((probResult) => {
          const { results, ...parentMetadata } = unitData;

          lookup[attemptId][hierarchyId][probResult.problemNumber] = {
            ...probResult,
            parent: parentMetadata,
          };
        });
      });
    });

    return lookup;
  }, [histories, unitRecords]);
};

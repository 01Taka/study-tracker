// features/results/hooks/useResultCalculation.ts
import { useMemo } from 'react';
import { useAttemptHistory } from '@/features/data/hooks/useAttemptHistory';
import { useProblemListData } from '@/features/data/hooks/useProblemListData';
import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { useProblemNumbers } from '@/shared/hooks/useProblemNumbers';
import { calculateScore } from '../functions/scoring';

export const useResultCalculation = (resultId: string) => {
  const { histories } = useAttemptHistory();
  const { unitRecord } = useProblemUnitData();

  const history = useMemo(() => histories.find((h) => h.id === resultId), [histories, resultId]);
  const { getProblemList } = useProblemListData(history?.workbookId ?? '');

  const currentProblemList = useMemo(
    () => getProblemList(history?.problemListId),
    [history, getProblemList]
  );

  const scoreSummary = useMemo(() => {
    if (!history || !currentProblemList) return { earned: 0, max: 0 };
    let e = 0,
      m = 0;
    Object.entries(history.unitAttempts).forEach(([uid, att]) => {
      const unit = unitRecord[uid];
      if (unit) {
        const res = calculateScore(unit, att);
        e += res.earned;
        m += unit.scoring;
      }
    });
    return { earned: Math.round(e), max: m };
  }, [history, unitRecord, currentProblemList]);

  const gropedUnitsByHierarchy = useMemo(
    () =>
      Object.fromEntries(
        currentProblemList?.hierarchies.map((hierarchy) => [
          hierarchy.id,
          hierarchy.unitVersionPaths.map((path) => unitRecord[path]),
        ]) ?? []
      ),
    [currentProblemList, unitRecord]
  );

  const { problemNumberMap } = useProblemNumbers(gropedUnitsByHierarchy);

  return {
    history,
    unitRecord,
    currentProblemList,
    scoreSummary,
    problemNumberMap,
    isLoading: !history || !currentProblemList,
  };
};

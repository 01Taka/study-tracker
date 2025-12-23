import { useMemo } from 'react';
import { useAttemptHistory } from '@/features/data/hooks/useAttemptHistory';
import { useHierarchyArchive } from '@/features/data/hooks/useHierarchyArchive';
import { useProblemListData } from '@/features/data/hooks/useProblemListData';
import { calculateScore } from '../functions/scoring';

export const useResultCalculation = (resultId: string) => {
  const { histories } = useAttemptHistory();
  const { hierarchyRecord } = useHierarchyArchive();

  const history = useMemo(() => histories.find((h) => h.id === resultId), [histories, resultId]);
  const { getProblemList } = useProblemListData(history?.workbookId ?? '');

  const currentProblemList = useMemo(
    () => getProblemList(history?.problemListId),
    [history, getProblemList]
  );

  const attemptedHierarchies = useMemo(() => {
    if (!history || !currentProblemList) return [];
    const attemptedUnitIds = new Set(Object.keys(history.unitAttempts));
    return currentProblemList.currentHierarchyAchieveIds
      .map((id) => ({
        ...hierarchyRecord[id],
        unitAchieveIds:
          hierarchyRecord[id]?.unitAchieveIds.filter((path) => attemptedUnitIds.has(path)) ?? [],
      }))
      .filter((hierarchy) => hierarchy.unitAchieveIds.length > 0);
  }, [currentProblemList, history]);

  const scoreSummary = useMemo(() => {
    if (!history || !currentProblemList) return { earned: 0, max: 0 };
    let e = 0,
      m = 0;
    Object.values(history.unitAttempts).forEach((att) => {
      const res = calculateScore(att);
      e += res.earned;
      m += att.scoring;
    });
    return { earned: Math.round(e), max: m };
  }, [history, currentProblemList]);

  return {
    history,
    attemptedHierarchies,
    currentProblemList,
    scoreSummary,
    isLoading: !history || !currentProblemList,
  };
};

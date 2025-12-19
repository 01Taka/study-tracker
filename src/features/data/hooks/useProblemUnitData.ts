import { ProblemUnit } from '@/shared/types/app.types';

export const useProblemUnitData = () => {
  const getProblemUnit = (problemUnitId: string | undefined): ProblemUnit | null => {
    return null;
  };

  const getProblemUnits = (unitVersionPaths: string[]): ProblemUnit[] => {
    return [];
  };

  return { getProblemUnit, getProblemUnits };
};

import { useMemo } from 'react';
import { ProblemRange, ProblemUnit } from '../types/app.types';

type ProblemNumberResult = Record<string, Record<string, ProblemRange>>;

export const useProblemNumbers = (unitsMap: Record<string, ProblemUnit[] | undefined>) => {
  const problemNumberMap: ProblemNumberResult = useMemo(() => {
    const result: ProblemNumberResult = {};

    // Object.entries(unitsMap ?? {}) とすることで、unitsMap自体がnull/undefinedでも空配列としてループ
    Object.entries(unitsMap ?? {}).forEach(([key, units]) => {
      const record: Record<string, ProblemRange> = {};
      let currentCount = 0;

      // units が undefined の場合は何もしない (空のrecordを返す)
      units?.forEach((unit) => {
        if (!unit) {
          return;
        }

        // unit.answers が undefined の場合も考慮して空配列として扱う
        const problemCount = unit.answers?.length ?? 0;

        if (problemCount === 0) {
          record[unit.unitId] = { start: 0, end: 0, problemNumbers: [], isError: true };
          return;
        }

        const start = currentCount + 1;
        const end = currentCount + problemCount;
        const problemNumbers = Array.from({ length: problemCount }, (_, i) => start + i);

        record[unit.unitId] = {
          start,
          end,
          problemNumbers,
          isError: false,
        };

        currentCount = end;
      });

      result[key] = record;
    });

    return result;
  }, [unitsMap]);

  return { problemNumberMap };
};

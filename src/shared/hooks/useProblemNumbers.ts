import { useMemo } from 'react';
import { ProblemRange, ProblemUnit } from '../types/app.types';

export const useProblemNumbers = (units: ProblemUnit[]) => {
  const problemNumberMap: Record<string, ProblemRange> = useMemo(() => {
    const record: Record<string, ProblemRange> = {};
    let currentCount = 0;

    units.forEach((unit) => {
      // answersの要素数を問題数として扱う
      const problemCount = unit.answers.length;

      // 問題数が0件の場合のハンドリング（必要に応じて）
      if (problemCount === 0) {
        record[unit.unitId] = { start: 0, end: 0, problemNumbers: [] };
        return;
      }

      const start = currentCount + 1;
      const end = currentCount + problemCount;

      // startからendまでの連番配列を作成
      const problemNumbers = Array.from({ length: problemCount }, (_, i) => start + i);

      record[unit.unitId] = {
        start,
        end,
        problemNumbers,
      };

      // 次のユニットのためにカウントを更新
      currentCount = end;
    });

    return record;
  }, [units]);

  return { problemNumberMap };
};

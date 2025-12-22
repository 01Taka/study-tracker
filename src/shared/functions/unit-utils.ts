import { UnitBulkAddFormUnit } from '@/features/problemList/types/types';
import { ProblemRange, ProblemUnit } from '../types/app.types';

/**
 * ProblemUnitから詳細なProblemRangeを生成する関数
 */
export function getProblemRangeFromUnit(unit: ProblemUnit): ProblemRange {
  const problems = unit.problems || [];

  if (problems.length === 0) {
    return {
      start: 0,
      end: 0,
      problemNumbers: [],
      count: 0,
      isSingle: false,
    };
  }

  const numbers = problems.map((p) => p.problemNumber);
  const start = Math.min(...numbers);
  const end = Math.max(...numbers);
  const count = numbers.length;

  return {
    start,
    end,
    problemNumbers: numbers.sort((a, b) => a - b),
    count,
    isSingle: count === 1, // 要素数が1つの場合にtrue
  };
}

/**
 * @param units 変換対象のユニット配列
 * @param initialStart 開始問題番号 (デフォルトは1)
 */
export function convertToProblemRanges(
  units: UnitBulkAddFormUnit[],
  initialStart: number = 1
): ProblemRange[] {
  let currentProblemNumber = initialStart;

  return units.map((unit) => {
    const count = unit.answers.length;
    // countが0の場合の考慮（念のため）
    const actualCount = count > 0 ? count : 0;

    const start = currentProblemNumber;
    const end = actualCount > 0 ? currentProblemNumber + actualCount - 1 : currentProblemNumber;

    const problemNumbers = Array.from({ length: actualCount }, (_, i) => start + i);

    const range: ProblemRange = {
      start: start,
      end: end,
      problemNumbers: problemNumbers,
      count: actualCount,
      isSingle: actualCount === 1,
    };

    // 次のユニットの開始番号を更新
    currentProblemNumber += actualCount;

    return range;
  });
}

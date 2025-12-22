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

// features/results/utils/scoring.ts
import { ProblemUnit, UnitAttemptResultData } from '@/shared/types/app.types';

export const calculateScore = (unit: ProblemUnit, attempt: UnitAttemptResultData | undefined) => {
  if (!attempt) return { earned: 0, isPerfect: false };
  const correctAnswers = unit.answers;
  const userAnswers = Array.from({ length: correctAnswers.length }).map(
    (_, i) => attempt.results[String(i)]?.answer || ''
  );
  const normalize = (s: string) => s.trim().toLowerCase();

  if (unit.problemType === 'UNORDERED') {
    let matches = 0;
    const pool = [...correctAnswers].map(normalize);
    userAnswers.forEach((ans) => {
      const idx = pool.indexOf(normalize(ans));
      if (ans && idx !== -1) {
        matches++;
        pool.splice(idx, 1);
      }
    });
    const earned = (unit.scoring / correctAnswers.length) * matches;
    return { earned, isPerfect: matches === correctAnswers.length };
  }

  const isMatch =
    unit.problemType === 'UNORDERED_SET'
      ? [...userAnswers].map(normalize).sort().join('|') ===
        [...correctAnswers].map(normalize).sort().join('|')
      : userAnswers.map(normalize).join('|') === correctAnswers.map(normalize).join('|');

  return { earned: isMatch ? unit.scoring : 0, isPerfect: isMatch };
};

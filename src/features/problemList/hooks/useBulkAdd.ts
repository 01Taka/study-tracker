import { useCallback, useMemo, useState } from 'react';
import { ProblemUnitDataWithDraft, ProblemUnitSettings } from '@/shared/types/app.types';

// --- Types ---
export type BulkOnChangeSettingsArgs =
  | { type: 'DISABLED' }
  | { type: 'DRAFT'; data: Partial<ProblemUnitSettings> }
  | { type: 'LIST'; index: number; data: Partial<ProblemUnitSettings> };

export type BulkOnChangeAnswerArgs =
  | { type: 'DISABLED' }
  | { type: 'DRAFT'; answer: string } // listIndexを削除（不要なため）
  | { type: 'DRAFT_INSTANT'; answer: string }
  | { type: 'LIST_DRAFT'; listIndex: number; answer: string }
  | { type: 'LIST_DRAFT_INSTANT'; listIndex: number; answer: string }
  | { type: 'LIST_SET'; listIndex: number; answerIndex: number; answer: string };

// --- Hook ---
export const useBulkAdd = (baseProblemIndex: number) => {
  const [rows, setRows] = useState<ProblemUnitDataWithDraft[]>([]);

  const createInitialDraft = (prev?: ProblemUnitSettings): ProblemUnitDataWithDraft => ({
    question: '',
    answers: [''],
    answerDraft: '',
    scoring: prev?.scoring ?? 5,
    problemType: prev?.problemType ?? 'SINGLE',
    answerType: prev?.answerType ?? 'MARK',
  });

  const [draft, setDraft] = useState<ProblemUnitDataWithDraft>(createInitialDraft());

  // 1. 各行が「何問分か」を事前に計算 (O(n))
  const rowCounts = useMemo(() => {
    return rows.map((row) =>
      row.problemType === 'SINGLE' ? 1 : row.answers.filter((a) => a !== '').length
    );
  }, [rows]);

  // 2. 表示番号の取得 (O(n) だが、rowCountsのおかげで計算が軽い)
  const getDisplayNumber = useCallback(
    (targetIndex: number, isDraftOrDisabled: boolean) => {
      const offset = baseProblemIndex + 1;
      const loopLimit = isDraftOrDisabled ? rowCounts.length : targetIndex;
      const sum = rowCounts.slice(0, loopLimit).reduce((acc, cur) => acc + cur, 0);
      return offset + sum;
    },
    [rowCounts, baseProblemIndex]
  );

  const onChangeSettings = useCallback((args: BulkOnChangeSettingsArgs) => {
    if (args.type === 'DISABLED') return;
    if (args.type === 'DRAFT') {
      setDraft((prev) => ({ ...prev, ...args.data }));
    } else {
      setRows((prev) =>
        prev.map((row, idx) => (idx === args.index ? { ...row, ...args.data } : row))
      );
    }
  }, []);

  const onChangeAnswer = useCallback(
    (args: BulkOnChangeAnswerArgs) => {
      const { type } = args;
      if (type === 'DISABLED') return;
      // DRAFT 更新
      if (type === 'DRAFT') {
        setDraft((prev) => ({ ...prev, answers: [args.answer] }));
        return;
      }

      // DRAFT 即時確定
      if (type === 'DRAFT_INSTANT') {
        setRows((prev) => [...prev, { ...draft, answerDraft: '', answers: [args.answer] }]);
        // 確定後、ドラフトをリセットするのが一般的かもしれません
        setDraft(createInitialDraft(draft));
        return;
      }

      // LIST 更新
      setRows((prev) => {
        const target = prev[args.listIndex];
        if (!target) return prev;

        return prev.map((row, idx) => {
          if (idx !== args.listIndex) return row;

          if (type === 'LIST_DRAFT') {
            return { ...row, answerDraft: args.answer };
          }

          if (type === 'LIST_DRAFT_INSTANT') {
            return { ...row, answers: [...row.answers, args.answer], answerDraft: '' };
          }

          if (type === 'LIST_SET') {
            const nextAnswers = [...row.answers];
            if (args.answerIndex < 0 || args.answerIndex >= nextAnswers.length) return row;
            nextAnswers[args.answerIndex] = args.answer;
            return { ...row, answers: nextAnswers };
          }
          return row;
        });
      });
    },
    [draft]
  ); // draftを確定させるロジックがあるため依存が必要

  const onCommitAllAnswerDraft = useCallback(() => {
    setRows((prev) =>
      prev.map((row) => {
        if (!row.answerDraft) return row;
        return {
          ...row,
          answerDraft: '',
          answers: [...row.answers, row.answerDraft],
        };
      })
    );
  }, []);

  const onCommitDraft = useCallback(() => {
    const hasAnyAnswer = draft.answers.some((ans) => ans.trim() !== '');
    if (!hasAnyAnswer) return false;

    setRows((prev) => [...prev, draft]);
    setDraft(createInitialDraft(draft));
    return true;
  }, [draft]);

  const hasError = useMemo(() => {
    return rows.some((row) => row.answers.every((a) => a === ''));
  }, [rows]);

  return {
    rows,
    draft,
    hasError,
    setDraft,
    getDisplayNumber,
    onChangeSettings,
    onChangeAnswer,
    onCommitAllAnswerDraft,
    onCommitDraft,
  };
};

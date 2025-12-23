import { useCallback, useRef } from 'react';
import { useForm } from '@mantine/form';
import { generateId } from '@/shared/functions/generate-id';
import { UnitBulkAddFormUnit, UnitBulkAddFormValues } from '../types/types';

export const useUnitBulkAddForm = () => {
  const form = useForm<UnitBulkAddFormValues>({
    initialValues: {
      units: [],
      questionDraft: '',
      answerDraft: [],
      pushAnswerDraft: { answer: '', unitIndex: undefined },
      unitSetting: { scoring: 5, problemType: 'SINGLE', answerType: 'MARK' },
    },
  });

  // --- スナップショット管理 (Cancel/Save用) ---
  const snapshotRef = useRef<UnitBulkAddFormUnit[] | null>(null);

  const captureSnapshot = useCallback(() => {
    snapshotRef.current = JSON.parse(JSON.stringify(form.values.units));
  }, [form.values.units]);

  const revertToSnapshot = useCallback(() => {
    if (snapshotRef.current) {
      form.setFieldValue('units', snapshotRef.current);
      snapshotRef.current = null;
    }
  }, [form]);

  const clearSnapshot = useCallback(() => {
    snapshotRef.current = null;
  }, []);

  // --- ドラフトコミット (Unit追加) ---
  const commitDraft = useCallback(
    (optionalAnswers?: string[]) => {
      const { questionDraft, answerDraft, unitSetting } = form.values;
      const answersToAdd = optionalAnswers ?? answerDraft;

      const newUnit: UnitBulkAddFormUnit = {
        id: generateId(), // 一意なIDを生成
        question: questionDraft.trim() || undefined,
        answers: answersToAdd,
        ...unitSetting,
      };

      form.insertListItem('units', newUnit);
      form.setValues({ questionDraft: '', answerDraft: [] });
    },
    [form]
  );

  // --- 回答追加ドラフト (Unit内) ---
  // 仕様変更: 配列を受け取れるようにリファクタリング
  const commitPushAnswerDraft = useCallback(
    (targetUnitIndex?: number, optionalAnswers?: string[]) => {
      const idx = targetUnitIndex ?? form.values.pushAnswerDraft.unitIndex;
      if (idx === undefined) return;

      const { pushAnswerDraft } = form.values;
      // 引数がなければフォームの値を使用、あれば引数を使用（マーク入力など）
      const inputs = optionalAnswers ?? (pushAnswerDraft.answer ? [pushAnswerDraft.answer] : []);

      if (inputs.length === 0) return;

      inputs.forEach((ans) => {
        form.insertListItem(`units.${idx}.answers`, ans);
      });

      // フォームクリア
      if (
        targetUnitIndex === undefined ||
        targetUnitIndex === form.values.pushAnswerDraft.unitIndex
      ) {
        form.setFieldValue('pushAnswerDraft.answer', '');
      }
    },
    [form]
  );

  // --- 既存機能 ---
  const removeUnit = useCallback((index: number) => form.removeListItem('units', index), [form]);

  const removeAnswer = useCallback(
    (unitIndex: number, answerIndex: number) => {
      form.removeListItem(`units.${unitIndex}.answers`, answerIndex);
    },
    [form]
  );

  const updateUnitFields = useCallback(
    (index: number, val: Partial<UnitBulkAddFormUnit>) => {
      const current = form.values.units[index];
      if (current) form.setFieldValue(`units.${index}`, { ...current, ...val });
    },
    [form]
  );

  const updateUnitAnswer = useCallback(
    (uIdx: number, aIdx: number, val: string) => {
      form.setFieldValue(`units.${uIdx}.answers.${aIdx}`, val);
    },
    [form]
  );

  const reorderUnits = useCallback(
    (from: number, to: number) => {
      form.reorderListItem('units', { from, to });
    },
    [form]
  );

  // マージロジック (既存維持、ID生成を追加)
  const mergeUnits = useCallback(
    (start: number, end: number) => {
      const { units } = form.values;
      const s = Math.min(start, end);
      const e = Math.max(start, end);
      if (s < 0 || e >= units.length || s === e) return;

      const targets = units.slice(s, e + 1);
      const mergedUnit: UnitBulkAddFormUnit = {
        id: generateId(),
        question: targets
          .map((u) => u.question)
          .filter(Boolean)
          .join('\n'),
        answers: targets.flatMap((u) => u.answers),
        scoring: Math.min(
          targets.reduce((acc, u) => acc + u.scoring, 0),
          100
        ),
        problemType: 'ORDERED_SET',
        answerType: targets.some((u) => u.answerType === 'TEXT') ? 'TEXT' : 'MARK',
      };

      const newUnits = [...units];
      newUnits.splice(s, targets.length, mergedUnit);
      form.setFieldValue('units', newUnits);
    },
    [form]
  );

  // --- 完全に状態をリセットする ---
  const resetAll = useCallback(() => {
    // 1. フォームの状態を initialValues に戻す
    form.reset();
    // 2. スナップショット（Ref）をクリアする
    snapshotRef.current = null;
  }, [form]);

  return {
    form,
    commitDraft,
    updateUnitFields,
    updateUnitAnswer,
    commitPushAnswerDraft,
    removeUnit,
    removeAnswer,
    reorderUnits,
    mergeUnits,
    captureSnapshot,
    revertToSnapshot,
    clearSnapshot,
    resetAll,
  };
};

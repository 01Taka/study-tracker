import { useCallback } from 'react';
import { useAppStore } from '@/features/data/store/useAppStore';
import { createUnitAttemptResult } from '@/shared/functions/attempt-result';
import { generateId } from '@/shared/functions/generate-id';
import {
  AttemptHistory,
  AttemptingSessionData,
  ProblemUnit,
  UnitAttemptUserAnswers,
} from '@/shared/types/app.types';

export const useAttemptHistory = () => {
  // ストアから必要な状態とアクションを抽出
  const histories = useAppStore((state) => state.histories);
  const activeSession = useAppStore((state) => state.activeSession);
  const setHistories = useAppStore((state) => state.setHistories);
  const setActiveSession = useAppStore((state) => state.setActiveSession);

  /**
   * セッション開始
   */
  const startSession = useCallback(
    (args: {
      problemListVersionId: string;
      workbookId: string;
      problemListId: string;
      attemptingUnitIds: string[];
    }) => {
      if (activeSession) return;

      const newSession: AttemptingSessionData = {
        id: generateId(),
        startTime: Date.now(),
        problemListVersionId: args.problemListVersionId,
        workbookId: args.workbookId,
        problemListId: args.problemListId,
        attemptingUnitIds: args.attemptingUnitIds,
      };

      // ストア経由で永続化保存
      setActiveSession(newSession);
    },
    [activeSession, setActiveSession]
  );

  /**
   * セッション終了 & 履歴保存
   */
  const endSession = useCallback(
    (userAnswers: Record<string, UnitAttemptUserAnswers>, units: ProblemUnit[]) => {
      if (!activeSession) return false;

      const unitAttempts = createUnitAttemptResult(userAnswers, units);

      if (!unitAttempts) {
        console.error('正常に保存できませんでした');
        return false;
      }

      const completeHistory: AttemptHistory = {
        id: activeSession.id!,
        startTime: activeSession.startTime!,
        problemListVersionId: activeSession.problemListVersionId!,
        workbookId: activeSession.workbookId!,
        problemListId: activeSession.problemListId!,
        endTime: Date.now(),
        unitAttempts,
      };

      // 履歴を先頭に追加して保存
      setHistories([completeHistory, ...histories]);

      // アクティブセッションをクリア
      setActiveSession(null);
      return true;
    },
    [activeSession, histories, setHistories, setActiveSession]
  );

  /**
   * セッションのキャンセル
   */
  const cancelSession = useCallback(() => {
    if (!activeSession) return;
    setActiveSession(null);
  }, [activeSession, setActiveSession]);

  /**
   * 全履歴の削除
   */
  const clearAllHistories = useCallback(() => {
    setHistories([]);
  }, [setHistories]);

  /**
   * 特定のワークブックの履歴を取得する
   */
  const getHistoriesByWorkbookId = useCallback(
    (workbookId: string, order: 'asc' | 'desc' = 'desc') => {
      return histories
        .filter((h) => h.workbookId === workbookId)
        .sort((a, b) => {
          return order === 'desc' ? b.startTime - a.startTime : a.startTime - b.startTime;
        });
    },
    [histories]
  );

  return {
    histories,
    activeSession,
    startSession,
    endSession,
    cancelSession,
    clearAllHistories,
    getHistoriesByWorkbookId,
    isSessionActive: !!activeSession,
  };
};

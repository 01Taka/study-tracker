import { useCallback, useEffect, useState } from 'react';
import { createUnitAttemptResult } from '@/shared/functions/attempt-result';
import { generateId } from '@/shared/functions/generate-id';
import { AttemptHistory, ProblemUnit, UnitAttemptUserAnswers } from '@/shared/types/app.types';

const STORAGE_KEY = 'attempt_history_list';
const ACTIVE_SESSION_KEY = 'active_attempt_session';

export const useAttemptHistory = () => {
  const [histories, setHistories] = useState<AttemptHistory[]>([]);
  const [activeSession, setActiveSession] = useState<Partial<AttemptHistory> | null>(null);

  // 初期ロード
  useEffect(() => {
    const savedHistories = localStorage.getItem(STORAGE_KEY);
    if (savedHistories) setHistories(JSON.parse(savedHistories));

    const savedSession = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (savedSession) setActiveSession(JSON.parse(savedSession));
  }, []);

  /**
   * セッション開始
   */
  const startSession = useCallback(
    (args: { problemListVersionId: string; workbookId: string; problemListId: string }) => {
      if (activeSession) return;

      const newSession: Partial<AttemptHistory> = {
        id: generateId(),
        startTime: Date.now(),
        problemListVersionId: args.problemListVersionId,
        workbookId: args.workbookId,
        problemListId: args.problemListId,
      };

      setActiveSession(newSession);
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(newSession));
    },
    [activeSession]
  );

  /**
   * セッション終了 & 履歴保存
   */
  const endSession = useCallback(
    (userAnswers: Record<string, UnitAttemptUserAnswers>, units: ProblemUnit[]) => {
      if (!activeSession) return;

      const unitAttempts = createUnitAttemptResult(userAnswers, units);

      const completeHistory: AttemptHistory = {
        id: activeSession.id!,
        startTime: activeSession.startTime!,
        problemListVersionId: activeSession.problemListVersionId!,
        workbookId: activeSession.workbookId!,
        problemListId: activeSession.problemListId!,
        endTime: Date.now(),
        unitAttempts,
      };

      setHistories((prev) => {
        const updated = [completeHistory, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      setActiveSession(null);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    },
    [activeSession]
  );

  /**
   * セッションのキャンセル
   * 進行中のデータを保存せずに破棄します
   */
  const cancelSession = useCallback(() => {
    if (!activeSession) return;

    setActiveSession(null);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }, [activeSession]);

  /**
   * 全履歴の削除
   */
  const clearAllHistories = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistories([]);
  }, []);

  /**
   * 特定のワークブックの履歴を、開始時間の降順（新しい順）で取得する
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

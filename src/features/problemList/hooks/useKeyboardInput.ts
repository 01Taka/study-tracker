import { useEffect, useRef } from 'react';
import { MARK_SELECTIONS } from '@/shared/constants/mark-selections';

interface UseKeyboardInputProps {
  active: boolean;
  handleMarkSelect: (mark: string) => void;
  handleScoringSelect: (scoring: number, isDecided: boolean) => void;
}

export const useKeyboardInput = ({
  active,
  handleMarkSelect,
  handleScoringSelect,
}: UseKeyboardInputProps) => {
  // useEffect内でのクロージャ問題を避けるため、状態をRefで保持
  const firstKeyRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // 1. 入力要素にフォーカスがある場合は処理しない
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('role') === 'searchbox';

      if (isInputFocused) return;

      const { key, ctrlKey } = event;

      // 2. スコアリング入力 (Shift + 数字)
      if (ctrlKey && /^[0-9]$/.test(key)) {
        event.preventDefault();
        const num = Number(key);

        if (firstKeyRef.current === null) {
          // 1打目: 0の場合は1として扱う（元のロジックを継承）
          const val = num === 0 ? 1 : num * 10;
          handleScoringSelect(val, false);
          firstKeyRef.current = num;
        } else {
          // 2打目: 合計値を計算して確定
          handleScoringSelect(firstKeyRef.current * 10 + num, true);
          firstKeyRef.current = null;
        }
        return;
      }

      // 3. マーク選択 (MARK_SELECTIONSに含まれるキー)
      if (MARK_SELECTIONS.includes(key)) {
        event.preventDefault();
        handleMarkSelect(key);
        // マーク入力時はスコア入力の状態をリセット（必要に応じて）
        firstKeyRef.current = null;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [active, handleMarkSelect, handleScoringSelect]);
};

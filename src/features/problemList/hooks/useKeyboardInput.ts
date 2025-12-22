import { useEffect, useRef } from 'react';
import { MARK_SELECTIONS } from '@/shared/constants/mark-selections';

interface UseKeyboardInputProps {
  active: boolean;
  digitType: 1 | 2; // 追加: 入力桁数の指定
  handleMarkSelect: (mark: string) => void;
  handleScoringSelect: (scoring: number, isDecided: boolean) => void;
}

export const useKeyboardInput = ({
  active,
  digitType,
  handleMarkSelect,
  handleScoringSelect,
}: UseKeyboardInputProps) => {
  const firstKeyRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      firstKeyRef.current = null; // 非アクティブ時に状態をリセット
      return;
    }

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('role') === 'searchbox';

      if (isInputFocused) return;

      const { key, ctrlKey } = event;

      // 2. スコアリング入力 (Ctrl + 数字)
      if (ctrlKey && /^[0-9]$/.test(key)) {
        event.preventDefault();
        const num = Number(key);

        if (digitType === 1) {
          // --- 1桁入力モード ---
          handleScoringSelect(num, true);
        } else {
          // --- 2桁入力モード ---
          if (firstKeyRef.current === null) {
            // 1打目
            const val = num === 0 ? 1 : num * 10;
            handleScoringSelect(val, false);
            firstKeyRef.current = num;
          } else {
            // 2打目
            handleScoringSelect(firstKeyRef.current * 10 + num, true);
            firstKeyRef.current = null;
          }
        }
        return;
      }

      // 3. マーク選択
      if (MARK_SELECTIONS.includes(key)) {
        event.preventDefault();
        handleMarkSelect(key);
        firstKeyRef.current = null;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [active, digitType, handleMarkSelect, handleScoringSelect]);
};

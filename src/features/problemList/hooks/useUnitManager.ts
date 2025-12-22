import { useCallback, useMemo, useState } from 'react';

export const useUnitMerge = (mergeUnitsAction: (start: number, end: number) => void) => {
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selection, setSelection] = useState<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  });

  const toggleMergeMode = useCallback(() => {
    setIsMergeMode((prev) => {
      if (prev) setSelection({ start: null, end: null });
      return !prev;
    });
  }, []);

  const handleSelect = useCallback((index: number) => {
    setSelection((prev) => {
      if (prev.start === null) return { start: index, end: null };
      if (prev.start === index) return { start: null, end: null }; // 解除
      return { ...prev, end: index };
    });
  }, []);

  const confirmMerge = useCallback(() => {
    if (selection.start !== null && selection.end !== null) {
      mergeUnitsAction(selection.start, selection.end);
      setSelection({ start: null, end: null });
      setIsMergeMode(false);
    }
  }, [selection, mergeUnitsAction]);

  // selectionが変わった時だけ Record を再計算する
  const selectedMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    const { start, end } = selection;

    if (start !== null) {
      if (end !== null) {
        // 範囲選択されている場合
        const s = Math.min(start, end);
        const e = Math.max(start, end);
        for (let i = s; i <= e; i++) {
          map[i] = true;
        }
      } else {
        // startのみ選択されている場合
        map[start] = true;
      }
    }
    return map;
  }, [selection]);

  return {
    isMergeMode,
    toggleMergeMode,
    selection,
    handleSelect,
    confirmMerge,
    selectedMap,
  };
};

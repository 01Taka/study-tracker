import { useCallback } from 'react';
import { useAppStore } from '@/features/data/store/useAppStore';
import { ProblemUnit, UnitArchiveRecord } from '@/shared/types/app.types';

export const useProblemUnitArchive = () => {
  const unitRecord = useAppStore((state) => state.unitRecord);
  const setUnitRecord = useAppStore((state) => state.setUnitRecord);

  /**
   * データの保存 (Zustand 経由で LocalStorage に自動永続化)
   */
  const updateAndSaveRecord = useCallback(
    (nextRecord: UnitArchiveRecord) => {
      setUnitRecord(nextRecord);
      // reloadWorkbook?() は、Zustand がリアクティブに全コンポーネントを更新するため不要になります
    },
    [setUnitRecord]
  );

  /**
   * 単一ユニットの取得
   */
  const getProblemUnit = useCallback(
    (id: string | undefined) => (id ? unitRecord[id] || null : null),
    [unitRecord]
  );

  /**
   * 複数ユニットの取得（フィルタリング込み）
   */
  const getProblemUnits = useCallback(
    (paths: string[], filterIds?: string[]) => {
      return paths
        .map((path) => unitRecord[path])
        .filter((unit): unit is ProblemUnit => {
          if (!unit) return false;
          if (!filterIds || filterIds.length === 0) return true;
          return filterIds.includes(unit.unitId);
        });
    },
    [unitRecord]
  );

  return {
    unitRecord,
    updateAndSaveRecord,
    getProblemUnit,
    getProblemUnits,
  };
};

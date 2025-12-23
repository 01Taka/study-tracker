import { useCallback, useEffect, useState } from 'react';
import { ProblemUnit, UnitArchiveRecord } from '@/shared/types/app.types';

const UNITS_STORAGE_KEY = 'app_units_record';

export const useProblemUnitArchive = (reloadWorkbook?: () => void) => {
  const [unitRecord, setUnitRecord] = useState<UnitArchiveRecord>({});

  // データの読み込み
  const reloadUnitRecord = useCallback(() => {
    const saved = localStorage.getItem(UNITS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUnitRecord(parsed);
        return parsed as UnitArchiveRecord;
      } catch (e) {
        console.error('Failed to load units:', e);
      }
    }
    return null;
  }, []);

  // 初回マウント時に読み込み
  useEffect(() => {
    reloadUnitRecord();
  }, [reloadUnitRecord]);

  // データの保存
  const updateAndSaveRecord = useCallback(
    (nextRecord: UnitArchiveRecord) => {
      setUnitRecord(nextRecord);
      try {
        localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(nextRecord));
      } catch (e) {
        console.error('Failed to save units:', e);
      }
      reloadWorkbook?.();
    },
    [reloadWorkbook]
  );

  // 単一ユニットの取得
  const getProblemUnit = useCallback(
    (id: string | undefined) => (id ? unitRecord[id] || null : null),
    [unitRecord]
  );

  // 複数ユニットの取得（フィルタリング込み）
  const getProblemUnits = useCallback(
    (paths: string[], filterIds?: string[]) => {
      return paths
        .map((path) => unitRecord[path])
        .filter((unit): unit is ProblemUnit => {
          if (!unit) return false;
          if (!filterIds) return true;
          return filterIds.includes(unit.unitId);
        });
    },
    [unitRecord]
  );

  return {
    unitRecord,
    reloadUnitRecord,
    updateAndSaveRecord,
    getProblemUnit,
    getProblemUnits,
  };
};

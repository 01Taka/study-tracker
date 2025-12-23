import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  AttemptHistory,
  AttemptingSessionData,
  HierarchyArchiveRecord,
  UnitArchiveRecord,
  Workbook,
} from '@/shared/types/app.types';

export interface AppState {
  // --- Data States ---
  workbooks: Workbook[];
  hierarchyRecord: HierarchyArchiveRecord;
  unitRecord: UnitArchiveRecord;
  histories: AttemptHistory[];
  activeSession: AttemptingSessionData | null;

  // --- Actions ---
  // Workbook
  setWorkbooks: (workbooks: Workbook[]) => void;

  // Hierarchy
  setHierarchyRecord: (record: HierarchyArchiveRecord) => void;

  // Unit
  setUnitRecord: (record: UnitArchiveRecord) => void;

  // Attempt History / Session
  setHistories: (histories: AttemptHistory[]) => void;
  setActiveSession: (session: AttemptingSessionData | null) => void;

  // --- Utility Actions (全リセットなど) ---
  clearAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial States
      workbooks: [],
      hierarchyRecord: {},
      unitRecord: {},
      histories: [],
      activeSession: null,

      // Actions
      setWorkbooks: (workbooks) => set({ workbooks }),

      setHierarchyRecord: (hierarchyRecord) => set({ hierarchyRecord }),

      setUnitRecord: (unitRecord) => set({ unitRecord }),

      setHistories: (histories) => set({ histories }),

      setActiveSession: (activeSession) => set({ activeSession }),

      clearAllData: () =>
        set({
          workbooks: [],
          hierarchyRecord: {},
          unitRecord: {},
          histories: [],
          activeSession: null,
        }),
    }),
    {
      name: 'app_master_storage', // localStorageのキー名（一つに集約されます）
      storage: createJSONStorage(() => localStorage),
      // 既存の個別のキー名から移行が必要な場合は、migrate オプションが使えます
    }
  )
);

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useHierarchyData } from '@/features/data/hooks/useHierarchyData';
import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { ProblemUnit, ProblemUnitData } from '@/shared/types/app.types';

interface UseEditTabProps {
  workbookId: string;
  problemListId: string;
  hierarchyIds: string[];
}

export const useEditTab = ({ workbookId, problemListId, hierarchyIds }: UseEditTabProps) => {
  // --- Zustand Store を利用する Hooks ---
  const { hierarchyRecord, onCreateHierarchy, onDeleteHierarchy } = useHierarchyData();
  const { getProblemUnits, insertUnitsToHierarchy, removeUnitFromHierarchy, updateUnit } =
    useProblemUnitData();

  // --- States ---
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<ProblemUnit | null>(null);
  const [newHierarchyName, setNewHierarchyName] = useState('');

  // Modals
  const [createHModalOpened, { open: openCreateH, close: closeCreateH }] = useDisclosure(false);
  const [bulkAddOpened, { open: openBulkAdd, close: closeBulkAdd }] = useDisclosure(false);
  const [unitEditOpened, { open: openUnitEdit, close: closeUnitEdit }] = useDisclosure(false);

  // --- Derived State (ZustandのStateから自動計算) ---
  const hierarchies = useMemo(() => {
    return hierarchyIds?.map((id) => hierarchyRecord[id]).filter((h) => !!h) ?? [];
  }, [hierarchyIds, hierarchyRecord]);

  const currentHierarchy = useMemo(
    () => hierarchies.find((h) => h.hierarchyId === activeTab),
    [hierarchies, activeTab]
  );

  const currentUnits = useMemo(() => {
    if (!currentHierarchy) return [];
    return getProblemUnits(currentHierarchy.unitAchieveIds);
  }, [currentHierarchy, getProblemUnits]);

  // 初回タブ選択
  useEffect(() => {
    if (activeTab === null && hierarchies.length > 0) {
      setActiveTab(hierarchies[0].hierarchyId);
    }
  }, [activeTab, hierarchies]);

  // 次の問題番号を計算
  const totalProblemsCount = useMemo(() => {
    return currentUnits.reduce(
      (acc, u) => acc + (u.problemType === 'SINGLE' ? 1 : u.problems.length),
      0
    );
  }, [currentUnits]);

  // --- Handlers ---
  const handleCreateHierarchy = useCallback(() => {
    if (!newHierarchyName.trim()) return;
    onCreateHierarchy(workbookId, problemListId, { name: newHierarchyName });
    setNewHierarchyName('');
    closeCreateH();
  }, [workbookId, problemListId, newHierarchyName, onCreateHierarchy, closeCreateH]);

  const handleDeleteUnit = useCallback(
    (unitId: string) => {
      if (!currentHierarchy) return;
      if (window.confirm('削除しますか？')) {
        removeUnitFromHierarchy(currentHierarchy.hierarchyId, unitId);
      }
    },
    [currentHierarchy, removeUnitFromHierarchy]
  );

  const handleAddUnits = useCallback(
    (dataList: ProblemUnitData[]) => {
      if (!currentHierarchy) return;
      insertUnitsToHierarchy({
        workbookId,
        problemListId,
        hierarchyId: currentHierarchy.hierarchyId,
        dataList,
      });
      closeBulkAdd();
    },
    [workbookId, problemListId, currentHierarchy, insertUnitsToHierarchy, closeBulkAdd]
  );

  const handleUpdateUnit = useCallback(
    (data: ProblemUnitData) => {
      if (editingUnit) {
        updateUnit(editingUnit.unitId, data);
      }
    },
    [editingUnit, updateUnit]
  );

  return {
    // Data
    hierarchies,
    activeTab,
    setActiveTab,
    currentHierarchy,
    currentUnits,
    editingUnit,
    setEditingUnit,
    newHierarchyName,
    setNewHierarchyName,
    totalProblemsCount,
    // Modal State
    createHModalOpened,
    openCreateH,
    closeCreateH,
    bulkAddOpened,
    openBulkAdd,
    closeBulkAdd,
    unitEditOpened,
    openUnitEdit,
    closeUnitEdit,
    // Actions
    handleCreateHierarchy,
    handleDeleteUnit,
    handleAddUnits,
    handleUpdateUnit,
  };
};

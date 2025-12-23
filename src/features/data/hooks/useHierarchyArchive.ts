import { useCallback } from 'react';
import { useAppStore } from '@/features/data/store/useAppStore';
import { generateId } from '@/shared/functions/generate-id';
import { HierarchyArchiveRecord, UserDefinedHierarchy } from '@/shared/types/app.types';

export const useHierarchyArchive = () => {
  const hierarchyRecord = useAppStore((state) => state.hierarchyRecord);
  const setHierarchyRecord = useAppStore((state) => state.setHierarchyRecord);

  const updateAndSaveHierarchyRecord = useCallback(
    (nextRecord: HierarchyArchiveRecord) => {
      setHierarchyRecord(nextRecord);
    },
    [setHierarchyRecord]
  );

  const getHierarchy = useCallback(
    (id: string | undefined) => (id ? hierarchyRecord[id] || null : null),
    [hierarchyRecord]
  );

  const addHierarchy = useCallback(
    (hierarchy: Partial<UserDefinedHierarchy> & Omit<UserDefinedHierarchy, 'hierarchyId'>) => {
      const id = hierarchy.hierarchyId || generateId();
      const newHierarchy: UserDefinedHierarchy = { ...hierarchy, hierarchyId: id };

      setHierarchyRecord({
        ...hierarchyRecord,
        [id]: newHierarchy,
      });

      return newHierarchy;
    },
    [hierarchyRecord, setHierarchyRecord]
  );

  return {
    hierarchyRecord,
    updateAndSaveHierarchyRecord,
    getHierarchy,
    addHierarchy,
  };
};

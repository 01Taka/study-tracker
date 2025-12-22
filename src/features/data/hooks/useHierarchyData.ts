import { useCallback } from 'react';
import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { generateId } from '@/shared/functions/generate-id';
import { UserDefinedHierarchy } from '@/shared/types/app.types';

export const useHierarchyData = (reloadWorkbook?: () => void) => {
  const { workbooks, updateWorkbooks } = useWorkbookData();

  const onCreateHierarchy = useCallback(
    (workbookId: string, problemListId: string, data: { name: string }) => {
      const newHierarchy: UserDefinedHierarchy = {
        id: generateId(),
        name: data.name,
        unitVersionPaths: [],
      };
      updateWorkbooks((prevWorkbooks) =>
        prevWorkbooks.map((wb) => {
          if (wb.id !== workbookId) return wb;
          return {
            ...wb,
            problemLists: wb.problemLists.map((pl) => {
              if (pl.id !== problemListId) return pl;
              return {
                ...pl,
                hierarchies: [...pl.hierarchies, newHierarchy],
              };
            }),
          };
        })
      );
      reloadWorkbook?.();
    },
    [updateWorkbooks, reloadWorkbook]
  );

  const onDeleteHierarchy = useCallback(
    (workbookId: string, problemListId: string, hierarchyId: string) => {
      updateWorkbooks((prevWorkbooks) =>
        prevWorkbooks.map((wb) => {
          if (wb.id !== workbookId) return wb;
          return {
            ...wb,
            problemLists: wb.problemLists.map((pl) => {
              if (pl.id !== problemListId) return pl;
              return {
                ...pl,
                hierarchies: pl.hierarchies.filter((h) => h.id !== hierarchyId),
              };
            }),
          };
        })
      );
      reloadWorkbook?.();
    },
    [updateWorkbooks, reloadWorkbook]
  );

  // ... (onAddUnitPaths, onReplaceUnitPath, onRemoveUnitPath もそのまま残してOKですが、
  //      一括更新があれば使用頻度は下がります) ...

  const onAddUnitPaths = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      unitVersionPaths: string[],
      targetIndex?: number
    ) => {
      updateWorkbooks((prevWorkbooks) =>
        prevWorkbooks.map((wb) => {
          if (wb.id !== workbookId) return wb;
          return {
            ...wb,
            problemLists: wb.problemLists.map((pl) => {
              if (pl.id !== problemListId) return pl;
              return {
                ...pl,
                hierarchies: pl.hierarchies.map((h) => {
                  if (h.id !== hierarchyId) return h;
                  const index = targetIndex ?? h.unitVersionPaths.length;
                  const nextPaths = [
                    ...h.unitVersionPaths.slice(0, index),
                    ...unitVersionPaths,
                    ...h.unitVersionPaths.slice(index),
                  ];
                  return { ...h, unitVersionPaths: nextPaths };
                }),
              };
            }),
          };
        })
      );
      reloadWorkbook?.();
    },
    [updateWorkbooks, reloadWorkbook]
  );

  const onReplaceUnitPath = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      targetPath: string,
      newPath: string
    ) => {
      updateWorkbooks((prevWorkbooks) =>
        prevWorkbooks.map((wb) => {
          if (wb.id !== workbookId) return wb;
          return {
            ...wb,
            problemLists: wb.problemLists.map((pl) => {
              if (pl.id !== problemListId) return pl;
              return {
                ...pl,
                hierarchies: pl.hierarchies.map((h) => {
                  if (h.id !== hierarchyId) return h;
                  return {
                    ...h,
                    unitVersionPaths: h.unitVersionPaths.map((path) =>
                      path === targetPath ? newPath : path
                    ),
                  };
                }),
              };
            }),
          };
        })
      );
      reloadWorkbook?.();
    },
    [updateWorkbooks, reloadWorkbook]
  );

  const onRemoveUnitPath = useCallback(
    (workbookId: string, problemListId: string, hierarchyId: string, targetPath: string) => {
      updateWorkbooks((prevWorkbooks) =>
        prevWorkbooks.map((wb) => {
          if (wb.id !== workbookId) return wb;
          return {
            ...wb,
            problemLists: wb.problemLists.map((pl) => {
              if (pl.id !== problemListId) return pl;
              return {
                ...pl,
                hierarchies: pl.hierarchies.map((h) => {
                  if (h.id !== hierarchyId) return h;
                  return {
                    ...h,
                    unitVersionPaths: h.unitVersionPaths.filter((path) => path !== targetPath),
                  };
                }),
              };
            }),
          };
        })
      );
      reloadWorkbook?.();
    },
    [updateWorkbooks, reloadWorkbook]
  );

  /**
   * 6. 階層内のパス配列を完全に置き換える (一括更新用)
   * insertやupdate時のRe-index処理後に、計算済みの全パスを一発で反映させるために使用します。
   */
  const onUpdateHierarchyPaths = useCallback(
    (workbookId: string, problemListId: string, hierarchyId: string, newPaths: string[]) => {
      updateWorkbooks((prevWorkbooks) =>
        prevWorkbooks.map((wb) => {
          if (wb.id !== workbookId) return wb;
          return {
            ...wb,
            problemLists: wb.problemLists.map((pl) => {
              if (pl.id !== problemListId) return pl;
              return {
                ...pl,
                hierarchies: pl.hierarchies.map((h) => {
                  if (h.id !== hierarchyId) return h;
                  return {
                    ...h,
                    unitVersionPaths: newPaths, // 配列を丸ごと置換
                  };
                }),
              };
            }),
          };
        })
      );
      reloadWorkbook?.();
    },
    [updateWorkbooks, reloadWorkbook]
  );

  return {
    workbooks,
    onCreateHierarchy,
    onDeleteHierarchy,
    onAddUnitPaths,
    onReplaceUnitPath,
    onRemoveUnitPath,
    onUpdateHierarchyPaths,
  };
};

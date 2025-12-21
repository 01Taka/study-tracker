import { useCallback } from 'react';
import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { generateId } from '@/shared/functions/generate-id';
import { UserDefinedHierarchy } from '@/shared/types/app.types';

export const useHierarchyData = (reloadWorkbook?: () => void) => {
  const { setWorkbooks } = useWorkbookData();

  /**
   * 1. 新しい空のUserDefinedHierarchyを作成する
   */
  const onCreateHierarchy = useCallback(
    (workbookId: string, problemListId: string, data: { name: string }) => {
      const newHierarchy: UserDefinedHierarchy = {
        id: generateId(),
        name: data.name,
        unitVersionPaths: [],
      };

      setWorkbooks((prevWorkbooks) =>
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
      // 更新後にリロードを実行
      reloadWorkbook?.();
    },
    [setWorkbooks, reloadWorkbook]
  );

  /**
   * 2. 特定のIdのヒエラルキーを削除する
   */
  const onDeleteHierarchy = useCallback(
    (workbookId: string, problemListId: string, hierarchyId: string) => {
      setWorkbooks((prevWorkbooks) =>
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
    [setWorkbooks, reloadWorkbook]
  );

  /**
   * 3. ヒエラルキーのunitVersionPathsを一括追加する
   */
  const onAddUnitPaths = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      unitVersionPaths: string[]
    ) => {
      setWorkbooks((prevWorkbooks) =>
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
                    unitVersionPaths: [...h.unitVersionPaths, ...unitVersionPaths],
                  };
                }),
              };
            }),
          };
        })
      );
      reloadWorkbook?.();
    },
    [setWorkbooks, reloadWorkbook]
  );

  /**
   * 4. unitVersionPathsに含まれる特定のパスを新しいパスに置換する
   */
  const onReplaceUnitPath = useCallback(
    (
      workbookId: string,
      problemListId: string,
      hierarchyId: string,
      targetPath: string,
      newPath: string
    ) => {
      setWorkbooks((prevWorkbooks) =>
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
    [setWorkbooks, reloadWorkbook]
  );

  /**
   * 5. unitVersionPathsに含まれる特定のパスを削除する
   */
  const onRemoveUnitPath = useCallback(
    (workbookId: string, problemListId: string, hierarchyId: string, targetPath: string) => {
      setWorkbooks((prevWorkbooks) =>
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
    [setWorkbooks, reloadWorkbook]
  );

  return {
    onCreateHierarchy,
    onDeleteHierarchy,
    onAddUnitPaths,
    onReplaceUnitPath,
    onRemoveUnitPath,
  };
};

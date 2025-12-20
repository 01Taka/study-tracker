import { useCallback } from 'react';
import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { generateId } from '@/shared/functions/generate-id';
import { UserDefinedHierarchy } from '@/shared/types/app.types';

export const useHierarchyData = () => {
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
          console.log(wb);

          if (wb.id !== workbookId) return wb;
          console.log(prevWorkbooks, newHierarchy);

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
    },
    [setWorkbooks]
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
    },
    [setWorkbooks]
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
    },
    [setWorkbooks]
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
    },
    [setWorkbooks]
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
    },
    [setWorkbooks]
  );

  return {
    onCreateHierarchy,
    onDeleteHierarchy,
    onAddUnitPaths,
    onReplaceUnitPath,
    onRemoveUnitPath,
  };
};

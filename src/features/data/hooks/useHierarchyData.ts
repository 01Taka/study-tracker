import { useCallback } from 'react';
import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { generateId } from '@/shared/functions/generate-id';
import { UserDefinedHierarchy } from '@/shared/types/app.types';

export const useHierarchyData = (reloadWorkbook?: () => void) => {
  const { updateWorkbooks } = useWorkbookData();

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
      // 更新後にリロードを実行
      reloadWorkbook?.();
    },
    [updateWorkbooks, reloadWorkbook]
  );

  /**
   * 2. 特定のIdのヒエラルキーを削除する
   */
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

  /**
   * 3. ヒエラルキーのunitVersionPathsを一括追加する
   * targetIndex が指定された場合はその位置に挿入し、指定がない場合は末尾に追加する
   */
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

                  // 挿入位置の決定
                  const index = targetIndex ?? h.unitVersionPaths.length;

                  // 指定位置に新しいパスを挿入した新しい配列を作成
                  const nextPaths = [
                    ...h.unitVersionPaths.slice(0, index),
                    ...unitVersionPaths,
                    ...h.unitVersionPaths.slice(index),
                  ];

                  return {
                    ...h,
                    unitVersionPaths: nextPaths,
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

  /**
   * 5. unitVersionPathsに含まれる特定のパスを削除する
   */
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

  return {
    onCreateHierarchy,
    onDeleteHierarchy,
    onAddUnitPaths,
    onReplaceUnitPath,
    onRemoveUnitPath,
  };
};

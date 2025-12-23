import { useCallback } from 'react';
import { generateId } from '@/shared/functions/generate-id';
import { ProblemUnit, ProblemUnitData } from '@/shared/types/app.types';
import { useHierarchyData } from './useHierarchyData';
import { useProblemUnitArchive } from './useProblemUnitArchive'; // 切り出したフック

export const useProblemUnitData = () => {
  // ストレージ操作の責務を委譲
  const { unitRecord, updateAndSaveRecord, getProblemUnit, getProblemUnits } =
    useProblemUnitArchive();

  const { workbooks, hierarchyRecord, onUpdateHierarchyPaths, onRemoveUnitPath } =
    useHierarchyData();

  /**
   * コアロジック: リインデックス
   */
  const processAndReindexUnits = useCallback(
    (virtualUnits: ProblemUnit[]) => {
      const nextRecord = { ...unitRecord };
      let currentNum = 1;
      const newPathsSequence: string[] = [];
      const newlyGeneratedIds: string[] = [];

      virtualUnits.forEach((unit) => {
        const isNewEntry = !unit.unitId;
        const needsNewVersion = isNewEntry || unit.problems[0]?.problemNumber !== currentNum;

        if (needsNewVersion) {
          const newId = generateId();
          const updatedUnit: ProblemUnit = {
            ...unit,
            unitId: newId,
            problems: unit.problems.map((p) => ({
              ...p,
              problemNumber: currentNum++,
            })),
          };

          nextRecord[newId] = updatedUnit;
          newPathsSequence.push(newId);
          newlyGeneratedIds.push(newId);
        } else {
          newPathsSequence.push(unit.unitId);
          currentNum += unit.problems.length;
        }
      });

      updateAndSaveRecord(nextRecord);

      return { newPathsSequence, newlyGeneratedIds };
    },
    [unitRecord, updateAndSaveRecord]
  );

  /**
   * 挿入アクション
   */
  const insertUnitsToHierarchy = useCallback(
    ({
      workbookId,
      problemListId,
      hierarchyId,
      dataList,
      index,
    }: {
      workbookId: string;
      problemListId: string;
      hierarchyId: string;
      dataList: ProblemUnitData[];
      index?: number;
    }) => {
      const hierarchy = hierarchyRecord[hierarchyId];
      if (!hierarchy) return [];

      const currentOrderedUnits = hierarchy.unitAchieveIds
        .map((id) => unitRecord[id])
        .filter((u): u is ProblemUnit => !!u);

      const newUnitsToInsert = dataList.map(
        (data) =>
          ({
            ...data,
            unitId: '',
            workbookId,
            problemListId,
            hierarchyId,
            lastAttemptedAt: 0,
            answerStructureId: generateId(),
            problems: data.answers.map((ans) => ({ problemNumber: 0, answer: ans })),
          }) as ProblemUnit
      );

      const virtualUnits = [...currentOrderedUnits];
      virtualUnits.splice(index ?? currentOrderedUnits.length, 0, ...newUnitsToInsert);

      const { newPathsSequence, newlyGeneratedIds } = processAndReindexUnits(virtualUnits);
      onUpdateHierarchyPaths(hierarchyId, newPathsSequence);

      return newlyGeneratedIds;
    },
    [workbooks, unitRecord, hierarchyRecord, processAndReindexUnits, onUpdateHierarchyPaths]
  );

  /**
   * 更新アクション
   */
  /**
   * Unit編集
   */
  const updateUnit = useCallback(
    (unitId: string, newData: ProblemUnitData) => {
      const currentUnit = unitRecord[unitId];
      if (!currentUnit) return;

      const { hierarchyId } = currentUnit;
      const hierarchy = hierarchyRecord[hierarchyId];
      if (!hierarchy) return;

      // 1. 変更があるかどうかの厳密なチェック（早期リターン用）
      const isAnswerUnchanged =
        currentUnit.problems.length === newData.answers.length &&
        currentUnit.problems.every((p, i) => p.answer === newData.answers[i]);

      const isSettingsUnchanged =
        currentUnit.question === newData.question &&
        currentUnit.scoring === newData.scoring &&
        currentUnit.problemType === newData.problemType &&
        currentUnit.answerType === newData.answerType;

      // 値が全く変わっていない場合は、何もしない
      if (isAnswerUnchanged && isSettingsUnchanged) {
        return [];
      }

      // 2. 回答構造IDの判定 (回答内容が変わった場合のみ新しいIDを発行)
      const structureId = isAnswerUnchanged ? currentUnit.answerStructureId : generateId();

      // 3. 仮想リスト作成 (対象のみ置換)
      const virtualUnits = hierarchy.unitAchieveIds
        .map((id) => {
          const unit = unitRecord[id];
          if (!unit) return null;

          if (id === unitId) {
            return {
              ...unit,
              ...newData,
              lastAttemptedAt: 0, // 値が変わったので最終取組日時をリセット
              answerStructureId: structureId,
              problems: newData.answers.map((ans) => ({
                problemNumber: 0, // processAndReindexUnits内で決定
                answer: ans,
              })),
            } as ProblemUnit;
          }
          return unit;
        })
        .filter((u): u is ProblemUnit => !!u);

      // 4. 再計算と一括保存
      const { newPathsSequence, newlyGeneratedIds } = processAndReindexUnits(virtualUnits);

      // 5. Hierarchyへの反映
      onUpdateHierarchyPaths(hierarchyId, newPathsSequence);

      return newlyGeneratedIds;
    },
    [workbooks, unitRecord, hierarchyRecord, processAndReindexUnits, onUpdateHierarchyPaths]
  );

  return {
    unitRecord,
    updateAndSaveRecord,
    getProblemUnit,
    getProblemUnits,
    insertUnitsToHierarchy,
    removeUnitFromHierarchy: onRemoveUnitPath,
    updateUnit,
  };
};

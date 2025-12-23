import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttemptHistory } from '@/features/data/hooks/useAttemptHistory';
import { useHierarchyData } from '@/features/data/hooks/useHierarchyData';
import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { getLatestAttemptMap } from '@/shared/functions/attempt-utils';
import { useUnitSelection } from '@/shared/hooks/useUnitSelection';
import {
  ProblemList,
  ProblemUnit,
  StartSessionFilterType,
  UserDefinedHierarchy,
  Workbook,
} from '@/shared/types/app.types';

interface UseProblemListModalProps {
  workbook: Workbook | null;
  problemList: ProblemList | null;
}

export const useProblemListModal = ({ workbook, problemList }: UseProblemListModalProps) => {
  const navigate = useNavigate();

  // ZustandベースのHooks（引数のreloadWorkbookは不要になりました）
  const { hierarchyRecord } = useHierarchyData();
  const { unitRecord } = useProblemUnitData();
  const { isSessionActive, startSession, cancelSession, getHistoriesByWorkbookId } =
    useAttemptHistory();

  // 1. 履歴データの取得
  const histories = useMemo(
    () => (workbook ? getHistoriesByWorkbookId(workbook.id) : []),
    [workbook, getHistoriesByWorkbookId]
  );

  // 2. 最新の回答結果マップを作成
  const latestAttemptMap = useMemo(() => {
    return problemList ? getLatestAttemptMap(problemList, histories, hierarchyRecord) : {};
  }, [problemList, histories, hierarchyRecord]);

  // 3. 階層情報の構築
  const hierarchyIds = useMemo(() => problemList?.currentHierarchyAchieveIds ?? [], [problemList]);

  const listData = useMemo(() => {
    return hierarchyIds
      .map((id) => {
        const hierarchy = hierarchyRecord[id];
        if (!hierarchy) return undefined;
        const units = hierarchy.unitAchieveIds
          .map((unitId) => unitRecord[unitId])
          .filter((u): u is ProblemUnit => !!u);
        return { hierarchy, units };
      })
      .filter((data): data is { hierarchy: UserDefinedHierarchy; units: ProblemUnit[] } => !!data);
  }, [hierarchyIds, unitRecord, hierarchyRecord]);

  // 4. 全ユニットIDの抽出
  const unitIds = useMemo(
    () => listData.flatMap((data) => data.units.map((unit) => unit.unitId)),
    [listData]
  );

  // 5. 選択ロジック（カスタムフックをラップ）
  const { getIsSelected, getSelectedUnitIds, getSelectedCount } = useUnitSelection(
    unitIds,
    latestAttemptMap
  );

  // 6. セッション開始アクション
  const handleStartSession = useCallback(
    (filter: StartSessionFilterType) => {
      if (!workbook || !problemList) return;

      if (isSessionActive) {
        cancelSession();
      }

      const attemptingUnitIds = getSelectedUnitIds(filter);

      startSession({
        problemListVersionId: 'ver1.0',
        workbookId: workbook.id,
        problemListId: problemList.id,
        attemptingUnitIds,
      });

      navigate(`/tackle/${workbook.id}/${problemList.id}`);
    },
    [
      workbook,
      problemList,
      isSessionActive,
      cancelSession,
      startSession,
      getSelectedUnitIds,
      navigate,
    ]
  );

  return {
    histories,
    listData,
    hierarchyIds,
    getIsSelected,
    getSelectedCount,
    handleStartSession,
  };
};

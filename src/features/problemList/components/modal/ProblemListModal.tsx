import React, { useCallback, useMemo } from 'react';
import { IconChartBar, IconEdit, IconPlayerPlay, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Center,
  Drawer,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useAttemptHistory } from '@/features/data/hooks/useAttemptHistory';
import { useHierarchyData } from '@/features/data/hooks/useHierarchyData';
import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { getLatestAttemptMap } from '@/shared/functions/attempt-utils';
import { safeArrayToRecord } from '@/shared/functions/object-utils';
import { useUnitSelection } from '@/shared/hooks/useUnitSelection';
import { ProblemList, StartSessionFilterType, Workbook } from '@/shared/types/app.types';
import { AnalysisTab } from './analysisTab/AnalysisTab';
import { EditTab } from './editTab/EditTab';
import { StartSessionTab } from './startSessionTab/StartSessionTab';

interface ProblemListModalProps {
  opened: boolean;
  onClose: () => void;
  workbook: Workbook | null;
  problemList: ProblemList | null;
  reloadWorkbook: () => void;
}

export const ProblemListModal: React.FC<ProblemListModalProps> = ({
  opened,
  onClose,
  workbook,
  problemList,
  reloadWorkbook,
}) => {
  const navigate = useNavigate();

  const { onCreateHierarchy, onDeleteHierarchy } = useHierarchyData(reloadWorkbook);

  const {
    unitRecord,
    getProblemUnits,
    insertUnitsToHierarchy,
    removeUnitFromHierarchy,
    updateUnit,
  } = useProblemUnitData(reloadWorkbook);

  const { isSessionActive, startSession, cancelSession, getHistoriesByWorkbookId } =
    useAttemptHistory();

  const hierarchiesMap = useMemo(() => {
    return problemList?.hierarchies ? safeArrayToRecord(problemList.hierarchies, 'id') : {};
  }, [problemList?.hierarchies]);

  const unitsMapByHierarchy = useMemo(
    () =>
      problemList
        ? Object.fromEntries(
            problemList.hierarchies.map((hierarchy) => [
              hierarchy.id,
              hierarchy.unitVersionPaths.map((path) => unitRecord[path]),
            ])
          )
        : {},
    [problemList, unitRecord]
  );

  const histories = useMemo(
    () => (workbook ? getHistoriesByWorkbookId(workbook.id) : []),
    [workbook, getHistoriesByWorkbookId]
  );

  const latestAttemptMap = problemList ? getLatestAttemptMap(problemList, histories) : {};

  const unitIds = useMemo(
    () => Object.values(unitsMapByHierarchy).flatMap((data) => data.map((unit) => unit.unitId)),
    [unitsMapByHierarchy]
  );

  const { getIsSelected, getSelectedUnitIds, getSelectedCount } = useUnitSelection(
    unitIds,
    latestAttemptMap
  );

  const listData = useMemo(() => {
    return Object.entries(unitsMapByHierarchy).map(([hierarchyId, units]) => ({
      hierarchy: hierarchiesMap[hierarchyId],
      units,
    }));
  }, [unitsMapByHierarchy, hierarchiesMap, histories]);

  const handleStartSession = useCallback(
    (filter: StartSessionFilterType) => {
      if (workbook && problemList) {
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
      }
    },
    [workbook, problemList, isSessionActive, cancelSession, startSession, getSelectedUnitIds]
  );

  // データがない場合の表示（ガード句）
  const renderEmptyState = () => (
    <Center style={{ flex: 1 }} p="xl">
      <Stack align="center" gap="sm">
        {!workbook || !problemList ? (
          <>
            <Loader size="sm" />
            <Text c="dimmed" size="sm">
              データを読み込んでいます...
            </Text>
          </>
        ) : (
          <Text c="dimmed">データが見つかりませんでした</Text>
        )}
      </Stack>
    </Center>
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      size="100%"
      padding={0}
      withCloseButton={false}
      styles={{ content: { display: 'flex', flexDirection: 'column' } }}
    >
      {/* 固定ヘッダー */}
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between">
          <Box>
            <Title order={4} size="sm" c="dimmed">
              {workbook?.name || '---'}
            </Title>
            <Title order={2} size="h3">
              {problemList?.name || '読み込み中...'}
            </Title>
          </Box>
          <ActionIcon variant="subtle" color="gray" onClick={onClose} size="lg">
            <IconX size={28} />
          </ActionIcon>
        </Group>
      </Box>

      {/* コンテンツエリア */}
      {!workbook || !problemList ? (
        renderEmptyState()
      ) : (
        <Tabs defaultValue="start" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Tabs.List grow>
            <Tabs.Tab value="start" leftSection={<IconPlayerPlay size={16} />}>
              回答開始
            </Tabs.Tab>
            <Tabs.Tab value="analysis" leftSection={<IconChartBar size={16} />}>
              分析
            </Tabs.Tab>
            <Tabs.Tab value="edit" leftSection={<IconEdit size={16} />}>
              編集
            </Tabs.Tab>
          </Tabs.List>

          <Box style={{ flex: 1, overflowY: 'auto' }} p="md">
            <Tabs.Panel value="start">
              <StartSessionTab
                onStartSession={handleStartSession}
                listData={listData}
                getIsSelected={getIsSelected}
                getSelectedCount={getSelectedCount}
              />
            </Tabs.Panel>
            <Tabs.Panel value="analysis">
              <AnalysisTab histories={histories} unitIds={Object.keys(unitRecord)} />
            </Tabs.Panel>
            <Tabs.Panel value="edit">
              <EditTab
                workbookId={workbook.id}
                problemListId={problemList.id}
                hierarchies={problemList.hierarchies}
                onCreateHierarchy={onCreateHierarchy}
                onDeleteHierarchy={onDeleteHierarchy}
                getProblemUnits={getProblemUnits}
                insertUnitsToHierarchy={insertUnitsToHierarchy}
                removeUnitFromHierarchy={removeUnitFromHierarchy}
                updateUnit={updateUnit}
              />
            </Tabs.Panel>
          </Box>
        </Tabs>
      )}
    </Drawer>
  );
};

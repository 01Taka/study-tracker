import React, { useMemo } from 'react';
import { IconChartBar, IconEdit, IconPlayerPlay, IconX } from '@tabler/icons-react';
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
import { getLatestAttemptMap } from '@/shared/functions/attempt-result';
import { safeArrayToRecord } from '@/shared/functions/object-utils';
import {
  createUnitSelectionChecker,
  getUnitSelectedStateMap,
} from '@/shared/functions/unit-selector';
import { useProblemNumbers } from '@/shared/hooks/useProblemNumbers';
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
  onStartSession: (type: StartSessionFilterType) => void;
}

export const ProblemListModal: React.FC<ProblemListModalProps> = ({
  opened,
  onClose,
  workbook,
  problemList,
  reloadWorkbook,
  onStartSession,
}) => {
  const { onCreateHierarchy, onDeleteHierarchy } = useHierarchyData(reloadWorkbook);

  const { unitRecord, getProblemUnits, addUnitsToHierarchy, removeUnitFromHierarchy, updateUnit } =
    useProblemUnitData(reloadWorkbook);

  const { getHistoriesByWorkbookId } = useAttemptHistory();

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

  const { problemNumberMap } = useProblemNumbers(unitsMapByHierarchy);

  const histories = useMemo(
    () => (workbook ? getHistoriesByWorkbookId(workbook.id) : []),
    [workbook, getHistoriesByWorkbookId]
  );

  const latestAttemptMap = problemList ? getLatestAttemptMap(problemList, histories) : {};

  const unitIds = useMemo(
    () => Object.values(unitsMapByHierarchy).flatMap((data) => data.map((unit) => unit.unitId)),
    [unitsMapByHierarchy]
  );

  const { getIsSelected, getSelectedCount } = useUnitSelection(unitIds, latestAttemptMap);

  const listData = useMemo(() => {
    return Object.entries(unitsMapByHierarchy).map(([hierarchyId, units]) => ({
      hierarchy: hierarchiesMap[hierarchyId],
      units,
    }));
  }, [unitsMapByHierarchy, hierarchiesMap, histories]);

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
                onStartSession={onStartSession}
                listData={listData}
                problemNumberMap={problemNumberMap}
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
                addUnitsToHierarchy={addUnitsToHierarchy}
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

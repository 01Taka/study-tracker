import React, { useMemo, useState } from 'react';
import { IconEdit, IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ProblemList, ProblemUnit, ProblemUnitData } from '@/shared/types/app.types';
import { BulkAddModal } from './editTab/BulkAddModal';
import { UnitEditModal } from './editTab/UnitEditModal';

interface EditTabProps {
  workbookId: string;
  problemList: ProblemList;
  onCreateHierarchy: (wbId: string, plId: string, data: { name: string }) => void;
  onDeleteHierarchy: (wbId: string, plId: string, hId: string) => void;
  onUpdateHierarchyName?: (wbId: string, plId: string, hId: string, name: string) => void;
  getProblemUnits: (paths: string[]) => ProblemUnit[];
  addUnitsToHierarchy: (wbId: string, plId: string, hId: string, data: ProblemUnitData[]) => void;
  removeUnitFromHierarchy: (wbId: string, plId: string, hId: string, path: string) => void;
  updateUnit: (
    wbId: string,
    plId: string,
    hId: string,
    unitId: string,
    newData: ProblemUnitData
  ) => void;
}

export const EditTab = ({
  workbookId,
  problemList,
  onCreateHierarchy,
  onDeleteHierarchy,
  onUpdateHierarchyName,
  getProblemUnits,
  addUnitsToHierarchy,
  removeUnitFromHierarchy,
  updateUnit,
}: EditTabProps) => {
  // State
  const [activeTab, setActiveTab] = useState<string | null>(
    problemList.hierarchies.length > 0 ? problemList.hierarchies[0].id : null
  );

  // Modals
  const [createHModalOpened, { open: openCreateH, close: closeCreateH }] = useDisclosure(false);
  const [bulkAddOpened, { open: openBulkAdd, close: closeBulkAdd }] = useDisclosure(false);
  const [unitEditOpened, { open: openUnitEdit, close: closeUnitEdit }] = useDisclosure(false);

  // Selection
  const [editingUnit, setEditingUnit] = useState<ProblemUnit | null>(null);
  const [newHierarchyName, setNewHierarchyName] = useState('');

  // Derived State
  const currentHierarchy = useMemo(
    () => problemList.hierarchies.find((h) => h.id === activeTab),
    [problemList.hierarchies, activeTab]
  );

  const currentUnits = useMemo(() => {
    if (!currentHierarchy) return [];
    return getProblemUnits(currentHierarchy.unitVersionPaths);
  }, [currentHierarchy, getProblemUnits]);

  // Total Answer Count Calculation (for base index)
  const totalAnswerCount = useMemo(() => {
    let count = 0;
    // 現在の階層より前の階層のカウントも含めるならここで計算が必要だが、
    // 今回は「unit間で継続」= 現在のリスト内での継続と仮定
    // もし全体通し番号ならロジック調整が必要
    currentUnits.forEach((u) => {
      count += u.problemType === 'SINGLE' ? 1 : u.answers.length;
    });
    return count;
  }, [currentUnits]);

  // Actions
  const handleCreateHierarchy = () => {
    onCreateHierarchy(workbookId, problemList.id, { name: newHierarchyName });
    setNewHierarchyName('');
    closeCreateH();
  };

  const handleDeleteUnit = (unit: ProblemUnit) => {
    if (!currentHierarchy) return;
    if (confirm('削除しますか？')) {
      removeUnitFromHierarchy(workbookId, problemList.id, currentHierarchy.id, unit.unitId);
    }
  };

  return (
    <Stack h="100%" gap={0}>
      {/* 1. Hierarchy Tabs */}
      <Box p="xs" bg="gray.0" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <Group align="center" wrap="nowrap">
          <ScrollArea type="hover" scrollbarSize={6} offsetScrollbars style={{ flex: 1 }}>
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
              <Tabs.List style={{ flexWrap: 'nowrap' }}>
                {problemList.hierarchies.map((h) => (
                  <Tabs.Tab key={h.id} value={h.id} pr="xs">
                    <Group gap="xs" wrap="nowrap">
                      <Text>{h.name}</Text>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        onClick={(e) => {
                          e.stopPropagation(); /* 編集処理 */
                        }}
                      >
                        <IconSettings size={14} />
                      </ActionIcon>
                    </Group>
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>
          </ScrollArea>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={openCreateH}
            style={{ flexShrink: 0 }}
          >
            階層追加
          </Button>
        </Group>
      </Box>

      {/* 2. Unit List */}
      <Box style={{ flex: 1, overflow: 'hidden' }} bg="gray.1">
        {currentHierarchy ? (
          <ScrollArea h="100%" p="md">
            <Grid>
              {currentUnits.map((unit, index) => (
                <Grid.Col key={unit.unitId} span={{ base: 12, md: 6, lg: 4 }}>
                  <Card padding="md" radius="md" withBorder shadow="sm">
                    <Group justify="space-between" mb="xs">
                      <Badge variant="light">Q.{index + 1}</Badge>
                      <Group gap={4}>
                        <ActionIcon
                          variant="subtle"
                          onClick={() => {
                            setEditingUnit(unit);
                            openUnitEdit();
                          }}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteUnit(unit)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                    <Text size="sm" lineClamp={2} mb="xs" fw={500}>
                      {unit.question || '(問題文なし)'}
                    </Text>
                    <Group justify="space-between" mt="auto">
                      <Badge color="blue" variant="dot">
                        {unit.answerType}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        配点: {unit.scoring}
                      </Text>
                    </Group>
                    <Divider my="xs" />
                    <Text size="xs" c="dimmed">
                      答え: {unit.answers.join(', ')}
                    </Text>
                  </Card>
                </Grid.Col>
              ))}
              <Grid.Col span={12}>
                <Button
                  fullWidth
                  variant="dashed"
                  h={60}
                  color="gray"
                  onClick={openBulkAdd}
                  leftSection={<IconPlus size={24} />}
                >
                  新規カード作成 (一括追加)
                </Button>
              </Grid.Col>
            </Grid>
          </ScrollArea>
        ) : (
          <Stack align="center" justify="center" h="100%">
            <Text c="dimmed">階層を選択してください</Text>
          </Stack>
        )}
      </Box>

      {/* Modals */}
      <Modal opened={createHModalOpened} onClose={closeCreateH} title="階層追加">
        <Group align="flex-end">
          <TextInput
            value={newHierarchyName}
            onChange={(e) => setNewHierarchyName(e.target.value)}
            label="名称"
            style={{ flex: 1 }}
          />
          <Button onClick={handleCreateHierarchy}>追加</Button>
        </Group>
      </Modal>

      <UnitEditModal
        opened={unitEditOpened}
        onClose={closeUnitEdit}
        unit={editingUnit}
        onSave={(d) =>
          editingUnit &&
          currentHierarchy &&
          updateUnit(workbookId, problemList.id, currentHierarchy.id, editingUnit.unitId, d)
        }
      />

      <BulkAddModal
        opened={bulkAddOpened}
        onClose={closeBulkAdd}
        baseProblemIndex={totalAnswerCount}
        onAdd={(units) =>
          currentHierarchy &&
          addUnitsToHierarchy(workbookId, problemList.id, currentHierarchy.id, units)
        }
      />
    </Stack>
  );
};

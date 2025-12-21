import { useMemo, useState } from 'react';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
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
import { ProblemUnit, ProblemUnitData, UserDefinedHierarchy } from '@/shared/types/app.types';
import { BulkAddModal } from './bulk/BulkAddModal';
import { UnitDisplayCard } from './UnitDisplayCard';
import { UnitEditModal } from './UnitEditModal';

interface EditTabProps {
  workbookId: string;
  problemListId: string;
  hierarchies: UserDefinedHierarchy[];
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
  problemListId,
  hierarchies,
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
    hierarchies.length > 0 ? hierarchies[0].id : null
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
    () => hierarchies.find((h) => h.id === activeTab),
    [hierarchies, activeTab]
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
    onCreateHierarchy(workbookId, problemListId, { name: newHierarchyName });
    setNewHierarchyName('');
    closeCreateH();
  };

  const handleDeleteUnit = (unit: ProblemUnit) => {
    if (!currentHierarchy) return;
    if (confirm('削除しますか？')) {
      removeUnitFromHierarchy(workbookId, problemListId, currentHierarchy.id, unit.unitId);
    }
  };

  return (
    <Stack style={{ position: 'fixed', top: 130, bottom: 0, right: 0, left: 0 }} gap={0}>
      {/* 1. Hierarchy Tabs */}
      <Box p="xs" bg="gray.0" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <Group align="center" wrap="nowrap">
          <ScrollArea type="hover" scrollbarSize={6} offsetScrollbars style={{ flex: 1 }}>
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
              <Tabs.List style={{ flexWrap: 'nowrap', position: 'relative', alignItems: 'center' }}>
                {hierarchies.map((h) => (
                  <Tabs.Tab key={h.id} value={h.id} pr="xs">
                    <Group gap="xs" wrap="nowrap">
                      <Text>{h.name}</Text>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        component="div"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <IconSettings size={14} />
                      </ActionIcon>
                    </Group>
                  </Tabs.Tab>
                ))}

                {/* 1. スクロールに合わせて隠れるテキストボタン */}
                <Button variant="light" onClick={openCreateH} style={{ flexShrink: 0 }}>
                  階層追加
                </Button>

                {/* 2. 右端に留まる + アイコン */}
                <ActionIcon
                  onClick={openCreateH}
                  variant="filled" // 視認性のために色を付けるか、bg指定が必要
                  style={{
                    position: 'sticky',
                    right: 0, // 右端に固定
                    zIndex: 2, // タブより前面に
                    flexShrink: 0, // 潰れ防止
                  }}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Tabs.List>
            </Tabs>
          </ScrollArea>
        </Group>
      </Box>

      {/* 2. Unit List */}
      <Box style={{ flex: 1, overflow: 'hidden' }} bg="gray.1">
        {currentHierarchy ? (
          <ScrollArea h="100%" p="md" pos={'relative'}>
            <Grid pos={'relative'}>
              <Stack w={'100%'} h={'100%'} gap={0}>
                {currentUnits.map((unit, index) => (
                  <UnitDisplayCard
                    key={unit.unitId}
                    questionNumber={index + 1}
                    unit={unit}
                    onEdit={() => {
                      setEditingUnit(unit);
                      openUnitEdit();
                    }}
                    onDelete={() => handleDeleteUnit(unit)}
                  />
                ))}
                <Grid.Col
                  span={12}
                  style={{ position: 'sticky', bottom: 0, zIndex: 2, flexShrink: 0 }}
                >
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
              </Stack>
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
        problemNumber={0}
        onSave={(d) =>
          editingUnit &&
          currentHierarchy &&
          updateUnit(workbookId, problemListId, currentHierarchy.id, editingUnit.unitId, d)
        }
      />

      <BulkAddModal
        opened={bulkAddOpened}
        onClose={closeBulkAdd}
        baseProblemIndex={totalAnswerCount}
        onAdd={(units) =>
          currentHierarchy &&
          addUnitsToHierarchy(workbookId, problemListId, currentHierarchy.id, units)
        }
      />
    </Stack>
  );
};

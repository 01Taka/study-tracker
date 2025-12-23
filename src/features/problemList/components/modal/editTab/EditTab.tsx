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
import { useEditTab } from '@/features/problemList/hooks/useEditTab';
import { UnitBulkEditor } from './addModal/UnitBulkEditor';
import { UnitDisplayCard } from './UnitDisplayCard';
import { UnitEditModal } from './UnitEditModal';

interface EditTabProps {
  workbookId: string;
  problemListId: string;
  hierarchyIds: string[];
}

export const EditTab = (props: EditTabProps) => {
  const {
    hierarchies,
    activeTab,
    setActiveTab,
    currentHierarchy,
    currentUnits,
    editingUnit,
    setEditingUnit,
    newHierarchyName,
    setNewHierarchyName,
    totalProblemsCount,
    createHModalOpened,
    openCreateH,
    closeCreateH,
    bulkAddOpened,
    openBulkAdd,
    closeBulkAdd,
    unitEditOpened,
    openUnitEdit,
    closeUnitEdit,
    handleCreateHierarchy,
    handleDeleteUnit,
    handleAddUnits,
    handleUpdateUnit,
  } = useEditTab(props);

  return (
    <Stack style={{ position: 'fixed', top: 130, bottom: 0, right: 0, left: 0 }} gap={0}>
      <Box p="xs" bg="gray.0" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <Group align="center" wrap="nowrap">
          <ScrollArea type="hover" style={{ flex: 1 }}>
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
              <Tabs.List style={{ flexWrap: 'nowrap', alignItems: 'center' }}>
                {hierarchies.map((h) => (
                  <Tabs.Tab key={h.hierarchyId} value={h.hierarchyId} pr="xs">
                    <Group gap="xs" wrap="nowrap">
                      <Text>{h.name}</Text>
                      <ActionIcon size="sm" variant="subtle" color="gray" component="span">
                        <IconSettings size={14} />
                      </ActionIcon>
                    </Group>
                  </Tabs.Tab>
                ))}
                <Button variant="light" onClick={openCreateH} style={{ flexShrink: 0 }}>
                  階層追加
                </Button>
              </Tabs.List>
            </Tabs>
          </ScrollArea>
        </Group>
      </Box>

      <Box style={{ flex: 1, overflow: 'hidden' }} bg="gray.1">
        {currentHierarchy ? (
          <ScrollArea h="100%" p="md">
            <Stack gap={0}>
              <Grid>
                {currentUnits.map((unit, index) => (
                  <UnitDisplayCard
                    key={unit.unitId}
                    questionNumber={index + 1}
                    unit={unit}
                    onEdit={() => {
                      setEditingUnit(unit);
                      openUnitEdit();
                    }}
                    onDelete={() => handleDeleteUnit(unit.unitId)}
                  />
                ))}
              </Grid>

              <Button
                fullWidth
                variant="dashed"
                h={60}
                color="gray"
                mt="md"
                onClick={openBulkAdd}
                leftSection={<IconPlus size={24} />}
              >
                新規カード作成 (一括追加)
              </Button>
            </Stack>
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
            label="名称"
            value={newHierarchyName}
            style={{ flex: 1 }}
            onChange={(e) => setNewHierarchyName(e.target.value)}
          />
          <Button onClick={handleCreateHierarchy}>追加</Button>
        </Group>
      </Modal>

      <UnitEditModal
        opened={unitEditOpened}
        onClose={closeUnitEdit}
        unit={editingUnit}
        problemNumber={0}
        onSave={handleUpdateUnit}
      />

      <UnitBulkEditor
        opened={bulkAddOpened}
        onClose={closeBulkAdd}
        onSubmit={handleAddUnits}
        startProblemNumber={totalProblemsCount + 1}
      />
    </Stack>
  );
};

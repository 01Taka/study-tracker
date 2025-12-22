import { useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { IconArrowsSort, IconDeviceFloppy, IconGitMerge } from '@tabler/icons-react';
import { Box, Button, Flex, Group, Modal, ScrollArea, Stack, Text, Tooltip } from '@mantine/core';
import { useUnitBulkAddForm } from '@/features/problemList/hooks/useUnitBulkAddForm';
import { useUnitMerge } from '@/features/problemList/hooks/useUnitManager';
import { DraftOverlay } from './DraftOverlay';
import { UnitCard } from './UnitCard';
import { UnitCardStatic } from './UnitCardStatic'; // 追加

interface Props {
  opened: boolean;
  onClose: () => void;
}

export const UnitBulkEditor = ({ opened, onClose }: Props) => {
  const {
    form,
    commitDraft,
    removeUnit,
    updateUnitFields,
    updateUnitAnswer,
    removeAnswer,
    commitPushAnswerDraft,
    reorderUnits,
    mergeUnits,
    captureSnapshot,
    revertToSnapshot,
    clearSnapshot,
  } = useUnitBulkAddForm();

  const totalScore = useMemo(() => {
    return form.values.units.reduce((acc, unit) => acc + unit.scoring, 0);
  }, [form.values.units]);

  // Merge Logic
  const { isMergeMode, toggleMergeMode, selectedMap, handleSelect, confirmMerge, selection } =
    useUnitMerge(mergeUnits);

  const [isOverlayOpened, setIsOverlayOpened] = useState(true);

  // DnD State
  const [isDndMode, setIsDndMode] = useState(false);

  // UI State
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null);

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Handlers ---

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = form.values.units.findIndex((u) => u.id === active.id);
      const newIndex = form.values.units.findIndex((u) => u.id === over?.id);
      reorderUnits(oldIndex, newIndex);
    }
  };

  const startDnd = () => {
    captureSnapshot();
    setIsDndMode(true);
    setExpandedDraftId(null);
  };

  const cancelDnd = () => {
    revertToSnapshot();
    setIsDndMode(false);
  };

  const saveDnd = () => {
    clearSnapshot();
    setIsDndMode(false);
  };

  // Determine if overlay should be visible
  const showOverlay = !isDndMode && !isMergeMode;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      title="Unit Editor"
      styles={{
        body: {
          padding: 0,
          height: 'calc(100vh - 60px)',
          display: 'flex',
          flexDirection: 'column',
        },
        header: { borderBottom: '1px solid #eee' },
      }}
    >
      {/* --- Global Controls (Top Bar) --- */}
      <Group p="md" justify="space-between" bg="gray.0">
        <Group>
          {isDndMode ? (
            <>
              <Button size="xs" color="gray" variant="outline" onClick={cancelDnd}>
                Cancel Order
              </Button>
              <Button
                size="xs"
                color="blue"
                onClick={saveDnd}
                leftSection={<IconDeviceFloppy size={14} />}
              >
                Save Order
              </Button>
            </>
          ) : isMergeMode ? (
            <>
              <Button size="xs" color="gray" onClick={toggleMergeMode}>
                Cancel Merge
              </Button>
              <Button
                size="xs"
                color="violet"
                disabled={selection.start === null || selection.end === null}
                onClick={confirmMerge}
              >
                Confirm Merge
              </Button>
            </>
          ) : (
            <>
              <Tooltip label="Reorder Units">
                <Button size="xs" variant="default" onClick={startDnd}>
                  <IconArrowsSort size={16} />
                </Button>
              </Tooltip>
              <Tooltip label="Merge Units">
                <Button size="xs" variant="default" onClick={toggleMergeMode}>
                  <IconGitMerge size={16} />
                </Button>
              </Tooltip>
            </>
          )}
        </Group>

        {/* Main Save (Exit) */}
        <Group gap="lg">
          {!isDndMode && !isMergeMode && (
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                現在:
              </Text>
              <Text size="sm" fw={700}>
                {form.values.units.length}問
              </Text>
              /
              <Text size="sm" fw={700}>
                {totalScore}点
              </Text>
            </Group>
          )}

          {!isDndMode && !isMergeMode && (
            <Button color="green" onClick={onClose}>
              Finish
            </Button>
          )}
        </Group>
      </Group>

      {/* --- Main List Area --- */}
      <Box style={{ flex: 1, position: 'relative', overflow: 'hidden' }} bg="gray.0">
        <ScrollArea h="100%" type="scroll" pb={showOverlay && isOverlayOpened ? 240 : 20} p="md">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={form.values.units.map((u) => u.id)}
              strategy={verticalListSortingStrategy}
              disabled={!isDndMode} // Disable DnD logic unless in mode
            >
              <Stack gap="md">
                {form.values.units.map((unit, idx) =>
                  // DnDモード時はUnitCardStatic、それ以外はUnitCard
                  isDndMode || isMergeMode ? (
                    <UnitCardStatic
                      key={unit.id}
                      unit={unit}
                      index={idx}
                      isMergeMode={isMergeMode}
                      isSelectedForMerge={selectedMap[idx]}
                      onToggleMergeSelect={() => handleSelect(idx)}
                      removeUnit={removeUnit}
                      updateUnitFields={updateUnitFields}
                      updateUnitAnswer={updateUnitAnswer}
                      removeAnswer={removeAnswer}
                      commitPushAnswerDraft={commitPushAnswerDraft}
                      expandedDraftId={expandedDraftId}
                      setExpandedDraftId={setExpandedDraftId}
                    />
                  ) : (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      index={idx}
                      removeUnit={removeUnit}
                      updateUnitFields={updateUnitFields}
                      updateUnitAnswer={updateUnitAnswer}
                      removeAnswer={removeAnswer}
                      commitPushAnswerDraft={commitPushAnswerDraft}
                      expandedDraftId={expandedDraftId}
                      setExpandedDraftId={setExpandedDraftId}
                    />
                  )
                )}
              </Stack>
            </SortableContext>
          </DndContext>

          {/* Empty State */}
          {form.values.units.length === 0 && (
            <Text ta="center" c="dimmed" mt="xl">
              No units yet. Add one below.
            </Text>
          )}
        </ScrollArea>

        {/* --- Draft Overlay (Bottom Sheet) --- */}
        {showOverlay && (
          <DraftOverlay
            form={form}
            opened={isOverlayOpened}
            onToggle={() => setIsOverlayOpened((prev) => !prev)}
            commitDraft={commitDraft}
            pushAnswerToDraft={(val) => form.insertListItem('answerDraft', val)}
            updateUnitFields={updateUnitFields}
          />
        )}
      </Box>
    </Modal>
  );
};

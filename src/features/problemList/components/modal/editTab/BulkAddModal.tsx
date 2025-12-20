import { IconAlertTriangle, IconDeviceFloppy } from '@tabler/icons-react';
import { Alert, Box, Button, Group, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { useBulkAdd } from '@/features/problemList/hooks/useBulkAdd';
import { ProblemUnitData } from '@/shared/types/app.types';
import { BulkRowItem } from './BulkRowItem';

interface BulkAddModalProps {
  opened: boolean;
  onClose: () => void;
  onAdd: (units: ProblemUnitData[]) => void;
  baseProblemIndex: number;
}

export const BulkAddModal = ({ opened, onClose, onAdd, baseProblemIndex }: BulkAddModalProps) => {
  const {
    draft,
    rows,
    hasError,
    getDisplayNumber,
    onChangeAnswer,
    onChangeSettings,
    onCommitDraft,
    onCommitAllAnswerDraft,
  } = useBulkAdd(baseProblemIndex);

  const handleSave = () => {
    // onAdd(getSubmittableData());
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      title="問題一括追加"
      transitionProps={{ transition: 'slide-up' }}
      padding={0}
    >
      <Stack h="100vh" gap={0} bg="gray.1">
        <Box p="md" bg="white" style={{ borderBottom: '1px solid #eee' }}>
          <Text size="sm" c="dimmed">
            一つ入力すると次のカードが解放されます。
            <br />
            途中でデータを消すと自動で整理されます。
          </Text>
        </Box>

        <ScrollArea p="md">
          {/* 1. 確定済みリスト */}
          {rows.map((row, idx) => (
            <BulkRowItem
              key={`row-${idx}`}
              data={row}
              displayNumber={getDisplayNumber(idx, false)}
              isDraft={false}
              disabled={false}
              // 親側で type と index を固定
              onChangeAnswer={(args) =>
                onChangeAnswer({
                  type: args.type,
                  listIndex: idx,
                  answerIndex: args.answerIndex ?? 0,
                  answer: args.answer,
                })
              }
              onChangeSettings={(data) => onChangeSettings({ type: 'LIST', index: idx, data })}
              onCommitAnswerDraft={onCommitAllAnswerDraft}
            />
          ))}

          {/* 2. 入力中 (Draft) */}
          <BulkRowItem
            key={`draft-${rows.length}`}
            data={draft}
            displayNumber={getDisplayNumber(0, true)}
            isDraft={true}
            disabled={false}
            onChangeAnswer={(args) =>
              onChangeAnswer({
                type: draft.answerType === 'MARK' ? 'DRAFT_INSTANT' : 'DRAFT',
                answer: args.answer,
              })
            }
            onChangeSettings={(data) => onChangeSettings({ type: 'DRAFT', data })}
            onCommit={onCommitDraft}
          />

          {/* 3. 次回待機 (Disabled) */}
          <BulkRowItem
            data={draft}
            displayNumber={
              getDisplayNumber(0, true) +
              (draft.problemType === 'SINGLE' ? 1 : Math.max(1, draft.answers.length - 1))
            }
            isDraft={false}
            disabled={true}
            onChangeAnswer={() => {}}
            onChangeSettings={() => {}}
          />
        </ScrollArea>

        <Box
          p="md"
          bg="white"
          style={{
            borderTop: '1px solid #eee',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          {hasError && (
            <Alert color="red" icon={<IconAlertTriangle />} mb="sm" variant="light">
              入力内容に不備があります（赤枠の箇所）
            </Alert>
          )}
          <Group justify="space-between">
            <Button variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={hasError || rows.length <= 2}
              leftSection={<IconDeviceFloppy size={20} />}
            >
              {Math.max(0, rows.length - 2)}件を追加
            </Button>
          </Group>
        </Box>
      </Stack>
    </Modal>
  );
};

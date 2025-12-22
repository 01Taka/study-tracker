import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { ActionIcon, Badge, Box, Card, Group, Paper, Stack, Text } from '@mantine/core';
import {
  ANSWER_TYPE_SELECTIONS,
  PROBLEM_TYPE_SELECTIONS,
} from '@/features/problemList/constants/form-constants';
import { UnitCardProps } from '@/features/problemList/types/types';

export const UnitCardStatic = (props: UnitCardProps) => {
  const { unit, isMergeMode, isSelectedForMerge, onToggleMergeSelect } = props;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: unit.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    border: isSelectedForMerge ? '2px solid #228be6' : undefined,
    cursor: isMergeMode ? 'pointer' : 'default',
    backgroundColor: isSelectedForMerge ? 'var(--mantine-color-blue-0)' : undefined,
  };

  // 定数から表示用ラベルを抽出
  const answerTypeLabel = ANSWER_TYPE_SELECTIONS.find(
    (opt) => opt.value === unit.answerType
  )?.label;
  const problemTypeLabel = PROBLEM_TYPE_SELECTIONS.find(
    (opt) => opt.value === unit.problemType
  )?.label;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      withBorder
      shadow="xs"
      radius="md"
      mb="sm"
      p="md"
      onClick={onToggleMergeSelect}
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs">
            {!isMergeMode && (
              <ActionIcon
                variant="subtle"
                color="gray"
                {...attributes}
                {...listeners}
                style={{ cursor: 'grab' }}
              >
                <IconGripVertical size={18} />
              </ActionIcon>
            )}

            {/* 属性をバッジで表示 */}
            <Badge variant="light" color="blue" radius="sm">
              {answerTypeLabel}
            </Badge>
            <Badge variant="outline" color="gray" radius="sm" fw={500}>
              {problemTypeLabel}
            </Badge>
          </Group>

          {/* 配点：重要度が高いので少し強調 */}
          <Group gap={4}>
            <Text size="sm" fw={700} c="blue">
              {unit.scoring}
            </Text>
            <Text size="xs" c="dimmed">
              点
            </Text>
          </Group>
        </Group>

        {/* 設問内容 */}
        {unit.question && (
          <Box>
            <Text
              size="sm"
              fw={600}
              mb={4}
              c="dimmed"
              style={{ fontSize: '10px', textTransform: 'uppercase' }}
            >
              Question
            </Text>
            <Text size="sm" style={{ lineHeight: 1.5 }}>
              {unit.question}
            </Text>
          </Box>
        )}

        {/* 解答リスト：背景色を薄く敷いて「データの塊」として見せる */}
        {unit.answers.length > 0 && (
          <Stack gap={6}>
            <Text
              size="sm"
              fw={600}
              c="dimmed"
              style={{ fontSize: '10px', textTransform: 'uppercase' }}
            >
              Answers
            </Text>
            {unit.answers.map((ans, aIdx) => (
              <Paper
                key={`${unit.id}-ans-${aIdx}`}
                withBorder
                px="xs"
                py={4}
                bg="gray.0"
                style={{ borderColor: 'var(--mantine-color-gray-2)' }}
              >
                <Group gap="sm">
                  <Text size="xs" c="dimmed" fw={700}>
                    {aIdx + 1}
                  </Text>
                  <Text size="sm">{ans || '-'}</Text>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

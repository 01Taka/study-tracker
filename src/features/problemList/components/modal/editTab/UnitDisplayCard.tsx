import React from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Badge, Box, Card, Grid, Group, Text } from '@mantine/core';
import { ProblemUnit } from '@/shared/types/app.types';

interface UnitDisplayCardProps {
  questionNumber: number;
  unit: ProblemUnit;
  onEdit: () => void;
  onDelete: () => void;
}

const PROBLEM_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  SINGLE: { label: '一問', color: 'gray' },
  ORDERED_SET: { label: '完答', color: 'indigo' },
  UNORDERED: { label: '部分点', color: 'teal' },
  UNORDERED_SET: { label: '順不同', color: 'cyan' },
};

export const UnitDisplayCard: React.FC<UnitDisplayCardProps> = ({
  questionNumber,
  unit,
  onEdit,
  onDelete,
}) => {
  const typeInfo = PROBLEM_TYPE_LABELS[unit.problemType] || { label: '不明', color: 'gray' };

  return (
    <Grid.Col key={unit.unitId} span={12}>
      <Card
        padding="xs"
        radius="xs"
        withBorder
        shadow="none"
        style={{
          minHeight: 54,
          cursor: 'pointer',
          // ホバー時に背景色を少し変えることでクリック可能であることを示唆
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-0)',
          },
        }}
        onClick={onEdit} // カードクリックで編集
      >
        <Group justify="space-between" wrap="nowrap" gap="xs">
          {/* 左側：Q番号、ラベル、回答内容 */}
          <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Text fw={900} size="md" c="blue.8" style={{ flexShrink: 0 }}>
              Q{questionNumber}
            </Text>

            <Badge
              color={typeInfo.color}
              variant="light"
              size="sm"
              radius="xs"
              style={{ flexShrink: 0 }}
            >
              {typeInfo.label}
            </Badge>

            {/* 配点の表示：目立つようにバッジ形式や太字で追加 */}
            <Box style={{ flexShrink: 0 }}>
              <Text size="sm" fw={700} c="dimmed">
                {unit.scoring}点
              </Text>
            </Box>

            <Text fw={700} size="md" c="dark" lineClamp={1} style={{ flex: 1 }}>
              {unit.answers.join(' , ')}
              {unit.question && (
                <Text component="span" size="xs" c="dimmed" ml={8} fw={400}>
                  {unit.question}
                </Text>
              )}
            </Text>
          </Group>

          {/* 右側：操作ボタン */}
          <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }}>
            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              aria-label="削除"
              onClick={(e) => {
                e.stopPropagation(); // 親（Card）のonClick発火を防止
                onDelete();
              }}
            >
              <IconTrash size={24} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>
    </Grid.Col>
  );
};

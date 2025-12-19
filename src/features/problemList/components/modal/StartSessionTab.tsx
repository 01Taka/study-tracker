import React, { useState } from 'react';
import { Badge, Button, Card, Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { ProblemUnit, StartSessionFilterType } from '@/shared/types/app.types';

interface StartSessionTabProps {
  flattenedUnits?: ProblemUnit; // フィルタリングされたProblemUnitのリスト
  onStartSession: (type: StartSessionFilterType) => void;
}

export const StartSessionTab: React.FC<StartSessionTabProps> = ({
  flattenedUnits,
  onStartSession,
}) => {
  const [filter, setFilter] = useState<StartSessionFilterType>('all');

  return (
    <Stack>
      <SegmentedControl
        value={filter}
        onChange={(value: any) => setFilter(value)}
        data={[
          { label: 'すべて', value: 'all' },
          { label: '前回ミス', value: 'miss' },
          { label: 'おすすめ', value: 'recommended' },
        ]}
        fullWidth
      />

      <Stack gap="xs">
        {/* 仮のユニット表示 */}
        <Card
          withBorder
          padding="sm"
          radius="md"
          style={{ borderColor: 'var(--mantine-color-blue-4)' }}
        >
          <Group justify="space-between">
            <Text fw={500} size="sm">
              Unit: 1-1
            </Text>
            <Badge size="xs">対象</Badge>
          </Group>
        </Card>
      </Stack>

      <Button fullWidth size="lg" radius="xl" mt="xl" onClick={() => onStartSession(filter)}>
        セッションを開始する
      </Button>
    </Stack>
  );
};

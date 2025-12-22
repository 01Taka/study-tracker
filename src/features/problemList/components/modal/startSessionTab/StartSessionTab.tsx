import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core';
import {
  ProblemUnit,
  StartSessionFilterType,
  UserDefinedHierarchy,
} from '@/shared/types/app.types';
import { UnitCard } from './UnitCard';

interface StartSessionTabProps {
  listData: {
    hierarchy: UserDefinedHierarchy;
    units: ProblemUnit[];
  }[];
  getIsSelected: (unitId: string, filter: StartSessionFilterType) => boolean;
  getSelectedCount: (filter: StartSessionFilterType) => number;
  onStartSession: (type: StartSessionFilterType) => void;
}

export const StartSessionTab: React.FC<StartSessionTabProps> = ({
  listData,
  getIsSelected,
  getSelectedCount,
  onStartSession,
}) => {
  const [filter, setFilter] = useState<StartSessionFilterType>('all');

  // 全体のユニット数をカウント
  const totalUnitsCount = listData.reduce((acc, d) => acc + d.units.length, 0);
  const selectedUnitCount = getSelectedCount(filter);

  return (
    <Stack h="100%" gap="md">
      <SegmentedControl
        value={filter}
        onChange={(value) => setFilter(value as StartSessionFilterType)}
        data={[
          { label: 'すべて', value: 'all' },
          { label: '前回ミス', value: 'miss' },
          { label: 'おすすめ', value: 'recommended' },
        ]}
        fullWidth
        radius="xl"
        size="sm"
      />

      <Box style={{ flex: 1, minHeight: 0 }}>
        <Group justify="space-between" mb="xs" px="xs" align="flex-end">
          <Text size="xs" c="dimmed" fw={700} lts={0.5}>
            対象ユニット: {selectedUnitCount} / {totalUnitsCount}
          </Text>
        </Group>

        <ScrollArea h={480} offsetScrollbars scrollbarSize={6} type="hover">
          <Stack gap="xl" pr="xs">
            {listData.map((data) => (
              <Box key={data.hierarchy.id}>
                <Divider
                  label={
                    <Text fw={700} size="xs" c="gray.6" tt="uppercase">
                      {data.hierarchy.name}
                    </Text>
                  }
                  labelPosition="left"
                  mb="sm"
                />
                <Stack gap="sm">
                  {data.units.map((unit) => {
                    return (
                      <UnitCard
                        key={unit.unitId}
                        unit={unit}
                        isSelected={getIsSelected(unit.unitId, filter)}
                      />
                    );
                  })}
                </Stack>
              </Box>
            ))}

            {listData.length === 0 && (
              <Stack align="center" py="xl">
                <Text size="sm" c="dimmed">
                  表示できる問題がありません
                </Text>
              </Stack>
            )}
          </Stack>
        </ScrollArea>
      </Box>

      <Box pt="xs" style={{ borderTop: `1px solid var(--mantine-color-gray-2)` }}>
        <Button
          fullWidth
          size="lg"
          radius="xl"
          variant="filled"
          color="blue"
          onClick={() => onStartSession(filter)}
          disabled={selectedUnitCount === 0} // 選択ゼロなら開始不可
        >
          {selectedUnitCount} 問で学習を開始する
        </Button>
      </Box>
    </Stack>
  );
};

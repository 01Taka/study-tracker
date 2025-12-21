import { alpha, Badge, Box, Card, Group, rem, Stack, Text } from '@mantine/core';
import { PROBLEM_TYPE_LABELS } from '@/features/problemList/constants/start-session-constants';
import {
  ProblemNumberResult,
  ProblemRange,
  ProblemUnit,
  StartSessionFilterType,
  UserDefinedHierarchy,
} from '@/shared/types/app.types';

/**
 * ユニットカード：選択状態に応じたスタイリング
 */
export const UnitCard = ({
  unit,
  range,
  isSelected,
}: {
  unit: ProblemUnit;
  range: ProblemRange;
  isSelected: boolean;
}) => {
  const isSingle = range.start === range.end;
  const problemNumbersText = isSingle
    ? `Q${range.start}`
    : `Q${range.start} ~ Q${range.end} (${range.problemNumbers.length}問)`;

  return (
    <Card
      withBorder
      padding="md"
      radius="md"
      shadow={isSelected ? 'sm' : 'p'}
      style={(theme) => ({
        // 選択されていない場合は透過させて目立たなくする
        opacity: isSelected ? 1 : 0.5,
        transition: 'all 0.2s ease',
        backgroundColor: isSelected ? alpha(theme.colors.blue[0], 0.3) : theme.colors.gray[0],
        borderColor: isSelected ? theme.colors.blue[5] : theme.colors.gray[3],
        borderWidth: isSelected ? rem(2) : rem(1),
      })}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Badge
            variant={isSelected ? 'filled' : 'light'}
            color={isSelected ? 'blue' : 'gray'}
            size="sm"
          >
            {PROBLEM_TYPE_LABELS[unit.problemType]}
          </Badge>
          <Box py={2} w={'100%'} flex={1}>
            <Text
              size="xl"
              fw={900}
              c={isSelected ? 'dark.4' : 'gray.6'}
              style={{
                fontSize: rem(isSingle ? 20 : 18),
                letterSpacing: rem(1),
                lineHeight: 1.2,
              }}
              lineClamp={1}
            >
              {problemNumbersText}
            </Text>
          </Box>
          <Group gap={4}>
            <Text fw={800} size="md" c={isSelected ? 'blue.7' : 'gray.6'}>
              {unit.scoring}点
            </Text>
          </Group>
        </Group>

        {unit.question && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {unit.question}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

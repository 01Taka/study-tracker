// features/results/ResultPage.tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  rem,
  RingProgress,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { ResultRow } from '@/features/result/components/ResultRow';
import { useResultCalculation } from '@/features/result/hooks/useResultCalculation';

export const ResultPage: React.FC = () => {
  const { resultId = '' } = useParams<{ resultId: string }>();
  const { history, unitRecord, currentProblemList, scoreSummary, problemNumberMap, isLoading } =
    useResultCalculation(resultId);

  if (isLoading) return <Container py="xl">Loading...</Container>;

  return (
    <Container size="lg" py="md">
      {/* スコアサマリーセクション */}
      <Paper p="md" withBorder radius="md" mb="xl" shadow="xs">
        <Group justify="center" gap={40}>
          <Stack gap={0} align="center">
            <Text size="xs" c="dimmed" fw={700}>
              得点
            </Text>
            <Text size={rem(36)} fw={900}>
              {scoreSummary.earned}
              <Text span size="xl" c="dimmed">
                {' '}
                / {scoreSummary.max}
              </Text>
            </Text>
          </Stack>
          <RingProgress
            size={80}
            thickness={8}
            sections={[{ value: (scoreSummary.earned / scoreSummary.max) * 100, color: 'blue' }]}
            label={
              <Text ta="center" fw={700} size="xs">
                {Math.round((scoreSummary.earned / scoreSummary.max) * 100)}%
              </Text>
            }
          />
        </Group>
      </Paper>

      {/* リスト表示セクション */}
      {currentProblemList &&
        currentProblemList.hierarchies.map((h) => (
          <Box key={h.id} mb="xl">
            <Divider label={h.name} labelPosition="left" mb="sm" />
            <Stack gap={4}>
              {h.unitVersionPaths.map((uid) => {
                const unit = unitRecord[uid];
                if (!unit) return null;
                const range = problemNumberMap[h.id][unit.unitId];
                return (
                  <ResultRow
                    key={uid}
                    unit={unit}
                    att={history?.unitAttempts[uid]}
                    problemNumbers={range?.problemNumbers ?? []}
                  />
                );
              })}
            </Stack>
          </Box>
        ))}

      <Button
        fullWidth
        size="lg"
        mt={'md'}
        style={{ position: 'sticky', bottom: 5 }}
        component={Link}
        to=".."
      >
        ホームに戻る
      </Button>
    </Container>
  );
};

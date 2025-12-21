// features/results/components/ResultRow.tsx
import { useState } from 'react';
import { Badge, Center, Grid, Group, Paper, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ProblemUnit, UnitAttemptResultData } from '@/shared/types/app.types';
import { theme } from '@/theme';
import { EVAL_DISPLAY_CONFIG } from '../constants/eval-constants';
import { getEvalResultKey } from '../functions/eval-result';
import { calculateScore } from '../functions/scoring';
import { SelfEvalBadge } from './SelfEvalBadge';

export const ResultRow = ({
  unit,
  att,
  problemNumbers,
}: {
  unit: ProblemUnit;
  att: UnitAttemptResultData | undefined;
  problemNumbers: number[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const res = calculateScore(unit, att);

  // 未回答（attがundefined）の場合はデフォルトのキーを設定
  const key = att ? getEvalResultKey(unit, att) : 'UNRATED_WRONG';
  const displayConfig = EVAL_DISPLAY_CONFIG[key];
  const StatusIcon = displayConfig.icon;

  const isMobile = useMediaQuery('(max-width: 576px)');

  return (
    <Paper
      p="sm"
      withBorder
      radius="sm"
      bg={displayConfig.colors.bg}
      onClick={() => setExpanded(!expanded)}
      style={{
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        borderColor: displayConfig.colors.border, // 枠線にアクセント色を適用
      }}
    >
      <Grid columns={12} align="center">
        {/* 問題番号 */}
        <Grid.Col span={1.5}>
          {problemNumbers.map((number) => (
            <Text key={number} size="xs" fw={700} c="dimmed">
              Q {number}
            </Text>
          ))}
        </Grid.Col>

        {/* ユーザー回答 */}
        <Grid.Col span={2.5}>
          <Stack gap={2}>
            {unit.answers.map((_, i) => (
              <Text
                key={i}
                size="xs"
                fw={600}
                lineClamp={expanded ? undefined : 1}
                c={att?.answers[String(i)] ? 'inherit' : 'gray.4'}
              >
                {att?.answers[String(i)] || '(未入力)'}
              </Text>
            ))}
          </Stack>
        </Grid.Col>

        {/* 正解 */}
        <Grid.Col span={2.5}>
          <Stack gap={2}>
            {unit.answers.map((ans, i) => (
              <Text key={i} size="xs" c="dimmed" lineClamp={expanded ? undefined : 1}>
                {ans}
              </Text>
            ))}
          </Stack>
        </Grid.Col>

        {/* 自己評価 */}
        <Grid.Col span={1.5}>
          <Center>
            <SelfEvalBadge type={att?.selfEval ?? 'UNRATED'} size={18} />
          </Center>
        </Grid.Col>

        {/* ステータスバッジ（アイコン付き） */}
        <Grid.Col span={2} ta="center">
          {isMobile ? (
            <Badge
              variant="filled"
              size="md"
              styles={{
                root: { backgroundColor: displayConfig.colors.accent },
                label: { display: 'flex', alignItems: 'center' },
              }}
            >
              <StatusIcon size={14} stroke={3} />
            </Badge>
          ) : (
            <Badge
              variant="filled"
              size="md"
              fullWidth
              styles={{
                root: { backgroundColor: displayConfig.colors.accent },
                label: { display: 'flex', alignItems: 'center', gap: '4px' },
              }}
              leftSection={<StatusIcon size={14} stroke={3} />}
            >
              {displayConfig.label}
            </Badge>
          )}
        </Grid.Col>

        {/* スコア */}
        <Grid.Col span={2} ta="right">
          <Text size="xs" fw={700} c={displayConfig.colors.text}>
            {Math.round(res.earned * 10) / 10} / {unit.scoring}
          </Text>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

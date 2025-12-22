import React, { useState } from 'react';
import { Badge, Center, Grid, Paper, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { UnitAttemptResultData } from '@/shared/types/app.types';
import { EVAL_DISPLAY_CONFIG } from '../constants/eval-constants';
import { SelfEvalBadge } from './SelfEvalBadge';

interface ResultRowProps {
  attempts: UnitAttemptResultData | undefined;
}

export const ResultRow: React.FC<ResultRowProps> = ({ attempts }) => {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width: 576px)');

  // データが不足している場合のフォールバック
  const resultKey = attempts?.resultKey ?? 'UNRATED_WRONG';
  const displayConfig = EVAL_DISPLAY_CONFIG[resultKey];
  const StatusIcon = displayConfig.icon;

  // 各回答行のレンダリングを共通化
  const renderAnswerRows = (isCorrectDisplay: boolean) => {
    return attempts?.results.map((data) => {
      const text = isCorrectDisplay
        ? data?.collectAnswer || '' // 正解表示
        : data?.answer || '(未入力)'; // ユーザー回答表示

      return (
        <Text
          key={data.problemNumber}
          size="xs"
          fw={!isCorrectDisplay && data?.answer ? 600 : 400}
          c={isCorrectDisplay ? 'dimmed' : data?.answer ? 'inherit' : 'gray.4'}
          lineClamp={expanded ? undefined : 1}
        >
          {text}
        </Text>
      );
    });
  };

  return (
    <Paper
      p="sm"
      withBorder
      radius="sm"
      bg={displayConfig.colors.bg}
      onClick={() => setExpanded(!expanded)}
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderColor: displayConfig.colors.border,
      }}
    >
      <Grid columns={12} align="center" gutter="xs">
        {/* 1. 問題番号 */}
        <Grid.Col span={1.5}>
          <Stack gap={0}>
            {attempts?.results.map((data) => (
              <Text key={data.problemNumber} size="xs" fw={700} c="dimmed">
                Q {data.problemNumber}
              </Text>
            ))}
          </Stack>
        </Grid.Col>

        {/* 2. ユーザー回答 (attから直接出す) */}
        <Grid.Col span={2.5}>
          <Stack gap={2}>{renderAnswerRows(false)}</Stack>
        </Grid.Col>

        {/* 3. 正解 (冗長化したデータから出す) */}
        <Grid.Col span={2.5}>
          <Stack gap={2}>{renderAnswerRows(true)}</Stack>
        </Grid.Col>

        {/* 4. 自己評価 */}
        <Grid.Col span={1.5}>
          <Center>
            <SelfEvalBadge type={attempts?.selfEval ?? 'UNRATED'} size={18} />
          </Center>
        </Grid.Col>

        {/* 5. ステータス */}
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

        {/* 6. スコア (attにスコアを持たせていれば計算不要) */}
        <Grid.Col span={2} ta="right">
          <Text size="xs" fw={700} c={displayConfig.colors.text}>
            {/* 判定結果に基づき、正解なら満点、不正解なら0を表示する例（部分点ロジックがあれば調整） */}
            {resultKey.endsWith('_CORRECT') ? attempts?.scoring || 0 : 0} / {attempts?.scoring || 0}
          </Text>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

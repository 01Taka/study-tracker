import {
  Box,
  Button,
  Card,
  Divider,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { MARK_SELECTIONS } from '@/shared/constants/mark-selections';
import { ProblemUnit, SelfEvalType } from '@/shared/types/app.types';
import { SELF_EVAL_OPTIONS } from '../constants/evaluations';

interface ProblemUnitCardProps {
  unit: ProblemUnit;
  problemNumberStart: number;
  problemNumberEnd?: number;
  answers: Record<string, string>;
  selfEval: SelfEvalType; // 型を適用
  onAnswerChange: (problemNumber: number, val: string) => void;
  onEvalChange: (val: SelfEvalType) => void; // 型を適用
}

export const ProblemUnitCard = ({
  unit,
  problemNumberStart,
  problemNumberEnd,
  answers,
  selfEval,
  onAnswerChange,
  onEvalChange,
}: ProblemUnitCardProps) => {
  return (
    <Card withBorder shadow="sm" radius="md" padding="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={700} size="sm" c="dimmed">
            問題 {problemNumberStart}{' '}
            {problemNumberEnd &&
              problemNumberStart !== problemNumberEnd &&
              ` - ${problemNumberEnd}`}
          </Text>
          <Text size="xs" c="dimmed">
            配点: {unit.scoring}点
          </Text>
        </Group>

        {unit.question && <Text fw={500}>{unit.question}</Text>}
        <Divider variant="dashed" />

        <Box>
          <Text size="xs" fw={700} mb={4} c="dimmed">
            解答入力
          </Text>
          <Stack gap="xs">
            {unit.problems.map((data) => {
              const val = answers[data.problemNumber] || '';

              return (
                <Group key={`${unit.unitId}-${data.problemNumber}`} gap="xs">
                  <Text size="xs" w={20}>
                    {data.problemNumber}.
                  </Text>
                  <Box style={{ flex: 1 }}>
                    {unit.answerType === 'MARK' ? (
                      <SegmentedControl
                        fullWidth
                        value={val}
                        color="blue"
                        onChange={(v) => onAnswerChange(data.problemNumber, val === v ? '' : v)}
                        data={MARK_SELECTIONS}
                        transitionDuration={0}
                      />
                    ) : (
                      <TextInput
                        placeholder="答えを入力"
                        value={val}
                        onChange={(e) => onAnswerChange(data.problemNumber, e.currentTarget.value)}
                      />
                    )}
                  </Box>
                </Group>
              );
            })}
          </Stack>
        </Box>

        {/* 自己評価セクション: 定数からループ生成 */}
        <Box>
          <Text size="xs" fw={700} mb={8} c="dimmed">
            自己評価
          </Text>
          <Group grow gap="xs">
            {SELF_EVAL_OPTIONS.map((opt) => (
              <EvalButton
                key={opt.value}
                active={selfEval === opt.value}
                onClick={() => onEvalChange(selfEval === opt.value ? 'UNRATED' : opt.value)}
                color={opt.color}
                icon={<opt.icon size={20} />}
                label={opt.label}
              />
            ))}
          </Group>
        </Box>
      </Stack>
    </Card>
  );
};

// EvalButton の Props も型定義しておくと安全です
interface EvalButtonProps {
  active: boolean;
  onClick: () => void;
  color: string;
  icon: React.ReactNode;
  label: string;
}

const EvalButton = ({ active, onClick, color, icon, label }: EvalButtonProps) => (
  <Button
    variant={active ? 'filled' : 'outline'}
    color={active ? color : 'gray'}
    onClick={onClick}
    px={0}
    h={52}
    styles={(theme) => ({
      root: {
        backgroundColor: active ? undefined : theme.colors.gray[0],
        border: active ? undefined : `1px solid ${theme.colors.gray[3]}`,
        transition: 'all 0.1s ease',
      },
      section: { margin: 0 },
    })}
  >
    <Stack gap={0} align="center">
      <Box style={{ display: 'flex', opacity: active ? 1 : 0.6 }}>{icon}</Box>
      <Text size="10px" fw={active ? 700 : 400} style={{ marginTop: -2 }}>
        {label}
      </Text>
    </Stack>
  </Button>
);

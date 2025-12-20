import { Badge, Card, Divider, Group, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import {
  AnswerType,
  ProblemUnitDataWithDraft,
  ProblemUnitSettings,
} from '@/shared/types/app.types';
import { AnswerInputSlot } from './AnswerInputSlot';

interface BulkRowItemProps {
  data: ProblemUnitDataWithDraft;
  displayNumber: number;
  disabled: boolean;
  isDraft: boolean;
  // 抽象化されたシンプルなハンドラー
  onChangeAnswer: (args: {
    answer: string;
    answerIndex?: number;
    type: 'LIST_DRAFT' | 'LIST_DRAFT_INSTANT' | 'LIST_SET';
  }) => void;
  onChangeSettings: (data: Partial<ProblemUnitSettings>) => void;
  onCommit?: () => void;
  onCommitAnswerDraft?: () => void;
}

export const BulkRowItem = ({
  data,
  displayNumber,
  disabled,
  isDraft,
  onChangeAnswer,
  onChangeSettings,
  onCommit,
  onCommitAnswerDraft,
}: BulkRowItemProps) => {
  const answers =
    data.problemType === 'SINGLE'
      ? data.answers.length > 0
        ? [data.answers[0]]
        : []
      : data.answers;
  const isInvalid = !isDraft && !disabled && answers.every((a) => a.trim() === '');

  return (
    <Card
      withBorder
      shadow={disabled ? 'none' : 'sm'}
      radius="md"
      mb="md"
      style={{
        borderColor: isInvalid ? 'red' : disabled ? '#eee' : undefined,
        opacity: disabled ? 0.6 : 1,
        backgroundColor: disabled ? '#f8f9fa' : 'white',
      }}
    >
      <Stack gap="sm">
        <Group justify="space-between">
          <Badge size="lg" circle color={isInvalid ? 'red' : isDraft ? 'gray' : 'blue'}>
            {displayNumber}
          </Badge>
          <Group gap="xs">
            <Select
              data={['MARK', 'TEXT']}
              value={data.answerType}
              // answersを空にする等のロジックも親に任せたい場合はdataのみ渡す
              onChange={(v) => onChangeSettings({ answerType: v as AnswerType })}
              size="xs"
              w={80}
              disabled={disabled}
            />
            <Select
              data={['SINGLE', 'ORDERED_SET', 'UNORDERED', 'UNORDERED_SET']}
              value={data.problemType}
              onChange={(v) => onChangeSettings({ problemType: v as any })}
              size="xs"
              w={130}
              disabled={disabled}
            />
            <NumberInput
              value={data.scoring}
              onChange={(v) => onChangeSettings({ scoring: Number(v) })}
              size="xs"
              w={60}
              disabled={disabled}
            />
          </Group>
        </Group>

        <TextInput
          placeholder="問題文 (任意)"
          value={data.question || ''}
          onChange={(e) => onChangeSettings({ question: e.target.value })}
          disabled={disabled}
          variant="filled"
        />

        <Divider label="解答欄" labelPosition="left" />

        <Stack gap="xs">
          {answers.map((ans, aIdx) => (
            <AnswerInputSlot
              aIdx={aIdx}
              ans={ans}
              displayNumber={displayNumber}
              answerType={data.answerType}
              onChangeAnswer={(val) =>
                onChangeAnswer({ answer: val, answerIndex: aIdx, type: 'LIST_SET' })
              }
              onCommit={onCommit}
              disabled={disabled}
            />
          ))}
          {data.problemType !== 'SINGLE' && (
            <Stack>
              <AnswerInputSlot
                aIdx={answers.length}
                ans={data.answerDraft}
                displayNumber={displayNumber}
                answerType={data.answerType}
                onChangeAnswer={(val) =>
                  onChangeAnswer({
                    answer: val,
                    type: data.answerType === 'MARK' ? 'LIST_DRAFT_INSTANT' : 'LIST_DRAFT',
                  })
                }
                onCommit={onCommitAnswerDraft}
                disabled={isDraft || disabled}
              />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

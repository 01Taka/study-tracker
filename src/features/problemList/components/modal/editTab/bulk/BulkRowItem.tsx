import { Badge, Card, Divider, Group, Stack, TextInput } from '@mantine/core';
import { ProblemUnitDataWithDraft, ProblemUnitSettings } from '@/shared/types/app.types';
import { BulkRowAnswerList } from './BulkRowAnswerList';
import { BulkRowSettings } from './BulkRowSettings';

interface BulkRowItemProps {
  data: ProblemUnitDataWithDraft;
  displayNumber: number;
  disabled: boolean;
  isDraft: boolean;
  displayQuestionForm?: boolean;
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

export const BulkRowItem = (props: BulkRowItemProps) => {
  const {
    data,
    displayNumber,
    disabled,
    isDraft,
    displayQuestionForm,
    onChangeAnswer,
    onChangeSettings,
    onCommit,
    onCommitAnswerDraft,
  } = props;

  // ロジックの集約
  const answers =
    data.problemType === 'SINGLE' ? (data.answers[0] ? [data.answers[0]] : []) : data.answers;

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
        <Group justify="space-between" align="center">
          <Badge size="lg" circle color={isInvalid ? 'red' : isDraft ? 'gray' : 'blue'}>
            {displayNumber}
          </Badge>

          <BulkRowSettings settings={data} disabled={disabled} onChange={onChangeSettings} />
        </Group>

        {displayQuestionForm && (
          <Stack gap="xs">
            <TextInput
              placeholder="問題文 (任意)"
              value={data.question || ''}
              onChange={(e) => onChangeSettings({ question: e.target.value })}
              disabled={disabled}
              variant="filled"
            />
            <Divider label="解答欄" labelPosition="left" />
          </Stack>
        )}

        <BulkRowAnswerList
          answers={answers}
          answerDraft={data.answerDraft}
          problemType={data.problemType}
          answerType={data.answerType}
          displayNumber={displayNumber}
          disabled={disabled}
          isDraft={isDraft}
          onChangeAnswer={onChangeAnswer}
          onCommit={onCommit}
          onCommitAnswerDraft={onCommitAnswerDraft}
        />
      </Stack>
    </Card>
  );
};

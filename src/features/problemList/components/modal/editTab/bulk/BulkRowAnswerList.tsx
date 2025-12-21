import { Stack } from '@mantine/core';
import { AnswerType, ProblemType } from '@/shared/types/app.types';
import { AnswerInputSlot } from './AnswerInputSlot';

interface BulkRowAnswerListProps {
  answers: string[];
  answerDraft: string;
  problemType: ProblemType;
  answerType: AnswerType;
  displayNumber: number;
  disabled: boolean;
  isDraft: boolean;
  onChangeAnswer: (args: { answer: string; answerIndex?: number; type: any }) => void;
  onCommit?: () => void;
  onCommitAnswerDraft?: () => void;
}

export const BulkRowAnswerList = ({
  answers,
  answerDraft,
  problemType,
  answerType,
  displayNumber,
  disabled,
  isDraft,
  onChangeAnswer,
  onCommit,
  onCommitAnswerDraft,
}: BulkRowAnswerListProps) => {
  return (
    <Stack gap="xs">
      {answers.map((ans, aIdx) => (
        <AnswerInputSlot
          key={aIdx}
          problemNumber={displayNumber + aIdx}
          value={ans}
          answerType={answerType}
          onChange={(val) => onChangeAnswer({ answer: val, answerIndex: aIdx, type: 'LIST_SET' })}
          onCommit={onCommit}
          disabled={disabled}
        />
      ))}

      {(problemType !== 'SINGLE' || answers.length === 0) && (
        <AnswerInputSlot
          problemNumber={displayNumber + answers.length}
          value={answerDraft}
          answerType={answerType}
          onChange={(val) =>
            onChangeAnswer({
              answer: val,
              type: answerType === 'MARK' ? 'LIST_DRAFT_INSTANT' : 'LIST_DRAFT',
            })
          }
          onCommit={onCommitAnswerDraft}
          disabled={(problemType !== 'SINGLE' && isDraft) || disabled}
        />
      )}
    </Stack>
  );
};

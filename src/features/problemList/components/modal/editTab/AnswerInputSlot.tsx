import React from 'react';
import { Box, Text, TextInput } from '@mantine/core';
import { MarkInputGroup } from './MarkInputGroup';

interface AnswerInputSlotProps {
  aIdx: number;
  displayNumber: number;
  ans: string;
  answerType: string;
  disabled?: boolean;
  onChangeAnswer: (val: string) => void;
  onCommit?: () => void;
}

export const AnswerInputSlot: React.FC<AnswerInputSlotProps> = ({
  aIdx,
  displayNumber,
  ans,
  answerType,
  disabled,
  onChangeAnswer,
  onCommit,
}) => {
  return (
    <Box>
      <Text size="xs" c="dimmed" mb={4}>
        Answer {displayNumber + aIdx}
      </Text>

      {answerType === 'MARK' ? (
        <MarkInputGroup value={ans} onChange={(val) => onChangeAnswer(val)} disabled={disabled} />
      ) : (
        <TextInput
          placeholder={'答えを入力'}
          value={ans}
          onChange={(e) => onChangeAnswer(e.target.value)}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit?.();
          }}
          onBlur={() => onCommit?.()}
          styles={{ input: { fontSize: '16px' } }}
        />
      )}
    </Box>
  );
};

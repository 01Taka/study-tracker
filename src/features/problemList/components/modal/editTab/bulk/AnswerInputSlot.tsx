import React from 'react';
import { Box, Text, TextInput } from '@mantine/core';
import { MarkInputGroup } from './MarkInputGroup';

interface AnswerInputSlotProps {
  problemNumber: number;
  value: string;
  answerType: string;
  disabled?: boolean;
  onChange: (val: string) => void;
  onCommit?: () => void;
}

export const AnswerInputSlot: React.FC<AnswerInputSlotProps> = ({
  problemNumber,
  value,
  answerType,
  disabled,
  onChange,
  onCommit,
}) => {
  return (
    <Box>
      <Text size="xs" c="dimmed" mb={4}>
        Answer {problemNumber}
      </Text>

      {answerType === 'MARK' ? (
        <MarkInputGroup value={value} onChange={(val) => onChange(val)} disabled={disabled} />
      ) : (
        <TextInput
          placeholder={'答えを入力'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

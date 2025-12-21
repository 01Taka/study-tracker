import { Group, NumberInput, Select } from '@mantine/core';
import { AnswerType, ProblemUnitSettings } from '@/shared/types/app.types';
import {
  ANSWER_TYPE_SELECTIONS,
  PROBLEM_TYPE_SELECTIONS,
} from '../../../../constants/form-constants';

interface BulkRowSettingsProps {
  settings: Pick<ProblemUnitSettings, 'answerType' | 'problemType' | 'scoring'>;
  disabled?: boolean;
  onChange: (data: Partial<ProblemUnitSettings>) => void;
}

export const BulkRowSettings = ({ settings, disabled, onChange }: BulkRowSettingsProps) => (
  <Group gap="xs">
    <Select
      data={ANSWER_TYPE_SELECTIONS}
      value={settings.answerType}
      onChange={(v) => onChange({ answerType: v as AnswerType })}
      size="xs"
      w={80}
      disabled={disabled}
    />
    <Select
      data={PROBLEM_TYPE_SELECTIONS}
      value={settings.problemType}
      onChange={(v) => onChange({ problemType: v as any })}
      size="xs"
      w={110}
      disabled={disabled}
    />
    <NumberInput
      value={settings.scoring}
      onChange={(v) => onChange({ scoring: Number(v) })}
      rightSection={
        <span style={{ fontSize: '12px', color: 'gray', paddingRight: '10px' }}>点</span>
      }
      rightSectionWidth={35}
      size="xs"
      w={70}
      disabled={disabled}
    />
  </Group>
);

import { useEffect, useMemo, useState } from 'react';
import { IconArrowRight, IconArrowUp, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Chip,
  Collapse,
  Flex,
  Group,
  NumberInput,
  Paper,
  Select,
  Text,
  TextInput,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import {
  ANSWER_TYPE_SELECTIONS,
  PROBLEM_TYPE_SELECTIONS,
} from '@/features/problemList/constants/form-constants';
import { useKeyboardInput } from '@/features/problemList/hooks/useKeyboardInput';
import { useScoreKeyboardInput } from '@/features/problemList/hooks/useScoreKeyboardInput';
import { UnitBulkAddFormUnit, UnitBulkAddFormValues } from '@/features/problemList/types/types';
import { MARK_SELECTIONS } from '@/shared/constants/mark-selections';

interface DraftOverlayProps {
  form: UseFormReturnType<
    UnitBulkAddFormValues,
    (values: UnitBulkAddFormValues) => UnitBulkAddFormValues
  >;
  opened: boolean;
  onToggle: () => void;
  commitDraft: (optionalAnswers?: string[] | undefined) => void;
  pushAnswerToDraft: (val: string) => void;
  updateUnitFields: (index: number, val: Partial<UnitBulkAddFormUnit>) => void;
}

export const DraftOverlay = ({
  form,
  opened,
  onToggle,
  commitDraft,
  updateUnitFields,
}: DraftOverlayProps) => {
  const { unitSetting, answerDraft, questionDraft } = form.values;
  const [answerInput, setAnswerInput] = useState<string>('');
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleMarkSelect = (val: string) => {
    setClickedId(val);
    if (unitSetting.problemType === 'SINGLE') {
      commitDraft([val]);
    } else {
      form.insertListItem('answerDraft', val);
    }
    setTimeout(() => setClickedId(null), 300);
  };

  useKeyboardInput({
    active: opened,
    handleMarkSelect,
    handleScoringSelect: (scoring) => {
      form.setFieldValue('unitSetting.scoring', scoring);
    },
  });

  const handleTextEnter = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    const val = answerInput.trim();
    if (!val || (e && e.key !== 'Enter')) return;
    e?.preventDefault();
    setAnswerInput('');
    if (needEnterButton) {
      form.insertListItem('answerDraft', val);
    } else {
      commitDraft([val]);
    }
  };

  const scoringData = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => ({
        value: (i + 1).toString(),
        label: `${i + 1} 点`,
      })),
    []
  );

  const needEnterButton = unitSetting.problemType !== 'SINGLE';
  const isFilledAnswer =
    unitSetting.problemType === 'SINGLE' ? answerInput : answerDraft.length !== 0;

  return (
    <Paper
      shadow="xl"
      p={opened ? 'md' : 'xs'}
      radius="md"
      withBorder
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        transition: 'all 0.3s ease',
      }}
    >
      {/* ヘッダー部分：クリックで開閉 */}
      <Group
        justify="space-between"
        mb={opened ? 'xs' : 0}
        onClick={() => onToggle()}
        style={{ cursor: 'pointer' }}
      >
        <Flex align="center" gap="xs">
          <Text size="xs" fw={700} c="blue">
            NEW UNIT DRAFT
          </Text>
          {!opened && questionDraft && (
            <Text size="xs" c="dimmed" truncate style={{ maxWidth: 200 }}>
              : {questionDraft}
            </Text>
          )}
        </Flex>
        <ActionIcon variant="subtle" color="gray" size="sm">
          {opened ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
        </ActionIcon>
      </Group>

      <Collapse in={opened}>
        {/* Settings Row */}
        <Group mb="xs" grow>
          <Select
            data={ANSWER_TYPE_SELECTIONS}
            {...form.getInputProps('unitSetting.answerType')}
            size="xs"
            allowDeselect={false}
          />
          <Select
            data={PROBLEM_TYPE_SELECTIONS}
            {...form.getInputProps('unitSetting.problemType')}
            size="xs"
            allowDeselect={false}
          />
          <Select
            data={scoringData}
            {...form.getInputProps('unitSetting.scoring')}
            // Mantineのformで数値型として扱いたい場合は、onChangeをラップします
            onChange={(val) => form.setFieldValue('unitSetting.scoring', Number(val))}
            value={form.values.unitSetting.scoring.toString()}
            size="xs"
            allowDeselect={false}
            searchable // 100個あるので検索可能にすると便利です
            nothingFoundMessage="見つかりません"
            styles={{
              root: { flex: 1 }, // 他のSelectとの幅調整用
            }}
          />
        </Group>

        {/* Question */}
        <TextInput placeholder="New Question..." {...form.getInputProps('questionDraft')} mb="xs" />

        {/* Answer Input */}
        {unitSetting.answerType === 'MARK' ? (
          <Box>
            <Group gap="2" grow>
              {MARK_SELECTIONS.map((item) => {
                const isClicked = item === clickedId;
                return (
                  <Button
                    key={item}
                    variant={isClicked ? 'filled' : 'light'}
                    color={isClicked ? 'blue' : 'gray'}
                    size="sm"
                    onClick={() => handleMarkSelect(item)}
                    styles={{
                      root: {
                        transition: 'all 0.1s ease',
                        transform: isClicked ? 'scale(0.95)' : 'scale(1)',
                        flex: 1,
                        padding: 0,
                      },
                    }}
                  >
                    {item}
                  </Button>
                );
              })}
            </Group>
          </Box>
        ) : (
          <Flex gap={'sm'}>
            <TextInput
              placeholder="Answer (Enter to add)"
              onKeyDown={handleTextEnter}
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              flex={1}
            />
            <Button
              onClick={() => handleTextEnter()}
              rightSection={<IconArrowRight />}
              disabled={!answerInput}
            >
              確定
            </Button>
          </Flex>
        )}

        {/* Staged Answers Preview */}
        {answerDraft.length > 0 && (
          <Group gap={4} mt="xs">
            {answerDraft.map((a: string, i: number) => (
              <Chip
                key={`${a}-${i}`}
                checked={true}
                variant="filled"
                size="sm"
                color="cyan"
                onClick={() => form.removeListItem('answerDraft', i)}
                styles={{
                  label: { cursor: 'pointer' },
                  iconWrapper: { display: 'none' },
                }}
              >
                {a} ×
              </Chip>
            ))}
          </Group>
        )}

        <Button
          fullWidth
          mt="md"
          onClick={() => needEnterButton && commitDraft()}
          disabled={needEnterButton && !isFilledAnswer}
          color={needEnterButton ? 'blue' : 'orange'}
          variant={needEnterButton ? 'filled' : 'light'}
          leftSection={<IconArrowUp size={16} />}
          style={{
            cursor: !needEnterButton ? 'not-allowed' : 'pointer',
            opacity: !needEnterButton ? 0.8 : 1,
          }}
        >
          {needEnterButton
            ? 'この内容で追加'
            : unitSetting.answerType === 'MARK'
              ? '記号・数字を選択してください'
              : '回答を入力し、確定してください'}
        </Button>
      </Collapse>
    </Paper>
  );
};

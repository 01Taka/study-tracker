import { memo, useMemo, useState } from 'react';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Collapse,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import {
  ANSWER_TYPE_SELECTIONS,
  PROBLEM_TYPE_SELECTIONS,
} from '@/features/problemList/constants/form-constants';
import { UnitBulkAddFormUnit, UnitCardProps } from '@/features/problemList/types/types';
import { MARK_SELECTIONS } from '@/shared/constants/mark-selections';
import { AnswerType, ProblemRange, ProblemType } from '@/shared/types/app.types';

const AnswerList = memo(
  ({
    unit,
    index,
    updateUnitAnswer,
    removeAnswer,
    range,
  }: {
    unit: UnitBulkAddFormUnit;
    index: number;
    updateUnitAnswer: (uIdx: number, aIdx: number, val: string) => void;
    removeAnswer: (uIdx: number, aIdx: number) => void;
    range?: ProblemRange;
  }) => {
    // SINGLEタイプの場合は、最初の1つだけを表示対象とする
    const displayAnswers = unit.problemType === 'SINGLE' ? [unit.answers[0] ?? ''] : unit.answers;

    return (
      <Stack gap="xs" mt="md">
        {displayAnswers.map((ans: string, aIdx: number) => {
          // 問題番号の取得 (rangeがある場合は配列から、ない場合はフォールバック)
          const problemNo = range?.problemNumbers?.[aIdx];

          return (
            <Group key={`${unit.id}-ans-${aIdx}`} wrap="nowrap" align="center">
              {/* 問題番号のラベル表示 */}
              <Text size="sm" fw={700} style={{ minWidth: '2rem' }}>
                {problemNo ? `問${problemNo}` : `解答${aIdx + 1}`}
              </Text>

              {unit.answerType === 'MARK' ? (
                <SegmentedControl
                  color="blue"
                  data={MARK_SELECTIONS}
                  value={ans}
                  onChange={(v) => updateUnitAnswer(index, aIdx, v)}
                  size="xs"
                  flex={1}
                  fullWidth
                />
              ) : (
                <TextInput
                  placeholder="解答を入力"
                  value={ans}
                  onChange={(e) => updateUnitAnswer(index, aIdx, e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
              )}

              {/* SINGLEではなく、かつ2つ以上解答がある場合のみ削除ボタンを表示 */}
              {unit.problemType !== 'SINGLE' && unit.answers.length > 1 && (
                <ActionIcon color="red" variant="subtle" onClick={() => removeAnswer(index, aIdx)}>
                  <IconTrash size={14} />
                </ActionIcon>
              )}
            </Group>
          );
        })}
      </Stack>
    );
  }
);

const InternalDraft = memo(
  ({
    unit,
    index,
    isDraftOpen,
    internalDraft,
    setInternalDraft,
    commitPushAnswerDraft,
    setExpandedDraftId,
  }: {
    unit: UnitBulkAddFormUnit;
    index: number;
    isDraftOpen: boolean;
    internalDraft: string;
    setInternalDraft: (draft: string) => void;
    commitPushAnswerDraft: (uIdx: number, answers: string[]) => void;
    setExpandedDraftId: React.Dispatch<React.SetStateAction<string | null>>;
  }) => {
    const handlePushDraft = () => {
      if (!internalDraft) return;
      commitPushAnswerDraft(index, [internalDraft]);
      setInternalDraft('');
    };

    return (
      <>
        <Button
          variant="subtle"
          size="xs"
          mt="xs"
          leftSection={<IconPlus size={12} />}
          onClick={() =>
            setExpandedDraftId((prev: string | null) => (prev === unit.id ? null : unit.id))
          }
        >
          Add Answer
        </Button>
        <Collapse in={isDraftOpen}>
          <Group mt="xs" wrap="nowrap" align="flex-start">
            {unit.answerType === 'MARK' ? (
              <Box flex={1}>
                <Group gap="2" grow>
                  {MARK_SELECTIONS.map((item) => {
                    const isClicked = false;
                    return (
                      <Button
                        key={item}
                        variant={isClicked ? 'filled' : 'light'}
                        color={isClicked ? 'blue' : 'gray'}
                        size="sm"
                        onClick={() => commitPushAnswerDraft(index, [item])}
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
              <TextInput
                placeholder="New answer..."
                value={internalDraft}
                onChange={(e) => setInternalDraft(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePushDraft();
                }}
                style={{ flex: 1 }}
                rightSection={
                  <ActionIcon size="xs" variant="filled" color="blue" onClick={handlePushDraft}>
                    <IconPlus size={10} />
                  </ActionIcon>
                }
              />
            )}
          </Group>
        </Collapse>
      </>
    );
  }
);

const HeaderSettings = memo(
  ({
    unit,
    index,
    updateUnitFields,
    removeUnit,
  }: {
    unit: UnitBulkAddFormUnit;
    index: number;
    updateUnitFields: (index: number, val: Partial<UnitBulkAddFormUnit>) => void;
    removeUnit: (index: number) => void;
  }) => {
    const scoringData = useMemo(
      () =>
        Array.from({ length: 100 }, (_, i) => ({
          value: (i + 1).toString(),
          label: `${i + 1} 点`,
        })),
      []
    );

    return (
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Select
            data={ANSWER_TYPE_SELECTIONS}
            value={unit.answerType}
            onChange={(v) => updateUnitFields(index, { answerType: v as AnswerType })}
            size="xs"
            w={80}
            allowDeselect={false}
          />
          <Select
            data={PROBLEM_TYPE_SELECTIONS}
            value={unit.problemType}
            onChange={(v) => updateUnitFields(index, { problemType: v as ProblemType })}
            size="xs"
            w={100}
            allowDeselect={false}
          />
          <Select
            data={scoringData}
            // Mantineのformで数値型として扱いたい場合は、onChangeをラップします
            onChange={(val) => updateUnitFields(index, { scoring: Number(val) })}
            value={unit.scoring.toString()}
            size="xs"
            allowDeselect={false}
            searchable // 100個あるので検索可能にすると便利です
            nothingFoundMessage="見つかりません"
            styles={{
              root: { flex: 1 }, // 他のSelectとの幅調整用
            }}
          />

          <ActionIcon color="red" variant="subtle" onClick={() => removeUnit(index)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        <TextInput
          placeholder="Question text..."
          value={unit.question || ''}
          onChange={(e) => updateUnitFields(index, { question: e.currentTarget.value })}
          variant="filled"
        />
      </Stack>
    );
  }
);
// --- 1. UnitCardContent (重いUI部分：徹底的にメモ化) ---
export const UnitCard = memo(
  ({
    unit,
    range,
    index,
    removeUnit,
    updateUnitFields,
    updateUnitAnswer,
    removeAnswer,
    commitPushAnswerDraft,
    expandedDraftId,
    setExpandedDraftId,
  }: Omit<UnitCardProps, 'isMergeMode' | 'isSelectedForMerge' | 'onToggleMergeSelect'>) => {
    const [internalDraft, setInternalDraft] = useState('');

    const isDraftOpen = expandedDraftId === unit.id;

    return (
      <Card withBorder shadow="sm" radius="md" mb="sm">
        <HeaderSettings
          unit={unit}
          index={index}
          updateUnitFields={updateUnitFields}
          removeUnit={removeUnit}
        />
        <AnswerList
          unit={unit}
          index={index}
          updateUnitAnswer={updateUnitAnswer}
          removeAnswer={removeAnswer}
          range={range}
        />
        {unit.problemType !== 'SINGLE' && (
          <InternalDraft
            unit={unit}
            index={index}
            internalDraft={internalDraft}
            setInternalDraft={setInternalDraft}
            commitPushAnswerDraft={commitPushAnswerDraft}
            isDraftOpen={isDraftOpen}
            setExpandedDraftId={setExpandedDraftId}
          />
        )}
      </Card>
    );
  },
  (prev, next) => {
    // 【最重要】参照比較 (===) ではなく、値の比較を行う
    return (
      prev.index === next.index &&
      prev.expandedDraftId === next.expandedDraftId &&
      // Unitの中身を値で比較
      prev.unit.id === next.unit.id &&
      prev.unit.question === next.unit.question &&
      prev.unit.scoring === next.unit.scoring &&
      prev.unit.answerType === next.unit.answerType &&
      prev.unit.problemType === next.unit.problemType &&
      JSON.stringify(prev.unit.answers) === JSON.stringify(next.unit.answers) &&
      JSON.stringify(prev.range) === JSON.stringify(next.range)
    );
  }
);

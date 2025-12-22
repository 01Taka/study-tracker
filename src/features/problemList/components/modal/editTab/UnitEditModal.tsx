import { useEffect, useState } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, Divider, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ProblemUnit, ProblemUnitData } from '@/shared/types/app.types';
import { AnswerInputSlot } from './bulk/AnswerInputSlot';
import { BulkRowSettings } from './bulk/BulkRowSettings';

interface UnitEditModalProps {
  opened: boolean;
  onClose: () => void;
  unit: ProblemUnit | null;
  problemNumber: number;
  onSave: (data: ProblemUnitData) => void;
}

export const UnitEditModal = ({
  opened,
  onClose,
  unit,
  problemNumber,
  onSave,
}: UnitEditModalProps) => {
  const [warningOpened, setWarningOpened] = useState(false);

  const form = useForm<ProblemUnitData>({
    initialValues: {
      question: '',
      answers: [],
      scoring: 0,
      problemType: 'SINGLE', // 初期値は適切なものに
      answerType: 'TEXT',
    },
  });

  const [answerDraft, setAnswerDraft] = useState('');

  // Modalが開いたとき、またはunitが変わったときにフォームをリセット
  useEffect(() => {
    if (unit && opened) {
      form.setValues({
        question: unit.question,
        answers: [...unit.problems.map((problem) => problem.answer)],
        scoring: unit.scoring,
        problemType: unit.problemType,
        answerType: unit.answerType,
      });
      form.resetDirty();
    }
  }, [unit, opened]);

  if (!unit) return null;

  const handlePreSave = (values: ProblemUnitData) => {
    // 構造が変わったかどうかの判定
    const isStructureChanged =
      values.answerType !== unit.answerType ||
      values.problemType !== unit.problemType ||
      JSON.stringify([...values.answers].sort()) !==
        JSON.stringify([...unit.problems.map((problem) => problem.answer)].sort());

    if (isStructureChanged) {
      setWarningOpened(true);
    } else {
      onSave(values);
      onClose();
    }
  };

  const confirmSave = () => {
    onSave(form.values);
    setWarningOpened(false);
    onClose();
  };

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="問題の編集" size="lg">
        <form onSubmit={form.onSubmit(handlePreSave)}>
          <Stack>
            <BulkRowSettings settings={form.values} onChange={(v) => form.setValues(v)} />

            <TextInput label="問題文" {...form.getInputProps('question')} />

            <Divider label="正答の編集" labelPosition="center" />

            <Stack>
              {form.values.answers.map((_, index) => (
                <AnswerInputSlot
                  key={index}
                  problemNumber={problemNumber + index}
                  answerType={form.values.answerType}
                  {...(form.getInputProps(`answers.${index}`) as any)}
                />
              ))}
              {form.values.problemType !== 'SINGLE' && (
                <AnswerInputSlot
                  problemNumber={problemNumber + form.values.answers.length}
                  value={answerDraft}
                  answerType={form.values.answerType}
                  onChange={(val) => {
                    if (form.values.answerType === 'TEXT') {
                      setAnswerDraft(val);
                    } else {
                      if (val.trim()) {
                        form.insertListItem('answers', val.trim());
                        setAnswerDraft('');
                      }
                    }
                  }}
                  onCommit={() => {
                    if (answerDraft.trim()) {
                      form.insertListItem('answers', answerDraft.trim());
                      setAnswerDraft('');
                    }
                  }}
                />
              )}
            </Stack>

            <Button mt="md" type="submit">
              保存
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={warningOpened} onClose={() => setWarningOpened(false)} title="履歴連携の警告">
        <Stack align="center">
          <IconAlertTriangle size={48} color="orange" />
          <Text ta="center">
            形式が変更されました。保存すると新規問題として扱われ、過去の履歴連携が切れます。
          </Text>
          <Group mt="md">
            <Button variant="default" onClick={() => setWarningOpened(false)}>
              キャンセル
            </Button>
            <Button color="red" onClick={confirmSave}>
              変更して保存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { IconAlertTriangle, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { AnswerType, ProblemType, ProblemUnit, ProblemUnitData } from '@/shared/types/app.types';

interface UnitEditModalProps {
  opened: boolean;
  onClose: () => void;
  unit: ProblemUnit | null;
  onSave: (data: ProblemUnitData) => void;
}

export const UnitEditModal = ({ opened, onClose, unit, onSave }: UnitEditModalProps) => {
  const [data, setData] = useState<ProblemUnitData | null>(null);
  const [warningOpened, setWarningOpened] = useState(false);

  useEffect(() => {
    if (unit) {
      setData({
        question: unit.question,
        answers: [...unit.answers],
        scoring: unit.scoring,
        problemType: unit.problemType,
        answerType: unit.answerType,
      });
    }
  }, [unit]);

  if (!data || !unit) return null;

  const handlePreSave = () => {
    const isStructureChanged =
      data.answerType !== unit.answerType ||
      data.problemType !== unit.problemType ||
      JSON.stringify(data.answers.sort()) !== JSON.stringify(unit.answers.sort());

    if (isStructureChanged) {
      setWarningOpened(true);
    } else {
      onSave(data);
      onClose();
    }
  };

  const confirmSave = () => {
    onSave(data);
    setWarningOpened(false);
    onClose();
  };

  // MARKの場合はシンプルにリセットさせるUI（既存実装準拠）
  const addMark = (val: string) => {
    const currentAns = data.answers[0] || '';
    const newAnswers = [...data.answers];
    newAnswers[0] = currentAns + val;
    setData({ ...data, answers: newAnswers });
  };

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="問題の編集" size="lg">
        <Stack>
          <Group grow>
            <NumberInput
              label="配点"
              value={data.scoring}
              onChange={(v) => setData({ ...data, scoring: Number(v) })}
            />
            <Select
              label="回答タイプ"
              data={['MARK', 'TEXT']}
              value={data.answerType}
              onChange={(v) => setData({ ...data, answerType: v as AnswerType, answers: [] })}
            />
            <Select
              label="問題形式"
              data={['SINGLE', 'ORDERED_SET', 'UNORDERED', 'UNORDERED_SET']}
              value={data.problemType}
              onChange={(v) => setData({ ...data, problemType: v as ProblemType })}
            />
          </Group>

          <TextInput
            label="問題文"
            value={data.question || ''}
            onChange={(e) => setData({ ...data, question: e.target.value })}
          />

          <Divider label="正答の編集" labelPosition="center" />

          {data.answerType === 'MARK' ? (
            <Stack>
              <Text size="sm">現在の正答: {data.answers.join(', ')}</Text>
              <Button size="xs" color="gray" onClick={() => setData({ ...data, answers: [''] })}>
                クリア
              </Button>
              <Group gap="xs">
                {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', 'a'].map((char) => (
                  <Button key={char} variant="default" onClick={() => addMark(char)}>
                    {char}
                  </Button>
                ))}
              </Group>
            </Stack>
          ) : (
            <Stack>
              {data.answers.map((ans, idx) => (
                <Group key={idx}>
                  <TextInput
                    flex={1}
                    value={ans}
                    onChange={(e) => {
                      const newArr = [...data.answers];
                      newArr[idx] = e.target.value;
                      setData({ ...data, answers: newArr });
                    }}
                  />
                  <ActionIcon
                    color="red"
                    onClick={() => {
                      const newArr = data.answers.filter((_, i) => i !== idx);
                      setData({ ...data, answers: newArr });
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              {data.problemType !== 'SINGLE' && (
                <Button
                  variant="subtle"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setData({ ...data, answers: [...data.answers, ''] })}
                >
                  回答追加
                </Button>
              )}
            </Stack>
          )}

          <Button mt="md" onClick={handlePreSave}>
            保存
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={warningOpened}
        onClose={() => setWarningOpened(false)}
        title="履歴連携の警告"
        color="red"
      >
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

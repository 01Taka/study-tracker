import React, { useEffect, useState } from 'react';
import { IconCheck, IconQuestionMark, IconX } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { useProblemListData } from '@/features/data/hooks/useProblemListData';
import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { DUMMY_UNITS } from '@/features/tackle/unit-dummy';
import { ProblemUnit } from '@/shared/types/app.types';

export const TacklePage: React.FC = () => {
  const { workbookId, problemListId } = useParams();
  const { getProblemList } = useProblemListData(workbookId ?? '');
  const { getProblemUnits } = useProblemUnitData();

  const problemList = getProblemList(problemListId);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // 初回ロード時に最初の階層を選択
  useEffect(() => {
    if (problemList?.hierarchies.length && !activeTab) {
      setActiveTab(problemList.hierarchies[0].id);
    }
  }, [problemList, activeTab]);

  if (!problemList) return <div>No problem list found</div>;

  const currentHierarchy = problemList.hierarchies.find((h) => h.id === activeTab);
  const units = DUMMY_UNITS; //currentHierarchy ? getProblemUnits(currentHierarchy.unitVersionPaths) : [];

  return (
    <Container size="sm" p="md" pb={100}>
      <Stack gap="md">
        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="xl">
          <Tabs.List style={{ overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 8 }}>
            {problemList.hierarchies.map((h) => (
              <Tabs.Tab key={h.id} value={h.id}>
                {h.name}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {problemList.hierarchies.map((h) => (
            <Tabs.Panel key={h.id} value={h.id} pt="md">
              <Stack gap="lg">
                {units.map((unit, index) => (
                  <ProblemUnitCard key={unit.unitId} unit={unit} index={index + 1} />
                ))}
              </Stack>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>

      {/* フッター固定の完了ボタン */}
      <Paper
        withBorder
        p="md"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <Container size="sm">
          <Button fullWidth size="lg" radius="xl" color="blue">
            回答を終了して採点する
          </Button>
        </Container>
      </Paper>
    </Container>
  );
};

/**
 * 各問題ユニットの入力カード
 */
const ProblemUnitCard = ({ unit, index }: { unit: ProblemUnit; index: number }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [selfEval, setSelfEval] = useState<'CONFIDENT' | 'UNSURE' | 'NONE' | ''>('');

  return (
    <Card withBorder shadow="sm" radius="md" padding="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={700} size="sm" c="dimmed">
            問題 {index}
          </Text>
          <Text size="xs" c="dimmed">
            配点: {unit.scoring}点
          </Text>
        </Group>

        {unit.question && <Text fw={500}>{unit.question}</Text>}

        <Divider variant="dashed" />

        {/* 入力インターフェース */}
        <Box>
          <Text size="xs" fw={700} mb={4} c="dimmed">
            解答入力
          </Text>
          {unit.answerType === 'MARK' ? (
            <SegmentedControl
              fullWidth
              value={userAnswer}
              onChange={setUserAnswer}
              data={['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']}
              styles={{ label: { padding: '8px 0' } }}
            />
          ) : (
            <TextInput
              placeholder="答えを入力"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.currentTarget.value)}
            />
          )}
        </Box>

        {/* 自己評価インターフェース */}
        <Box>
          <Text size="xs" fw={700} mb={8} c="dimmed">
            自己評価
          </Text>
          <Group grow gap="xs">
            <EvalButton
              active={selfEval === 'CONFIDENT'}
              onClick={() => setSelfEval('CONFIDENT')}
              color="green"
              icon={<IconCheck size={20} />}
              label="自信あり"
            />
            <EvalButton
              active={selfEval === 'UNSURE'}
              onClick={() => setSelfEval('UNSURE')}
              color="orange"
              icon={<IconQuestionMark size={20} />}
              label="びみょう"
            />
            <EvalButton
              active={selfEval === 'NONE'}
              onClick={() => setSelfEval('NONE')}
              color="red"
              icon={<IconX size={20} />}
              label="自信なし"
            />
          </Group>
        </Box>
      </Stack>
    </Card>
  );
};

/**
 * 自己評価ボタンのヘルパーコンポーネント
 */
const EvalButton = ({ active, onClick, color, icon, label }: any) => (
  <Button
    variant={active ? 'filled' : 'light'}
    color={color}
    onClick={onClick}
    px={0}
    styles={{ section: { margin: 0 } }}
  >
    <Stack gap={0} align="center">
      {icon}
      <Text size="10px" style={{ marginTop: -2 }}>
        {label}
      </Text>
    </Stack>
  </Button>
);

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IconChevronUp, IconSettings } from '@tabler/icons-react'; // アイコンライブラリ
import { useParams } from 'react-router-dom';
import {
  ActionIcon,
  Button,
  Center,
  Collapse,
  Container,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Switch,
  Tabs,
  Text,
} from '@mantine/core';
import { useHierarchyArchive } from '@/features/data/hooks/useHierarchyArchive';
import { ProblemUnitCard } from '@/features/tackle/components/ProblemUnitCard';
import { EVAL_BASE_CONFIG } from '@/features/tackle/constants/evaluations';
import { useTackleForm } from '@/features/tackle/hooks/useTackleForm';
import { getProblemRangeFromUnit } from '@/shared/functions/unit-utils';

export const TacklePage: React.FC = () => {
  const { workbookId = '', problemListId = '' } = useParams();
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // ステート管理
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [lastInputIndex, setLastInputIndex] = useState(0);
  const [settingsOpened, setSettingsOpened] = useState(true);

  const { hierarchyRecord } = useHierarchyArchive();

  const {
    problemList,
    activeTab,
    filteredHierarchies,
    setActiveTab,
    form,
    units,
    isLoading,
    handleSubmit,
  } = useTackleForm(workbookId, problemListId);

  const scrollToUnit = useCallback((index: number) => {
    const element = cardRefs.current.get(index);
    if (element && element.offsetParent !== null) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, []);

  useEffect(() => {
    if (!autoScrollEnabled) return;

    const answers = form.values.answers;
    const lastInputAnswer = answers[units[lastInputIndex]?.unitId ?? ''];
    const inputCompleted =
      Object.values(lastInputAnswer?.answers || {}).every((v) => v !== '') &&
      lastInputAnswer?.selfEval !== 'UNRATED';

    if (inputCompleted) {
      scrollToUnit(lastInputIndex + 1);
    }
  }, [form.values.answers, autoScrollEnabled, units, lastInputIndex, scrollToUnit]);

  if (isLoading || !problemList) {
    return (
      <Center h={200}>
        <Loader size="sm" />
      </Center>
    );
  }

  return (
    <Container size="sm" p="md" pb={100}>
      <Paper
        withBorder
        p="xs"
        mb="md"
        style={{
          position: 'sticky',
          top: 10,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* 上段：タブと設定トグル */}
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            variant="pills"
            radius="xl"
            keepMounted={false}
            style={{ flexGrow: 1 }}
          >
            <Tabs.List>
              {problemList.currentHierarchyAchieveIds.map((id) => (
                <Tabs.Tab key={id} value={id}>
                  {hierarchyRecord[id].name}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setSettingsOpened((o) => !o)}
            title="設定を表示/非表示"
          >
            {settingsOpened ? <IconChevronUp size={20} /> : <IconSettings size={20} />}
          </ActionIcon>
        </Group>

        {/* 下段：詳細設定（折りたたみ） */}
        <Collapse in={settingsOpened}>
          <Stack gap="xs" mt="sm">
            <Group justify="space-between">
              <Text size="xs" fw={700} c="dimmed">
                問題ジャンプ:
              </Text>
              <Switch
                label="オートスクロール"
                size="xs"
                checked={autoScrollEnabled}
                onChange={(event) => setAutoScrollEnabled(event.currentTarget.checked)}
              />
            </Group>

            <ScrollArea scrollbars="x" offsetScrollbars>
              <Group gap={8} wrap="nowrap" pb="xs">
                {units.map((unit, index) => (
                  <ActionIcon
                    key={unit.unitId}
                    variant="light"
                    color={
                      EVAL_BASE_CONFIG[form.values.answers[unit.unitId]?.selfEval ?? 'UNRATED']
                        .color
                    }
                    radius="xl"
                    size="lg"
                    style={{ flexShrink: 0 }}
                    onClick={() => scrollToUnit(index)}
                  >
                    {index + 1}
                  </ActionIcon>
                ))}
              </Group>
            </ScrollArea>
          </Stack>
        </Collapse>
      </Paper>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* メインコンテンツ */}
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            variant="pills"
            radius="xl"
            keepMounted={false}
          >
            {filteredHierarchies.map((h) => (
              <Tabs.Panel key={h.hierarchyId} value={h.hierarchyId} pt="md">
                <Stack gap="lg">
                  {units.map((unit, index) => {
                    const range = getProblemRangeFromUnit(unit);
                    return (
                      <div
                        key={`${h.hierarchyId}-${unit.unitId}`}
                        ref={(el) => {
                          if (el && activeTab === h.hierarchyId) {
                            cardRefs.current.set(index, el);
                          } else {
                            cardRefs.current.delete(index);
                          }
                        }}
                        style={{ scrollMarginTop: settingsOpened ? '200px' : '100px' }} // ヘッダーの高さに合わせて調整
                      >
                        <ProblemUnitCard
                          unit={unit}
                          problemNumberStart={range.start}
                          problemNumberEnd={range.end}
                          answers={form.values.answers[unit.unitId]?.answers ?? {}}
                          selfEval={form.values.answers[unit.unitId]?.selfEval ?? 'UNRATED'}
                          onAnswerChange={(problemNumber, val) => {
                            form.setFieldValue(
                              `answers.${unit.unitId}.answers.${problemNumber}`,
                              val
                            );
                            setLastInputIndex(index);
                          }}
                          onEvalChange={(val) => {
                            form.setFieldValue(`answers.${unit.unitId}.selfEval`, val);
                            setLastInputIndex(index);
                          }}
                        />
                      </div>
                    );
                  })}
                </Stack>
              </Tabs.Panel>
            ))}
          </Tabs>

          <Button
            type="submit"
            fullWidth
            size="lg"
            style={{ position: 'sticky', bottom: 5, zIndex: 2 }}
          >
            回答完了
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

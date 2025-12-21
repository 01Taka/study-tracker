import React, { useLayoutEffect, useRef } from 'react';
import { rem, ScrollArea, Table, Text, Tooltip } from '@mantine/core';
import { AttemptHistory, SelfEvalResultKey } from '@/shared/types/app.types';

interface AnalysisTabProps {
  histories: AttemptHistory[];
  unitIds: string[];
}

const RESULT_COLORS: Record<SelfEvalResultKey, string> = {
  CONFIDENT_CORRECT: '#40C057',
  CONFIDENT_WRONG: '#BE4BDB',
  UNSURE_CORRECT: '#82C91E',
  UNSURE_WRONG: '#FD7E14',
  NONE_CORRECT: '#82C91E',
  NONE_WRONG: '#FD7E14',
  UNRATED_CORRECT: '#E67E22',
  UNRATED_WRONG: '#FA5252',
};

const COL_WIDTH = rem(40); // データ列の幅
const Q_COL_WIDTH = rem(40); // 「Q」列の幅

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ histories, unitIds }) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  // 右側を最新にする（昇順ソート）
  const sortedHistories = [...histories].sort(
    (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
  );

  // ロード時に右端へインスタントスクロール
  useLayoutEffect(() => {
    if (viewportRef.current) {
      // scrollLeft に非常に大きな値を代入することで右端へ移動
      viewportRef.current.scrollLeft = viewportRef.current.scrollWidth;
    }
  }, [sortedHistories.length]); // データ読み込み完了時にも実行

  const stickyStyle: React.CSSProperties = {
    position: 'sticky',
    left: 0,
    background: 'var(--mantine-color-body)',
    zIndex: 1,
    width: Q_COL_WIDTH,
    minWidth: Q_COL_WIDTH,
    boxShadow: '1px 0 0 var(--mantine-color-gray-3)',
  };

  return (
    <ScrollArea h={'80vh'} offsetScrollbars viewportRef={viewportRef}>
      <Table
        withColumnBorders
        style={{
          width: 'max-content', // 中身に応じて横に伸びる
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <Table.Thead
          style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--mantine-color-body)' }}
        >
          <Table.Tr>
            <Table.Th style={{ ...stickyStyle, zIndex: 3 }} ta="center">
              Q
            </Table.Th>
            {sortedHistories.map((h, i) => {
              const isNewVersion =
                i > 0 && h.problemListVersionId !== sortedHistories[i - 1].problemListVersionId;
              const date = new Date(h.endTime);
              return (
                <Table.Th
                  key={h.id}
                  style={{
                    width: COL_WIDTH,
                    minWidth: COL_WIDTH,
                    padding: `${rem(4)} 0`,
                    textAlign: 'center',
                    borderLeft: isNewVersion
                      ? `${rem(3)} solid var(--mantine-color-blue-filled)`
                      : undefined,
                  }}
                >
                  <Text size="9px" fw={700} style={{ lineHeight: 1 }}>
                    {date.getMonth() + 1}/{date.getDate()}
                  </Text>
                  <Text size="8px" c="dimmed">
                    {date.getHours()}:{date.getMinutes().toString().padStart(2, '0')}
                  </Text>
                </Table.Th>
              );
            })}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {unitIds.map((unitId, idx) => (
            <Table.Tr key={unitId}>
              <Table.Td style={stickyStyle} fw={700} ta="center" fz="xs">
                {idx + 1}
              </Table.Td>
              {sortedHistories.map((history, hIdx) => {
                const attempt = history.unitAttempts[unitId];
                const isNewVersion =
                  hIdx > 0 &&
                  history.problemListVersionId !== sortedHistories[hIdx - 1].problemListVersionId;
                return (
                  <Tooltip
                    key={`${history.id}-${unitId}`}
                    label={attempt ? attempt.resultKey : '未実施'}
                    withinPortal
                  >
                    <Table.Td
                      p={0}
                      style={{
                        width: COL_WIDTH,
                        minWidth: COL_WIDTH,
                        height: rem(30),
                        backgroundColor: attempt ? RESULT_COLORS[attempt.resultKey] : 'transparent',
                        borderLeft: isNewVersion
                          ? `${rem(3)} solid var(--mantine-color-blue-filled)`
                          : undefined,
                        cursor: attempt ? 'pointer' : 'default',
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

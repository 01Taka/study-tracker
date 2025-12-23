import React from 'react';
import { Box, Center, ScrollArea, Table, Text, Tooltip } from '@mantine/core';
import {
  AttemptHistory,
  CombinedProblemResult,
  HistoryLookupMap,
  SelfEvalType,
  UserDefinedHierarchy,
} from '@/shared/types/app.types';

// 定義した型ファイルを想定

interface HistoryTableProps {
  histories: AttemptHistory[];
  hierarchies: UserDefinedHierarchy[];
  lookup: HistoryLookupMap;
  // 各階層に含まれる問題番号のリスト（表示順序を制御するため）
  problemMap: Record<string, number[]>;
}

const SELF_EVAL_COLORS: Record<SelfEvalType, string> = {
  CONFIDENT: 'blue',
  UNSURE: 'yellow',
  NONE: 'gray',
  UNRATED: 'gray',
};

export const HistoryMatrixTable: React.FC<HistoryTableProps> = ({
  histories,
  hierarchies,
  lookup,
  problemMap,
}) => {
  // 日付フォーマット
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });

  // 判定結果のセル描画
  const renderCell = (historyId: string, hierarchyId: string, probNum: number) => {
    const data: CombinedProblemResult | undefined = lookup[historyId]?.[hierarchyId]?.[probNum];

    if (!data) {
      return (
        <Text c="dimmed" size="xs">
          -
        </Text>
      );
    }

    const isCorrect = data.judge === 'CORRECT';
    const evalColor = SELF_EVAL_COLORS[data.parent.selfEval];

    return (
      <Tooltip
        label={`回答: ${data.answer} / 正解: ${data.collectAnswer}`}
        withArrow
        position="top"
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          {/* 正誤を記号で表示 */}
          <Text fw={700} c={isCorrect ? 'blue.6' : 'red.6'} size="sm">
            {isCorrect ? '○' : '×'}
          </Text>
          {/* 自己評価を小さなドットやラインで表示 */}
          <Box
            style={{
              width: '12px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: `var(--mantine-color-${evalColor}-filled)`,
            }}
          />
        </Box>
      </Tooltip>
    );
  };

  return (
    <ScrollArea h={600} offsetScrollbars>
      <Table
        variant="vertical"
        withColumnBorders
        highlightOnHover
        style={{ minWidth: 800, tableLayout: 'fixed' }}
      >
        <Table.Thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white' }}>
          <Table.Tr>
            <Table.Th
              style={{
                width: 150,
                position: 'sticky',
                left: 0,
                zIndex: 11,
                backgroundColor: 'white',
              }}
            >
              階層 / 問題番号
            </Table.Th>
            {histories.map((h) => (
              <Table.Th key={h.id} style={{ textAlign: 'center', width: 80 }}>
                <Text size="xs">{formatDate(h.startTime)}</Text>
                <Text size="xxs" fw={500} c="dimmed">
                  Attempt
                </Text>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {hierarchies.map((hierarchy) => (
            <React.Fragment key={hierarchy.hierarchyId}>
              {/* 階層の見出し行 */}
              <Table.Tr bg="gray.0">
                <Table.Td
                  colSpan={histories.length + 1}
                  style={{ position: 'sticky', left: 0, zIndex: 5 }}
                >
                  <Text fw={700} size="sm">
                    {hierarchy.name}
                  </Text>
                </Table.Td>
              </Table.Tr>

              {/* 各問題の行 */}
              {(problemMap[hierarchy.hierarchyId] || []).map((probNum) => (
                <Table.Tr key={`${hierarchy.hierarchyId}-${probNum}`}>
                  <Table.Td
                    style={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 5,
                      backgroundColor: 'white',
                      borderRight: '2px solid var(--mantine-color-gray-2)',
                    }}
                  >
                    <Text size="xs" pl="md">
                      No. {probNum}
                    </Text>
                  </Table.Td>
                  {histories.map((h) => (
                    <Table.Td key={h.id}>
                      <Center>{renderCell(h.id, hierarchy.hierarchyId, probNum)}</Center>
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </React.Fragment>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

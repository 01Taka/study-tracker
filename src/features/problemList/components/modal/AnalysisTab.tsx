import { Box, ScrollArea, Table, Text } from '@mantine/core';
import { ProblemList } from '@/shared/types/app.types';

export const AnalysisTab = ({ problemList }: { problemList: ProblemList }) => {
  return (
    <ScrollArea>
      <Table withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ minWidth: 100 }}>問題 ID</Table.Th>
            <Table.Th>12/20</Table.Th>
            <Table.Th>12/18</Table.Th>
            <Table.Th>12/15</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {/* マトリックス表示ロジック */}
          <Table.Tr>
            <Table.Td>
              <Text size="xs">str_001_1</Text>
            </Table.Td>
            <Table.Td align="center">
              <Box w={20} h={20} bg="green.5" style={{ borderRadius: 2 }} />
            </Table.Td>
            <Table.Td align="center">
              <Box w={20} h={20} bg="orange.5" style={{ borderRadius: 2 }} />
            </Table.Td>
            <Table.Td align="center">
              <Box w={20} h={20} bg="red.5" style={{ borderRadius: 2 }} />
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
};

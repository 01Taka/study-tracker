import React from 'react';
import { IconBook, IconChevronRight } from '@tabler/icons-react';
import { Box, Card, Group, Stack, Text } from '@mantine/core';
import { Workbook } from '@/shared/types/app.types';

interface WorkbookListProps {
  workbooks: Workbook[];
  onClick: (id: string) => void;
}

export const WorkbookList: React.FC<WorkbookListProps> = ({ workbooks, onClick }) => {
  return (
    <Stack gap="xs">
      {workbooks.map((workbook) => (
        <Card
          key={workbook.id}
          withBorder
          padding="md"
          radius="md"
          component="button" // ボタン要素として扱う
          onClick={() => onClick(workbook.id)}
          styles={(theme) => ({
            root: {
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.colors.gray[0],
                borderColor: theme.colors.blue[4],
                transform: 'translateX(4px)',
              },
            },
          })}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm" style={{ flex: 1 }}>
              {/* 左側：コンテンツアイコン */}
              <Box
                style={(theme) => ({
                  color: theme.colors.blue[6],
                  display: 'flex',
                  alignItems: 'center',
                })}
              >
                <IconBook size={22} stroke={1.5} />
              </Box>

              {/* 中央：テキスト情報 */}
              <Box>
                <Text fw={500} size="sm" style={{ textAlign: 'left' }}>
                  {workbook.name}
                </Text>
              </Box>
            </Group>

            {/* 右側：誘導アイコン */}
            <IconChevronRight size={18} stroke={1.5} color="var(--mantine-color-gray-5)" />
          </Group>
        </Card>
      ))}
    </Stack>
  );
};

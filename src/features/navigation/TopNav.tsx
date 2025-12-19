import React from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import { ActionIcon, Box, Container, Group, Text } from '@mantine/core';

interface TopNavProps {
  title: string;
  onBack?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ title, onBack }) => {
  return (
    <Box
      component="header"
      style={(theme) => ({
        height: 56,
        borderBottom: `1px solid ${theme.colors.gray[3]}`,
        backgroundColor: theme.white,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      })}
    >
      <Container h="100%" size="md">
        <Group h="100%" justify="space-between" align="center" style={{ position: 'relative' }}>
          {/* 左：戻るボタン（存在する場合のみ表示） */}
          <Box style={{ zIndex: 2 }}>
            {onBack && (
              <ActionIcon variant="subtle" color="gray" onClick={onBack} size="lg">
                <IconChevronLeft size={24} />
              </ActionIcon>
            )}
          </Box>

          {/* 中央：タイトル（絶対配置で完全に中央寄せ） */}
          <Box
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              width: '60%', // 長すぎるタイトルのための幅制限
            }}
          >
            <Text fw={700} size="lg" truncate>
              {title}
            </Text>
          </Box>

          {/* 右：レイアウトのバランスをとるための空のボックス */}
          <Box style={{ width: 34 }} />
        </Group>
      </Container>
    </Box>
  );
};

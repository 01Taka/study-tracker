import React, { ReactNode } from 'react';
import { IconChevronLeft } from '@tabler/icons-react';
import { ActionIcon, Box, Container, Group, Text } from '@mantine/core';

interface TopNavProps {
  title: string;
  onBack?: () => void;
  // 右側に表示するコンポーネントを受け取るプロパティを追加
  rightSection?: ReactNode;
}

export const TopNav: React.FC<TopNavProps> = ({ title, onBack, rightSection }) => {
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
          {/* 左：戻るボタン（幅を固定して中央寄せへの影響を最小化） */}
          <Box style={{ zIndex: 2, minWidth: 44 }}>
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
              width: '60%',
              pointerEvents: 'none', // 下の要素（ボタン等）のクリックを邪魔しない
            }}
          >
            <Text fw={700} size="lg" truncate style={{ pointerEvents: 'auto' }}>
              {title}
            </Text>
          </Box>

          {/* 右：任意のコンポーネントを表示 */}
          <Box style={{ zIndex: 2, minWidth: 44, display: 'flex', justifyContent: 'flex-end' }}>
            {rightSection}
          </Box>
        </Group>
      </Container>
    </Box>
  );
};

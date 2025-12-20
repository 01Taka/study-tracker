import React from 'react';
import { Box, SegmentedControl } from '@mantine/core';

interface MarkInputGroupProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const MarkInputGroup = ({ value, onChange, disabled }: MarkInputGroupProps) => {
  const options = ['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <Box>
      <SegmentedControl
        fullWidth
        disabled={disabled}
        value={value}
        color="blue"
        onChange={onChange}
        data={options}
        // ラベルのパディング調整と、文字が潰れないための最小幅を確保
        styles={{
          label: {
            padding: '8px 0',
            fontSize: 'var(--mantine-font-size-sm)',
          },
          root: {
            // 画面が極端に狭い場合に横スクロールを許可する設定
            overflowX: 'auto',
          },
        }}
      />
    </Box>
  );
};

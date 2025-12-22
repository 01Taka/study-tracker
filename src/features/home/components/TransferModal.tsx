import { useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  FileButton,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Text,
} from '@mantine/core';
import { Workbook } from '@/shared/types/app.types';

interface TransferModalProps {
  opened: boolean;
  onClose: () => void;
  workbooks: Workbook[];
  onImport: (json: string) => void;
  onExport: (ids: string[]) => string; // JSON文字列を返す
}

export const TransferModal = ({
  opened,
  onClose,
  workbooks,
  onImport,
  onExport,
}: TransferModalProps) => {
  // エクスポート用に選択されたID管理
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // インポート処理
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        onImport(content);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  // エクスポート実行（JSON生成 -> ダウンロード）
  const handleExportDownload = () => {
    const jsonString = onExport(selectedIds);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workbooks_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      title="データの移行"
      styles={{ header: { padding: '16px' } }}
    >
      <Tabs defaultValue="import">
        <Tabs.List grow>
          <Tabs.Tab value="import">インポート</Tabs.Tab>
          <Tabs.Tab value="export">エクスポート</Tabs.Tab>
        </Tabs.List>

        {/* タブ1: インポート */}
        <Tabs.Panel value="import" pt="xl">
          <Stack align="center" gap="lg" px="md">
            <Text size="sm" c="dimmed" ta="center">
              エクスポートされたJSONファイルを選択して、問題集を追加します。
            </Text>
            <FileButton onChange={handleFileChange} accept="application/json">
              {(props) => (
                <Button {...props} fullWidth size="md">
                  JSONファイルを選択
                </Button>
              )}
            </FileButton>
          </Stack>
        </Tabs.Panel>

        {/* タブ2: エクスポート */}
        <Tabs.Panel value="export" pt="xl">
          <Stack style={{ height: 'calc(100vh - 200px)' }}>
            <Text size="sm" c="dimmed" px="md">
              エクスポートする問題集を選択してください。
            </Text>

            <ScrollArea scrollbars="y" style={{ flex: 1 }} px="md">
              <Stack gap="xs">
                {workbooks.map((wb) => (
                  <Paper
                    key={wb.id}
                    withBorder
                    p="sm"
                    onClick={() =>
                      setSelectedIds((prev) =>
                        prev.includes(wb.id) ? prev.filter((id) => id !== wb.id) : [...prev, wb.id]
                      )
                    }
                  >
                    <Group justify="space-between">
                      <Text fw={500} size="sm">
                        {wb.name}
                      </Text>
                      <Checkbox
                        checked={selectedIds.includes(wb.id)}
                        onChange={() => {}} // 親PaperのonClickで制御
                        tabIndex={-1}
                      />
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>

            <Divider />

            <Group p="md">
              <Button
                fullWidth
                size="md"
                disabled={selectedIds.length === 0}
                onClick={handleExportDownload}
              >
                選択した {selectedIds.length} 件をダウンロード
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

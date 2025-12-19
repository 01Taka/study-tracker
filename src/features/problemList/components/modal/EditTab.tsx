import { IconPlus } from '@tabler/icons-react';
import { ActionIcon, Button, Tabs as MantineTabs, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ProblemList } from '@/shared/types/app.types';

export const EditTab = ({ problemList }: { problemList: ProblemList }) => {
  const [bulkModalOpened, { open, close }] = useDisclosure(false);

  return (
    <Stack>
      <MantineTabs variant="outline" defaultValue={problemList.hierarchies[0]?.id}>
        <MantineTabs.List>
          {problemList.hierarchies.map((h) => (
            <MantineTabs.Tab key={h.id} value={h.id}>
              {h.name}
            </MantineTabs.Tab>
          ))}
          <ActionIcon variant="subtle" m="auto" px="xs">
            <IconPlus size={16} />
          </ActionIcon>
        </MantineTabs.List>
        {/* 各階層のユニット編集リストを表示 */}
      </MantineTabs>

      <Button variant="light" onClick={open}>
        問題を一括追加
      </Button>

      {/* 一括追加モーダル (100セット表示用) */}
      <Modal opened={bulkModalOpened} onClose={close} title="一括追加" fullScreen>
        <Stack>
          {/* 100セット生成のロジックをここに配置 */}
          <Text size="sm" c="dimmed">
            100セットの入力フォームがここに並びます
          </Text>
          <Button onClick={close}>完了</Button>
        </Stack>
      </Modal>
    </Stack>
  );
};

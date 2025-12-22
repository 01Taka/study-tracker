import React from 'react';
import { Button, Divider, Drawer, Group, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

interface CreateProblemListBottomSheetProps {
  opened: boolean;
  onClose: () => void;
  onCreate: (data: { name: string }) => void;
}

export const CreateProblemListBottomSheet: React.FC<CreateProblemListBottomSheetProps> = ({
  opened,
  onClose,
  onCreate,
}) => {
  // フォームの状態管理
  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim().length < 1 ? '名前を入力してください' : null),
    },
  });

  const handleSubmit = (values: { name: string }) => {
    onCreate(values);
    form.reset(); // 送信後にフォームをクリア
    onClose(); // 閉じる
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="auto" // コンテンツの高さに合わせる
      radius="md"
      withCloseButton={false} // カスタムヘッダーを作るため非表示
      styles={{
        content: {
          // PCで見た時に横に広がりすぎないよう調整
          maxWidth: 600,
          margin: '0 auto',
          borderRadius: '16px 16px 0 0',
        },
      }}
    >
      <Stack p="md" gap="md">
        {/* ヘッダー部分：モバイルのボトムシート風のバーを模したデザイン */}
        <Group justify="center" mb="-xs">
          <Divider w={40} size="lg" labelPosition="center" style={{ borderRadius: 10 }} />
        </Group>

        <Title order={3} size="h4" style={{ textAlign: 'center' }}>
          新規問題リストの作成
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="問題リスト名"
              placeholder="例: 英単語、歴史の暗記など"
              required
              data-autofocus // 開いた時に自動でフォーカス
              {...form.getInputProps('name')}
            />

            <Group grow mt="lg">
              <Button variant="default" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit">作成する</Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Drawer>
  );
};

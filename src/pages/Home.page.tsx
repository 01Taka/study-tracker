import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react'; // 追加

import { useNavigate } from 'react-router-dom';
import { Affix, Box, Button, Transition } from '@mantine/core'; // 追加

import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { CreateWorkbookBottomSheet } from '@/features/home/components/CreateWorkbookBottomSheet';
import { WorkbookList } from '@/features/home/components/WorkbookList';
import { TopNav } from '@/features/navigation/TopNav';

export function HomePage() {
  const navigate = useNavigate();
  const { onCreate, workbooks } = useWorkbookData();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <TopNav title="Home" />

      <Box p={'md'}>
        <WorkbookList workbooks={workbooks} onClick={(id) => navigate(`${id}/problemList`)} />
      </Box>

      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={true}>
          {(transitionStyles) => (
            <Button
              style={transitionStyles}
              leftSection={<IconPlus size={20} />}
              radius="xl"
              size="lg"
              onClick={() => setOpened(true)}
            >
              作成
            </Button>
          )}
        </Transition>
      </Affix>

      <CreateWorkbookBottomSheet
        opened={opened}
        onClose={() => setOpened(false)}
        onCreate={onCreate}
      />
    </>
  );
}

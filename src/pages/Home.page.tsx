import { useState } from 'react';
import { IconFileExport, IconPlus } from '@tabler/icons-react'; // 追加

import { useNavigate } from 'react-router-dom';
import { ActionIcon, Affix, Box, Button, Transition } from '@mantine/core'; // 追加

import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { useWorkbookData } from '@/features/data/hooks/useWorkbookData';
import { useWorkbookTransfer } from '@/features/data/hooks/useWorkbookTransfer';
import { CreateWorkbookBottomSheet } from '@/features/home/components/CreateWorkbookBottomSheet';
import { TransferModal } from '@/features/home/components/TransferModal';
import { WorkbookList } from '@/features/home/components/WorkbookList';
import { TopNav } from '@/features/navigation/TopNav';

export function HomePage() {
  const navigate = useNavigate();
  const { workbooks, updateWorkbooks, onCreate, reloadWorkbook } = useWorkbookData();
  const { unitRecord, updateAndSaveRecord } = useProblemUnitData(reloadWorkbook);

  const { exportWorkbooks, importWorkbooks } = useWorkbookTransfer(
    workbooks,
    unitRecord,
    updateWorkbooks,
    updateAndSaveRecord
  );

  const [opened, setOpened] = useState(false);
  const [openedTransferModal, setOpenedTransferModal] = useState(false);

  return (
    <>
      <TopNav
        title="Home"
        rightSection={
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setOpenedTransferModal(true)}
            size="lg"
          >
            <IconFileExport size={24} />
          </ActionIcon>
        }
      />

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

      <TransferModal
        opened={openedTransferModal}
        workbooks={workbooks}
        onClose={() => setOpenedTransferModal(false)}
        onExport={exportWorkbooks}
        onImport={importWorkbooks}
      />
    </>
  );
}

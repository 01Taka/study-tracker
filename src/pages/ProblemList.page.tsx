import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Affix, Box, Button, Transition } from '@mantine/core';
import { useProblemListData } from '@/features/data/hooks/useProblemListData';
import { TopNav } from '@/features/navigation/TopNav';
import { CreateProblemListBottomSheet } from '@/features/problemList/components/CreateProblemListBottomSheet';
import { ProblemListModal } from '@/features/problemList/components/modal/ProblemListModal';
import { ProblemListsDisplay } from '@/features/problemList/components/ProblemListsDisplay';

export function ProblemListPage() {
  const navigate = useNavigate();
  const { workbookId } = useParams();

  const { problemLists, currentWorkbook, workbookName, onCreate, getProblemList } =
    useProblemListData(workbookId ?? '');
  const [openedCreateModal, setOpenedCreateModal] = useState(false);
  const [openedProblemListId, setOpenedProblemListId] = useState<string | null>(null);
  const openedProblemList = getProblemList(openedProblemListId ?? undefined);

  return (
    <>
      <TopNav title={workbookName || 'problemList'} />

      <Box p={'md'}>
        <ProblemListsDisplay
          problemLists={problemLists}
          onClick={(id) => setOpenedProblemListId(id)}
        />
      </Box>

      <ProblemListModal
        workbook={currentWorkbook}
        opened={!!openedProblemList}
        onClose={() => setOpenedProblemListId(null)}
        problemList={openedProblemList}
        onStartSession={() => {
          if (currentWorkbook && openedProblemList) {
            navigate(`/tackle/${currentWorkbook.id}/${openedProblemList.id}`);
          }
        }}
      />

      {!openedProblemList && (
        <Affix position={{ bottom: 20, right: 20 }}>
          <Transition transition="slide-up" mounted={true}>
            {(transitionStyles) => (
              <Button
                style={transitionStyles}
                leftSection={<IconPlus size={20} />}
                radius="xl"
                size="lg"
                onClick={() => setOpenedCreateModal(true)}
              >
                作成
              </Button>
            )}
          </Transition>
        </Affix>
      )}

      <CreateProblemListBottomSheet
        opened={openedCreateModal}
        onClose={() => setOpenedCreateModal(false)}
        onCreate={onCreate}
      />
    </>
  );
}

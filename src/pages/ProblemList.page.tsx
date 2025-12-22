import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { Affix, Box, Button, Transition } from '@mantine/core';
import { useProblemListData } from '@/features/data/hooks/useProblemListData';
import { TopNav } from '@/features/navigation/TopNav';
import { CreateProblemListBottomSheet } from '@/features/problemList/components/CreateProblemListBottomSheet';
import { ProblemListModal } from '@/features/problemList/components/modal/ProblemListModal';
import { ProblemListsDisplay } from '@/features/problemList/components/ProblemListsDisplay';

export function ProblemListPage() {
  const { workbookId } = useParams();

  // reloadWorkbook を取得
  const { problemLists, currentWorkbook, workbookName, onCreate, reloadWorkbook } =
    useProblemListData(workbookId ?? '');

  const [openedCreateModal, setOpenedCreateModal] = useState(false);

  // 1. オブジェクトではなく「インデックス」を管理する
  const [openedProblemListIndex, setOpenedProblemListIndex] = useState<number | null>(null);

  // 2. レンダリングのたびに、最新の problemLists からデータを取得する
  // これにより reloadWorkbook() 実行後、ここも自動的に最新データになる
  const openedProblemList =
    openedProblemListIndex !== null ? problemLists[openedProblemListIndex] : null;

  return (
    <>
      <TopNav title={workbookName || 'problemList'} />

      <Box p={'md'}>
        <ProblemListsDisplay
          problemLists={problemLists}
          // 3. クリック時にインデックスを保存するように変更
          onClick={(index) => setOpenedProblemListIndex(index)}
        />
      </Box>

      <ProblemListModal
        workbook={currentWorkbook}
        opened={!!openedProblemList}
        onClose={() => setOpenedProblemListIndex(null)}
        problemList={openedProblemList}
        reloadWorkbook={reloadWorkbook}
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

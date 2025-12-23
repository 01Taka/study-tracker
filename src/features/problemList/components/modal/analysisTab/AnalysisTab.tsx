import React, { useLayoutEffect, useRef } from 'react';
import { rem, ScrollArea } from '@mantine/core';
import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { useHistoryLookup } from '@/features/problemList/hooks/useHistoryLookup';
import { AttemptHistory, SelfEvalResultKey, UserDefinedHierarchy } from '@/shared/types/app.types';
import { HistoryMatrixTable } from './HistoryMatrixTable';

interface AnalysisTabProps {
  histories: AttemptHistory[];
  hierarchies: UserDefinedHierarchy[];
}

const RESULT_COLORS: Record<SelfEvalResultKey, string> = {
  CONFIDENT_CORRECT: '#40C057',
  CONFIDENT_WRONG: '#BE4BDB',
  UNSURE_CORRECT: '#82C91E',
  UNSURE_WRONG: '#FD7E14',
  NONE_CORRECT: '#82C91E',
  NONE_WRONG: '#FD7E14',
  UNRATED_CORRECT: '#E67E22',
  UNRATED_WRONG: '#FA5252',
};

const COL_WIDTH = rem(40); // データ列の幅
const Q_COL_WIDTH = rem(40); // 「Q」列の幅

export const AnalysisTab: React.FC<AnalysisTabProps> = ({ histories, hierarchies }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { unitRecord } = useProblemUnitData();
  const lookup = useHistoryLookup(histories, unitRecord);

  console.log(lookup);

  // 右側を最新にする（昇順ソート）
  const sortedHistories = [...histories].sort(
    (a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
  );

  // ロード時に右端へインスタントスクロール
  useLayoutEffect(() => {
    if (viewportRef.current) {
      // scrollLeft に非常に大きな値を代入することで右端へ移動
      viewportRef.current.scrollLeft = viewportRef.current.scrollWidth;
    }
  }, [sortedHistories.length]); // データ読み込み完了時にも実行

  const stickyStyle: React.CSSProperties = {
    position: 'sticky',
    left: 0,
    background: 'var(--mantine-color-body)',
    zIndex: 1,
    width: Q_COL_WIDTH,
    minWidth: Q_COL_WIDTH,
    boxShadow: '1px 0 0 var(--mantine-color-gray-3)',
  };

  return (
    <ScrollArea h={'80vh'} offsetScrollbars viewportRef={viewportRef}>
      <HistoryMatrixTable
        histories={histories}
        hierarchies={hierarchies}
        lookup={lookup}
        problemMap={{}}
      />
    </ScrollArea>
  );
};

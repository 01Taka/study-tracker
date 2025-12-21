import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useAttemptHistory } from '@/features/data/hooks/useAttemptHistory';
import { useProblemListData } from '@/features/data/hooks/useProblemListData';
import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { UnitAttemptUserAnswers } from '@/shared/types/app.types';

// 修正された型定義
interface AnswerValues {
  answers: {
    [unitPath: string]: UnitAttemptUserAnswers;
  };
}

export const useTackleForm = (workbookId: string, problemListId: string) => {
  const navigate = useNavigate();
  const { getProblemList } = useProblemListData(workbookId);
  const { getProblemUnits, unitRecord } = useProblemUnitData();
  const { activeSession, endSession } = useAttemptHistory();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const problemList = getProblemList(problemListId);

  // 現在のタブに基づいたユニット情報の取得
  const currentHierarchy = problemList?.hierarchies.find((h) => h.id === activeTab);
  const units = currentHierarchy ? getProblemUnits(currentHierarchy.unitVersionPaths) : [];

  // フォームの初期値計算
  const initialAnswers = useMemo(() => {
    if (!problemList) return {};
    const obj: AnswerValues['answers'] = {};

    problemList.hierarchies.forEach((h) => {
      // 全階層のユニットを事前に取得して初期値を生成
      const allUnitsInHierarchy = getProblemUnits(h.unitVersionPaths);

      allUnitsInHierarchy.forEach((unit) => {
        // unit.answers の数だけ回答欄を初期化
        const answerMap: Record<string, string> = {};
        unit.answers.forEach((_, index) => {
          answerMap[index.toString()] = '';
        });

        obj[unit.unitId] = {
          answers: answerMap,
          selfEval: 'UNRATED',
        };
      });
    });
    return obj;
  }, [problemList, getProblemUnits]);

  const form = useForm<AnswerValues>({
    initialValues: { answers: {} },
  });

  // 2. データロード後の初期値セット
  useEffect(() => {
    if (Object.keys(initialAnswers).length > 0 && Object.keys(form.values.answers).length === 0) {
      form.setValues({ answers: initialAnswers });
    }
  }, [initialAnswers, form]);

  // デフォルトタブ設定
  useEffect(() => {
    if (problemList?.hierarchies.length && !activeTab) {
      setActiveTab(problemList.hierarchies[0].id);
    }
  }, [problemList, activeTab]);

  const handleSubmit = useCallback(
    (values: typeof form.values) => {
      console.log(activeSession);

      if (activeSession?.id) {
        endSession(values.answers, Object.values(unitRecord));
        navigate(`/result/${activeSession.id}`);
      }
    },
    [activeSession, endSession]
  );

  return {
    problemList,
    activeTab,
    setActiveTab,
    form,
    units,
    isLoading: !problemList,
    handleSubmit,
  };
};

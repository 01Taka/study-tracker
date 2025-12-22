import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { useAttemptHistory } from '@/features/data/hooks/useAttemptHistory';
import { useProblemListData } from '@/features/data/hooks/useProblemListData';
import { useProblemUnitData } from '@/features/data/hooks/useProblemUnitData';
import { UnitAttemptUserAnswers, UserDefinedHierarchy } from '@/shared/types/app.types';

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
  const units = currentHierarchy
    ? getProblemUnits(currentHierarchy.unitVersionPaths, activeSession?.attemptingUnitIds ?? [])
    : [];

  // フォームの初期値計算
  const initialAnswers = useMemo(() => {
    if (!problemList || !activeSession) return {};
    const obj: AnswerValues['answers'] = {};

    problemList.hierarchies.forEach((h) => {
      // 全階層のユニットを事前に取得して初期値を生成
      const allUnitsInHierarchy = getProblemUnits(
        h.unitVersionPaths,
        activeSession.attemptingUnitIds
      );

      allUnitsInHierarchy.forEach((unit) => {
        // unit.answers の数だけ回答欄を初期化
        const answerMap: Record<number, string> = {};
        unit.problems.forEach((problem) => {
          answerMap[problem.problemNumber] = '';
        });

        obj[unit.unitId] = {
          answers: answerMap,
          selfEval: 'UNRATED',
        };
      });
    });
    return obj;
  }, [problemList, activeSession, getProblemUnits]);

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
      if (activeSession?.id) {
        const success = endSession(values.answers, Object.values(unitRecord));
        if (success) {
          navigate(`/result/${activeSession.id}`);
        }
      }
    },
    [activeSession, endSession]
  );

  const filteredHierarchies: UserDefinedHierarchy[] = useMemo(() => {
    if (!problemList || !activeSession) return [];
    return problemList.hierarchies.map((hierarchy) => {
      const paths = hierarchy.unitVersionPaths.filter((path) =>
        activeSession.attemptingUnitIds.includes(path)
      );
      return {
        ...hierarchy,
        unitVersionPaths: paths,
      };
    });
  }, [problemList, activeSession]);

  return {
    problemList,
    activeTab,
    setActiveTab,
    form,
    units,
    isLoading: !problemList,
    filteredHierarchies,
    handleSubmit,
  };
};

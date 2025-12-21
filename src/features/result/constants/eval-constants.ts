import {
  IconAlertCircle,
  IconCheck,
  IconChecks,
  IconProps,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { SelfEvalResultKey } from '@/shared/types/app.types';

/** 各状態の配色定義 */
type ColorTheme = {
  bg: string; // 背景色
  border: string; // ボーダー（PaperやBadgeの外枠）
  accent: string; // アクセント（Badgeの背景や強調線）
  text: string; // 文字色
};

type EvalDisplaySetting = {
  label: string;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  colors: ColorTheme;
};

const THEMES: Record<string, ColorTheme> = {
  // 正解ベース（背景：緑）
  SUCCESS: { bg: '#E8F5E9', border: '#4CAF50', accent: '#4CAF50', text: '#2E7D32' },
  // 自信なしで正解（背景：緑だが、枠線やバッジを注意のオレンジ/赤にする）
  SUCCESS_WAIT: { bg: '#E8F5E9', border: '#FF9800', accent: '#FF9800', text: '#2E7D32' },

  // 不正解ベース（背景：赤）
  DANGER: { bg: '#FFEBEE', border: '#F44336', accent: '#F44336', text: '#C62828' },
  // 自信ありで不正解（背景：赤だが、枠線やバッジを「驚き・注意」の青にする）
  DANGER_ALERT: { bg: '#FFEBEE', border: '#2196F3', accent: '#2196F3', text: '#C62828' },
} as const;

export const EVAL_DISPLAY_CONFIG: Record<SelfEvalResultKey, EvalDisplaySetting> = {
  // ■ 背景：緑（SUCCESS）
  CONFIDENT_CORRECT: { label: '正解', icon: IconChecks, colors: THEMES.SUCCESS },
  UNSURE_CORRECT: { label: '正解', icon: IconCheck, colors: THEMES.SUCCESS },
  UNRATED_CORRECT: { label: '正解', icon: IconCheck, colors: THEMES.SUCCESS },
  // 正解だけど背景以外（ボーダー等）で「要確認」を出す
  NONE_CORRECT: { label: '要復習', icon: IconRefresh, colors: THEMES.SUCCESS_WAIT },

  // ■ 背景：赤（DANGER）
  // 不正解だけどボーダー等で「要注意（青）」を出す
  CONFIDENT_WRONG: { label: '要注意', icon: IconAlertCircle, colors: THEMES.DANGER_ALERT },

  NONE_WRONG: { label: '要復習', icon: IconX, colors: THEMES.DANGER },
  UNSURE_WRONG: { label: '不正解', icon: IconRefresh, colors: THEMES.DANGER },
  UNRATED_WRONG: { label: '不正解', icon: IconX, colors: THEMES.DANGER },
};

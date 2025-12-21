import { IconCheck, IconMinus, IconQuestionMark, IconX } from '@tabler/icons-react';

/**
 * 自己評価のマスター設定
 * スタイルに関する値もすべてここに集約します
 */
export const EVAL_BASE_CONFIG = {
  CONFIDENT: {
    value: 'CONFIDENT' as const,
    label: '自信あり',
    color: 'teal', // 鮮やかな青緑。安心感と成功をイメージ
    icon: IconCheck,
    activeOpacity: 1,
    activeFw: 700,
  },
  UNSURE: {
    value: 'UNSURE' as const,
    label: 'びみょう',
    color: 'yellow.7', // 濃い黄色。赤と混ぜても判別しやすい
    icon: IconQuestionMark,
    activeOpacity: 1,
    activeFw: 700,
  },
  NONE: {
    value: 'NONE' as const,
    label: '自信なし',
    color: 'pink.7', // 真っ赤よりも少しマゼンタに寄せることで、黄色との差を強調
    icon: IconX,
    activeOpacity: 1,
    activeFw: 700,
  },
  // 未選択状態のスタイル定義
  UNRATED: {
    value: 'UNRATED' as const,
    label: '未選択', // 必要に応じて
    color: 'gray',
    icon: IconMinus,
    opacity: 0.5,
    fw: 400,
    bgColor: 'gray.0',
    borderColor: 'gray.3',
  },
} as const;

// 1. UIのボタンとして並べる配列（UNSELECTEDを除外して抽出）
export const SELF_EVAL_OPTIONS = [
  EVAL_BASE_CONFIG.CONFIDENT,
  EVAL_BASE_CONFIG.UNSURE,
  EVAL_BASE_CONFIG.NONE,
];

// 2. 未選択時のスタイルを単体でエクスポート
export const UNSELECTED_STYLE = EVAL_BASE_CONFIG.UNRATED;

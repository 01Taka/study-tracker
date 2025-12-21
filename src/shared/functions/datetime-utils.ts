/**
 * 2つのミリ秒(ms)の差が何日分かを算出する
 * @param ms1 1つ目の時間（ミリ秒）
 * @param ms2 2つ目の時間（ミリ秒）
 * @param absolute 絶対値で返すかどうか（デフォルトはtrue）
 * @returns 日数（小数点含む）
 */
export const getDiffDays = (ms1: number, ms2: number, absolute: boolean = true): number => {
  const diffMs = absolute ? Math.abs(ms1 - ms2) : ms1 - ms2;

  // 1日のミリ秒数 = 24時間 * 60分 * 60秒 * 1000ミリ秒
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  return diffMs / ONE_DAY_MS;
};

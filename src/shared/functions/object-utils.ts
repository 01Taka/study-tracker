/**
 * オブジェクトの配列を指定されたフィールドの値に基づいてRecord (プレーンなJSオブジェクト) に変換します。
 * キーとなるフィールドの値が重複している場合、最初に見つかった要素がRecordの値として採用されます。
 * * 元のキーフィールドの値が number や symbol であっても、Recordのキーは常に string に統一されます。
 *
 * @template T オブジェクトの型
 * @param {T[]} array 変換するオブジェクトの配列
 * @param {keyof T} keyField Recordのキーとして使用するフィールド名
 * @returns {Record<string, T>} キーは指定されたフィールドの値の文字列、値は最初に見つかった元のオブジェクト
 */
export function safeArrayToRecord<T extends object>(
  array: T[],
  keyField: keyof T
): Record<string, T> {
  // 戻り値の型を Record<string, T> に合わせるため、Partial<Record<string, T>> を使用
  const resultRecord: Partial<Record<string, T>> = {};

  for (const item of array) {
    // 1. キーフィールドの値を取得 (string | number | symbol など)
    const keyValue = item[keyField];

    // 2. Recordのキーとして使用するために、値を必ず string に変換
    //    null や undefined の可能性を考慮し、安全に文字列化する
    const recordKey = String(keyValue);

    // 3. キーがまだRecordに存在しない場合のみ追加（最初に見つかった要素を保持する）
    if (!(recordKey in resultRecord)) {
      resultRecord[recordKey] = item;
    }

    // キーが既に存在する場合は何もしない (最初に見つかった値が維持される)
  }

  // 4. Partialを外し、完全な Record<string, T> 型として返す
  return resultRecord as Record<string, T>;
}

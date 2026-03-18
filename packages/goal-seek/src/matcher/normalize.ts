/** Manabie固有の同義語マップ（日→英） */
const SYNONYM_MAP: Record<string, string> = {
  '生徒': 'student',
  '生徒名': 'student name',
  '保護者': 'parent',
  '保護者名': 'parent name',
  '請求': 'invoice',
  '請求書': 'invoice',
  '支払': 'payment',
  '支払い': 'payment',
  '入金': 'payment',
  '科目': 'course',
  'コース': 'course',
  '授業': 'lesson',
  'レッスン': 'lesson',
  '教室': 'class',
  'クラス': 'class',
  '金額': 'amount',
  '単価': 'unit price',
  '合計': 'total',
  '合計金額': 'total amount',
  '小計': 'subtotal',
  '税額': 'tax amount',
  '税': 'tax',
  '日付': 'date',
  '作成日': 'created date',
  '更新日': 'last modified date',
  '名前': 'name',
  '氏名': 'name',
  'メール': 'email',
  'メールアドレス': 'email',
  '電話': 'phone',
  '電話番号': 'phone',
  '住所': 'address',
  '状態': 'status',
  'ステータス': 'status',
  '備考': 'description',
  '説明': 'description',
  '開始日': 'start date',
  '終了日': 'end date',
  '期間': 'period',
  '月': 'month',
  '年': 'year',
  '受講': 'enrollment',
  '入学': 'enrollment',
  '退学': 'withdrawal',
  '成績': 'score',
  '点数': 'score',
  '試験': 'exam',
  'テスト': 'exam',
  '出席': 'attendance',
  '欠席': 'absence',
  '勤怠': 'timesheet',
  '給与': 'payrate',
  '未収金': 'outstanding amount',
  '売上': 'revenue',
  '割引': 'discount',
  '返金': 'refund',
};

/** 全角→半角変換 */
function toHalfWidth(str: string): string {
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    )
    .replace(/　/g, ' ');
}

/** カタカナ→ひらがな変換 */
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/** MANAERP__プレフィックスと__cサフィックスを除去 */
function stripNamespace(str: string): string {
  return str
    .replace(/^MANAERP__/i, '')
    .replace(/__c$/i, '')
    .replace(/__r$/i, '');
}

/** アンダースコア/ハイフン/スペースで分割してlower join */
function splitAndLower(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase split
    .replace(/[_\-\.]/g, ' ')
    .toLowerCase()
    .trim();
}

/**
 * 入力文字列を正規化する
 * 全角半角変換 → カタカナ→ひらがな → 名前空間除去 → lowercase
 */
export function normalize(input: string): string {
  let s = input.trim();
  s = toHalfWidth(s);
  s = katakanaToHiragana(s);
  s = stripNamespace(s);
  s = splitAndLower(s);
  return s;
}

/**
 * 同義語マップで日本語→英語に変換を試みる
 * マッチしなければ元のnormalized文字列を返す
 */
export function applySynonyms(normalized: string): string[] {
  const results = [normalized];
  const synonym = SYNONYM_MAP[normalized];
  if (synonym) {
    results.push(synonym);
  }
  // 部分マッチも試行
  for (const [jp, en] of Object.entries(SYNONYM_MAP)) {
    if (normalized.includes(jp) && !results.includes(en)) {
      results.push(normalized.replace(jp, en));
    }
  }
  return results;
}

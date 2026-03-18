import type { AggregationPattern, MatchResult } from '@sf-report-tools/types';

/**
 * サンプルデータからグルーピング/小計/クロス集計パターンを検出
 */
export function detectAggregationPatterns(
  matches: MatchResult[],
  sampleRows: string[][]
): AggregationPattern[] {
  const patterns: AggregationPattern[] = [];

  for (let colIdx = 0; colIdx < matches.length; colIdx++) {
    const match = matches[colIdx];
    const columnValues = sampleRows.map((row) => row[colIdx] ?? '');

    // グルーピング候補: 同値が複数行にまたがるテキスト列
    if (isGroupingCandidate(columnValues)) {
      patterns.push({
        type: 'grouping',
        target_column: match.csv_column,
        detail: `「${match.csv_column}」でグルーピングすると集計が可能です。`,
      });
    }

    // 集計数式候補: 計算列として検出されたもの
    if (match.match_type === 'computed' && match.suggestion) {
      patterns.push({
        type: 'formula',
        target_column: match.csv_column,
        detail: match.suggestion,
      });
    }

    // PREVGROUPVAL候補: 列名に前月比/前年比を含む
    const colLower = match.csv_column.toLowerCase();
    if (
      colLower.includes('前月') ||
      colLower.includes('前年') ||
      colLower.includes('yoy') ||
      colLower.includes('mom')
    ) {
      patterns.push({
        type: 'prevgroupval',
        target_column: match.csv_column,
        detail: 'PREVGROUPVAL関数で前の期間グループ値を参照できます。',
      });
    }
  }

  // クロス集計パターン: 2つ以上のグルーピング候補がある場合
  const groupings = patterns.filter((p) => p.type === 'grouping');
  if (groupings.length >= 2) {
    patterns.push({
      type: 'bucket',
      target_column: groupings.map((g) => g.target_column).join(' x '),
      detail:
        'Matrixレポートで行グループと列グループを設定してクロス集計が可能です。',
    });
  }

  return patterns;
}

/** グルーピング候補かどうか判定 */
function isGroupingCandidate(
  values: string[]
): boolean {
  if (values.length < 3) return false;

  // 数値列はグルーピング対象外（集計対象）
  const numericCount = values.filter((v) => v !== '' && !isNaN(Number(v))).length;
  if (numericCount > values.length * 0.7) return false;

  // 同値の繰り返し率をチェック
  const unique = new Set(values.filter((v) => v !== ''));
  if (unique.size === 0) return false;

  const repetitionRate = 1 - unique.size / values.length;
  return repetitionRate >= 0.3; // 30%以上の重複があればグルーピング候補
}

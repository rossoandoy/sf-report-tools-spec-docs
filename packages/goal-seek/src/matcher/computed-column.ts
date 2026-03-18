import type { MatchResult } from '@sf-report-tools/types';

/** 計算列を示唆するパターン */
const COMPUTED_PATTERNS: Array<{
  keywords: string[];
  suggestion: string;
}> = [
  {
    keywords: ['未収金', '未収', 'outstanding', 'balance'],
    suggestion: 'SF集計数式: 請求金額 - 入金済金額。Summary/Matrixレポートで集計数式を使用。',
  },
  {
    keywords: ['差額', 'difference', 'diff', '差分'],
    suggestion: 'SF集計数式で2つの金額列の差分を計算。',
  },
  {
    keywords: ['率', 'rate', 'ratio', '割合', 'percentage', '%'],
    suggestion: 'SF集計数式: (A / B * 100)。割合は集計数式で実現。',
  },
  {
    keywords: ['前月比', '前年比', 'yoy', 'mom', '前期比'],
    suggestion: 'PREVGROUPVAL関数を使用して前の期間グループの値を参照。',
  },
  {
    keywords: ['累計', 'cumulative', 'running total', '累積'],
    suggestion: 'Matrixレポートで「実行時合計」を使用。',
  },
  {
    keywords: ['平均', 'average', 'avg'],
    suggestion: 'Summaryレポートのグルーピング集計で「平均」を選択。',
  },
  {
    keywords: ['件数', 'count', 'カウント', '数'],
    suggestion: 'レコード件数はレポートの標準集計（Record Count）で取得可能。',
  },
];

/**
 * CSVヘッダーが計算列パターンに該当するか判定
 */
export function detectComputedColumn(csvColumn: string): MatchResult | null {
  const lower = csvColumn.toLowerCase();

  for (const pattern of COMPUTED_PATTERNS) {
    const matched = pattern.keywords.some(
      (kw) => lower.includes(kw) || csvColumn.includes(kw)
    );

    if (matched) {
      return {
        csv_column: csvColumn,
        matched_field: null,
        matched_object: null,
        confidence: 0.7,
        match_type: 'computed',
        suggestion: pattern.suggestion,
      };
    }
  }

  return null;
}

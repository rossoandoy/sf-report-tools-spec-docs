import type { AggregationPattern } from '@sf-report-tools/types';

interface Props {
  patterns: AggregationPattern[];
}

const ICON_MAP: Record<string, string> = {
  grouping: '\u{1F4CA}',
  bucket: '\u{1F5C2}',
  cross_filter: '\u{1F50D}',
  formula: '\u{1F9EE}',
  prevgroupval: '\u{23EA}',
};

const LABEL_MAP: Record<string, string> = {
  grouping: 'グルーピング',
  bucket: 'クロス集計',
  cross_filter: 'クロスフィルタ',
  formula: '集計数式',
  prevgroupval: '前グループ参照',
};

export function AggregationList({ patterns }: Props) {
  if (patterns.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
        検出された集計パターンはありません。
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="font-semibold text-gray-900">集計パターン</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {patterns.map((p, i) => (
          <li key={i} className="flex items-start gap-3 px-4 py-3">
            <span className="text-xl">{ICON_MAP[p.type] ?? '\u2699'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {LABEL_MAP[p.type] ?? p.type}
                </span>
                <span className="text-xs text-gray-500">
                  {p.target_column}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-gray-600">{p.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

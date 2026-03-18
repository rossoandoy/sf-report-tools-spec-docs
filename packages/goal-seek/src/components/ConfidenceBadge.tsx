import type { MatchType } from '@sf-report-tools/types';

interface Props {
  confidence: number;
  matchType: MatchType;
}

export function ConfidenceBadge({ confidence, matchType }: Props) {
  const pct = Math.round(confidence * 100);

  const colorClass =
    matchType === 'unmapped'
      ? 'bg-gray-100 text-gray-600'
      : matchType === 'computed'
        ? 'bg-purple-100 text-purple-700'
        : pct >= 90
          ? 'bg-green-100 text-green-700'
          : pct >= 70
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700';

  const label =
    matchType === 'unmapped'
      ? '未マッチ'
      : matchType === 'computed'
        ? '計算列'
        : `${pct}%`;

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {label}
    </span>
  );
}

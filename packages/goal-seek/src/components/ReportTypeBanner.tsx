import type { ReportTypeRecommendation } from '@sf-report-tools/types';

interface Props {
  recommendation: ReportTypeRecommendation;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  standard: { label: '標準レポートタイプ', color: 'bg-green-50 border-green-200 text-green-800' },
  custom: { label: 'カスタムレポートタイプ', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  joined: { label: '結合レポート', color: 'bg-amber-50 border-amber-200 text-amber-800' },
};

export function ReportTypeBanner({ recommendation }: Props) {
  const config = TYPE_CONFIG[recommendation.type];

  return (
    <div className={`rounded-xl border p-4 ${config.color}`}>
      <div className="mb-1 text-lg font-bold">{config.label}</div>
      <p className="text-sm">{recommendation.reason}</p>
      {recommendation.definition && (
        <div className="mt-3 rounded-lg bg-white/60 p-3 text-sm">
          <div>
            <span className="font-medium">主オブジェクト: </span>
            {recommendation.definition.primary}
          </div>
          {recommendation.definition.related.length > 0 && (
            <div className="mt-1">
              <span className="font-medium">関連オブジェクト: </span>
              {recommendation.definition.related.map((r, i) => (
                <span key={r}>
                  {i > 0 && ', '}
                  {r}
                  <span className="text-xs text-gray-500">
                    {' '}
                    ({recommendation.definition!.join_types[r]})
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

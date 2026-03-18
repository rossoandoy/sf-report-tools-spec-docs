import { useCallback } from 'react';
import { ReportTypeBanner } from '../components/ReportTypeBanner';
import { AggregationList } from '../components/AggregationList';
import { useGoalSeek, useGoalSeekDispatch } from '../context/GoalSeekContext';

export function ResultPage() {
  const { analysis, matches, schema } = useGoalSeek();
  const dispatch = useGoalSeekDispatch();

  const handleBack = useCallback(() => {
    dispatch({ type: 'SET_STEP', step: 'matching' });
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  if (!analysis || !schema) return null;

  // マッチ済みフィールド一覧をオブジェクト別にグループ化
  const objectFields = new Map<string, Array<{ label: string; csvColumn: string }>>();
  for (const m of matches) {
    if (m.matched_object && m.matched_field) {
      const list = objectFields.get(m.matched_object) ?? [];
      list.push({ label: m.matched_field.label, csvColumn: m.csv_column });
      objectFields.set(m.matched_object, list);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">分析結果</h2>
      </div>

      {/* レポートタイプ */}
      <ReportTypeBanner recommendation={analysis.reportType} />

      {/* 使用オブジェクトとフィールド */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="font-semibold text-gray-900">
            使用オブジェクト ({analysis.usedObjects.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {analysis.usedObjects.map((objName) => {
            const obj = schema[objName];
            const fields = objectFields.get(objName) ?? [];
            return (
              <div key={objName} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {obj?.name ?? objName}
                  </span>
                  <span className="text-xs text-gray-400">{objName}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {fields.map((f) => (
                    <span
                      key={f.csvColumn}
                      className="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                    >
                      {f.label}
                      <span className="ml-1 text-blue-400">
                        ← {f.csvColumn}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 集計パターン */}
      <AggregationList patterns={analysis.aggregationPatterns} />

      {/* 未マッチ列 */}
      {matches.some((m) => m.match_type === 'unmapped') && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 font-semibold text-amber-800">
            未マッチの列
          </h3>
          <ul className="space-y-1 text-sm text-amber-700">
            {matches
              .filter((m) => m.match_type === 'unmapped')
              .map((m) => (
                <li key={m.csv_column}>
                  ・{m.csv_column}
                  <span className="text-amber-500">
                    {' '}
                    — 手動でフィールドを割り当てるか、計算列として集計数式で実現してください。
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          マッチングに戻る
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          新しいファイルを分析
        </button>
      </div>
    </div>
  );
}

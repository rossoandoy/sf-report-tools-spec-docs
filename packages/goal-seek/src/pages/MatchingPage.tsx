import { useCallback } from 'react';
import type { ManabiField } from '@sf-report-tools/types';
import { MatchTable } from '../components/MatchTable';
import { useGoalSeek, useGoalSeekDispatch } from '../context/GoalSeekContext';
import { analyzeStructure } from '../analyzer';

export function MatchingPage() {
  const { matches, schema, parsedData, fileName } = useGoalSeek();
  const dispatch = useGoalSeekDispatch();

  const handleUpdate = useCallback(
    (index: number, objectApiName: string, field: ManabiField) => {
      dispatch({
        type: 'UPDATE_MATCH',
        index,
        match: {
          csv_column: matches[index].csv_column,
          matched_field: field,
          matched_object: objectApiName,
          confidence: 1.0,
          match_type: 'exact',
        },
      });
    },
    [dispatch, matches]
  );

  const handleAnalyze = useCallback(() => {
    if (!schema || !parsedData) return;
    const analysis = analyzeStructure(matches, parsedData.sampleRows, schema);
    dispatch({ type: 'SET_ANALYSIS', analysis });
  }, [schema, parsedData, matches, dispatch]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  if (!schema) return null;

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">マッチング確認</h2>
          {fileName && (
            <p className="text-sm text-gray-500">
              ファイル: {fileName}
              {parsedData && ` (${parsedData.totalRows} 行)`}
            </p>
          )}
        </div>
      </div>

      <MatchTable matches={matches} schema={schema} onUpdate={handleUpdate} />

      {parsedData && parsedData.sampleRows.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              サンプルデータ（先頭{parsedData.sampleRows.length}行）
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {parsedData.headers.map((h, i) => (
                    <th
                      key={i}
                      className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-gray-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.sampleRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-50">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="whitespace-nowrap px-3 py-1.5 text-gray-700"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={handleBack}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          やり直す
        </button>
        <button
          onClick={handleAnalyze}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          分析を実行
        </button>
      </div>
    </div>
  );
}

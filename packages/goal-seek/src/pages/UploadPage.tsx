import { useCallback } from 'react';
import { FileDropZone } from '../components/FileDropZone';
import { useGoalSeek, useGoalSeekDispatch } from '../context/GoalSeekContext';
import { parseFile } from '../parser';
import { runMatching } from '../matcher';

export function UploadPage() {
  const { schema, loading, error } = useGoalSeek();
  const dispatch = useGoalSeekDispatch();

  const handleFile = useCallback(
    async (file: File) => {
      if (!schema) return;

      dispatch({ type: 'SET_LOADING', loading: true });

      try {
        const data = await parseFile(file);
        dispatch({ type: 'SET_PARSED', fileName: file.name, data });

        if (data.headers.length === 0) {
          dispatch({ type: 'SET_ERROR', error: 'ヘッダー行が見つかりませんでした。' });
          return;
        }

        // 自動マッチング実行
        const matches = runMatching(data.headers, schema);
        dispatch({ type: 'SET_MATCHES', matches });
      } catch (e) {
        dispatch({
          type: 'SET_ERROR',
          error: e instanceof Error ? e.message : 'ファイルの読み込みに失敗しました。',
        });
      }
    },
    [schema, dispatch]
  );

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          欲しい出力のファイルをアップロード
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          CSV/Excel ファイルをアップロードすると、Manabie ERP のどのフィールドに
          対応するかを自動で分析し、Salesforceレポートの設定方法を提案します。
        </p>
      </div>

      <FileDropZone onFile={handleFile} disabled={!schema || loading} />

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-500">
          解析中...
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!schema && (
        <div className="mt-4 text-center text-sm text-gray-500">
          スキーマデータを読み込み中...
        </div>
      )}
    </div>
  );
}

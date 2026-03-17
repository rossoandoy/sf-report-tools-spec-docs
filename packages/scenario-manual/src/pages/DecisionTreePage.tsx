import { useState, useCallback } from 'react';
import type { DecisionTreeNode } from '@sf-report-tools/types';
import { useData } from '../context/DataContext';
import { useRouter } from '../components/HashRouter';

export function DecisionTreePage() {
  const { knowledge } = useData();
  const { navigate } = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const dt = knowledge?.decision_tree;

  const reset = useCallback(() => {
    setHistory([]);
    setCurrentId(null);
  }, []);

  if (!dt) return null;

  const nodes = dt.nodes as DecisionTreeNode[];
  const outcomes = dt.outcomes as Record<string, string>;
  const activeId = currentId ?? dt.start;

  const currentNode = nodes.find((n) => n.id === activeId);
  const isOutcome = activeId in outcomes;

  const answer = (direction: 'yes' | 'no') => {
    if (!currentNode) return;
    const nextId = direction === 'yes' ? currentNode.yes : currentNode.no;
    setHistory((prev) => [...prev, activeId]);
    setCurrentId(nextId);
  };

  const goBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentId(prev);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/')} className="hover:text-blue-600">トップ</button>
        <span className="mx-1">/</span>
        <span>レポートタイプ選択フロー</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        レポートタイプ選択フロー
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        質問に答えていくと、最適なレポートタイプが分かります
      </p>

      {/* Progress */}
      {history.length > 0 && (
        <div className="mb-4 space-y-2">
          {history.map((hId, i) => {
            const hNode = nodes.find((n) => n.id === hId);
            if (!hNode) return null;
            const wasYes =
              i + 1 < history.length
                ? hNode.yes === history[i + 1]
                : hNode.yes === activeId;
            return (
              <div key={hId} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="shrink-0 mt-0.5">Q{i + 1}.</span>
                <span>{hNode.question}</span>
                <span className={`shrink-0 font-medium ${wasYes ? 'text-green-600' : 'text-red-500'}`}>
                  → {wasYes ? 'はい' : 'いいえ'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Current question or outcome */}
      {isOutcome ? (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center">
          <div className="text-green-600 text-3xl mb-3">✓</div>
          <h2 className="text-lg font-bold text-green-900 mb-2">推奨結果</h2>
          <p className="text-green-800">{outcomes[activeId]}</p>

          <div className="mt-6 flex gap-3 justify-center">
            <button
              onClick={goBack}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← 戻る
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
            >
              最初からやり直す
            </button>
          </div>
        </div>
      ) : currentNode ? (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
          <p className="text-xs text-gray-400 mb-1">Q{history.length + 1}</p>
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            {currentNode.question}
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => answer('yes')}
              className="flex-1 py-3 px-4 text-sm font-medium text-green-700 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              はい
            </button>
            <button
              onClick={() => answer('no')}
              className="flex-1 py-3 px-4 text-sm font-medium text-red-700 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              いいえ
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={goBack}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              ← 前の質問に戻る
            </button>
          )}
        </div>
      ) : null}

      {/* Back to top */}
      <div className="mt-8">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm">
          ← シナリオ一覧に戻る
        </button>
      </div>
    </div>
  );
}

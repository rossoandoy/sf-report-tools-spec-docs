import { useMemo } from 'react';
import { findLookupChain } from '@sf-report-tools/utils';
import type { LookupPath } from '@sf-report-tools/utils';
import { useSchema } from '../context/SchemaContext';

/**
 * 選択中オブジェクトの2ホップ以内のLookupチェーンをUI表示
 * グラフへのハイライト反映は dispatch({ type: 'SET_CHAIN' }) 経由
 */
export function LookupChainHighlight() {
  const { state, dispatch } = useSchema();
  const { schema, selectedObject } = state;

  const chains = useMemo(() => {
    if (!schema || !selectedObject) return [];

    const results: Array<{ target: string; targetName: string; path: LookupPath }> = [];
    const checked = new Set<string>([selectedObject]);

    for (const key of Object.keys(schema)) {
      if (checked.has(key)) continue;
      const path = findLookupChain(schema, selectedObject, key, 2);
      if (path) {
        checked.add(key);
        results.push({
          target: key,
          targetName: schema[key].name,
          path,
        });
      }
    }
    return results.sort((a, b) => a.path.length - b.path.length);
  }, [schema, selectedObject]);

  if (!selectedObject || chains.length === 0) return null;

  return (
    <section className="mt-3 border-t border-gray-200 pt-3">
      <h3 className="text-sm font-semibold mb-1 text-gray-700">
        Lookupチェーン（2ホップ以内: {chains.length}件）
      </h3>
      <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
        {chains.map((c) => {
          const isActive =
            state.highlightedChain?.objects.join(',') === c.path.objects.join(',');
          return (
            <li key={c.target}>
              <button
                className={`text-left w-full px-1 py-0.5 rounded hover:bg-amber-50 ${isActive ? 'bg-amber-100' : ''}`}
                onClick={() =>
                  dispatch({ type: 'SET_CHAIN', chain: isActive ? null : c.path })
                }
              >
                {c.path.objects.map((o, i) => (
                  <span key={o}>
                    {i > 0 && <span className="text-gray-400 mx-0.5">→</span>}
                    <span className={o === selectedObject ? 'font-bold' : ''}>
                      {schema![o]?.name ?? o}
                    </span>
                  </span>
                ))}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

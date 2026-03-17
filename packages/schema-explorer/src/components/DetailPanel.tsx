import { useMemo } from 'react';
import type { ManabiObject, LookupRelation } from '@sf-report-tools/types';
import { DOMAIN_COLORS, DOMAIN_LABELS } from '@sf-report-tools/types';
import { findLookupChain } from '@sf-report-tools/utils';
import { useSchema } from '../context/SchemaContext';
import { LookupChainHighlight } from './LookupChainHighlight';

export function DetailPanel() {
  const { state, dispatch } = useSchema();
  const { schema, selectedObject } = state;

  const obj: ManabiObject | null = useMemo(() => {
    if (!schema || !selectedObject) return null;
    return schema[selectedObject] ?? null;
  }, [schema, selectedObject]);

  // Reverse lookups: objects pointing TO this object
  const incomingLookups: Array<{ source: string; sourceName: string; field: string; type: LookupRelation['type'] }> = useMemo(() => {
    if (!schema || !selectedObject) return [];
    const results: Array<{ source: string; sourceName: string; field: string; type: LookupRelation['type'] }> = [];
    for (const o of Object.values(schema)) {
      for (const lk of o.lookups) {
        if (lk.target === selectedObject) {
          results.push({ source: o.api_name, sourceName: o.name, field: lk.field, type: lk.type });
        }
      }
    }
    return results;
  }, [schema, selectedObject]);

  // Reachable objects within 3 hops for report hint
  const reachableObjects = useMemo(() => {
    if (!schema || !selectedObject) return [];
    const results: Array<{ apiName: string; name: string; hops: number; needsCustomType: boolean }> = [];
    const checked = new Set<string>([selectedObject]);

    for (const targetKey of Object.keys(schema)) {
      if (checked.has(targetKey)) continue;
      const path = findLookupChain(schema, selectedObject, targetKey, 3);
      if (path) {
        checked.add(targetKey);
        results.push({
          apiName: targetKey,
          name: schema[targetKey].name,
          hops: path.length,
          needsCustomType: path.length > 1,
        });
      }
    }
    return results.sort((a, b) => a.hops - b.hops);
  }, [schema, selectedObject]);

  if (!obj) return null;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: DOMAIN_COLORS[obj.domain] }}
            />
            <h2 className="text-base font-bold">{obj.name}</h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{obj.api_name}</p>
          <span
            className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 text-white"
            style={{ backgroundColor: DOMAIN_COLORS[obj.domain] }}
          >
            {DOMAIN_LABELS[obj.domain]}
          </span>
        </div>
        <button
          className="text-gray-400 hover:text-gray-600 text-lg"
          onClick={() => dispatch({ type: 'SELECT_OBJECT', apiName: null })}
        >
          ×
        </button>
      </div>

      {/* Fields */}
      <section className="mb-4">
        <h3 className="text-sm font-semibold mb-1 text-gray-700">
          項目一覧 ({obj.fields.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="py-1 pr-2">ラベル</th>
                <th className="py-1 pr-2">API名</th>
                <th className="py-1 pr-2">型</th>
                <th className="py-1">必須</th>
              </tr>
            </thead>
            <tbody>
              {obj.fields.map((field) => {
                const shortApiName = field.api_name.includes('.')
                  ? field.api_name.split('.').pop()!
                  : field.api_name;
                const isLookup = field.type === 'Lookup' || field.type === 'MasterDetail';
                return (
                  <tr key={field.api_name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-1 pr-2">{field.label}</td>
                    <td className="py-1 pr-2 text-gray-400 font-mono">{shortApiName}</td>
                    <td className="py-1 pr-2">
                      {isLookup && field.referenceTo ? (
                        <button
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={() =>
                            dispatch({ type: 'SELECT_OBJECT', apiName: field.referenceTo! })
                          }
                        >
                          {field.type} → {schema![field.referenceTo]?.name ?? field.referenceTo}
                        </button>
                      ) : (
                        field.type
                      )}
                    </td>
                    <td className="py-1">
                      {field.required && (
                        <span className="text-red-500 font-bold">*</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Incoming Lookups */}
      {incomingLookups.length > 0 && (
        <section className="mb-4">
          <h3 className="text-sm font-semibold mb-1 text-gray-700">
            参照元オブジェクト ({incomingLookups.length})
          </h3>
          <ul className="text-xs space-y-1">
            {incomingLookups.map((lk) => (
              <li key={`${lk.source}.${lk.field}`} className="flex items-center gap-1">
                <span
                  className={`px-1 rounded text-white text-[10px] ${lk.type === 'MasterDetail' ? 'bg-red-500' : 'bg-blue-500'}`}
                >
                  {lk.type === 'MasterDetail' ? 'MD' : 'LK'}
                </span>
                <button
                  className="text-blue-600 underline hover:text-blue-800"
                  onClick={() => dispatch({ type: 'SELECT_OBJECT', apiName: lk.source })}
                >
                  {lk.sourceName}
                </button>
                <span className="text-gray-400 font-mono">.{lk.field.split('.').pop()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Report hint */}
      {reachableObjects.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-1 text-gray-700">
            レポート可能な組み合わせ
          </h3>
          <ul className="text-xs space-y-1">
            {reachableObjects.slice(0, 15).map((r) => (
              <li key={r.apiName} className="flex items-center gap-1">
                <span className={`px-1 rounded text-white text-[10px] ${r.needsCustomType ? 'bg-amber-500' : 'bg-green-500'}`}>
                  {r.needsCustomType ? 'カスタム' : '標準'}
                </span>
                <button
                  className="text-blue-600 underline hover:text-blue-800"
                  onClick={() => dispatch({ type: 'SELECT_OBJECT', apiName: r.apiName })}
                >
                  {r.name}
                </button>
                <span className="text-gray-400">({r.hops}ホップ)</span>
              </li>
            ))}
            {reachableObjects.length > 15 && (
              <li className="text-gray-400">...他 {reachableObjects.length - 15} 件</li>
            )}
          </ul>
        </section>
      )}

      {/* Lookup chain highlight */}
      <LookupChainHighlight />
    </div>
  );
}

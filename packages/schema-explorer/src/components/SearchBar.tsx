import { useState, useRef, useEffect } from 'react';
import type { ManabiObject } from '@sf-report-tools/types';
import { DOMAIN_COLORS } from '@sf-report-tools/types';
import { useSchemaSearch } from '@sf-report-tools/hooks';
import { useSchema } from '../context/SchemaContext';

export function SearchBar() {
  const { state, dispatch } = useSchema();
  const allObjects: ManabiObject[] = state.schema ? Object.values(state.schema) : [];
  const { query, setQuery, results } = useSchemaSearch(allObjects);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (apiName: string) => {
    dispatch({ type: 'SELECT_OBJECT', apiName });
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => { if (query) setOpen(true); }}
        placeholder="オブジェクト・項目を検索..."
        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {results.slice(0, 20).map((r) => (
            <li
              key={r.object.api_name}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              onClick={() => handleSelect(r.object.api_name)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: DOMAIN_COLORS[r.object.domain] }}
                />
                <span className="font-medium text-sm">{r.object.name}</span>
                <span className="text-xs text-gray-400">{r.object.api_name}</span>
              </div>
              {r.matchedFields.length > 0 && (
                <div className="text-xs text-gray-500 mt-0.5 ml-4">
                  マッチ項目: {r.matchedFields.length}件
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';
import type { SchemaFile, ManabiField } from '@sf-report-tools/types';

interface Props {
  schema: SchemaFile;
  onSelect: (objectApiName: string, field: ManabiField) => void;
  onClose: () => void;
}

export function FieldSelector({ schema, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');

  const allFields = useMemo(() => {
    const result: Array<{
      objectApiName: string;
      objectName: string;
      field: ManabiField;
    }> = [];
    for (const obj of Object.values(schema)) {
      for (const field of obj.fields) {
        result.push({
          objectApiName: obj.api_name,
          objectName: obj.name,
          field,
        });
      }
    }
    return result;
  }, [schema]);

  const filtered = useMemo(() => {
    if (!search) return allFields.slice(0, 50);
    const lower = search.toLowerCase();
    return allFields
      .filter(
        (f) =>
          f.field.label.toLowerCase().includes(lower) ||
          f.field.api_name.toLowerCase().includes(lower) ||
          f.objectName.toLowerCase().includes(lower)
      )
      .slice(0, 50);
  }, [allFields, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">フィールド選択</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="フィールド名またはオブジェクト名で検索..."
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
          autoFocus
        />
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">
              該当するフィールドがありません
            </p>
          )}
          {filtered.map((f) => (
            <button
              key={`${f.objectApiName}.${f.field.api_name}`}
              onClick={() => onSelect(f.objectApiName, f.field)}
              className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-blue-50"
            >
              <span className="font-medium text-gray-900">
                {f.field.label}
              </span>
              <span className="text-xs text-gray-400">
                {f.objectName}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

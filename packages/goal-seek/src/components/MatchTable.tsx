import type { MatchResult, SchemaFile, ManabiField } from '@sf-report-tools/types';
import { MatchRow } from './MatchRow';

interface Props {
  matches: MatchResult[];
  schema: SchemaFile;
  onUpdate: (index: number, objectApiName: string, field: ManabiField) => void;
}

export function MatchTable({ matches, schema, onUpdate }: Props) {
  const mapped = matches.filter((m) => m.match_type !== 'unmapped').length;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">マッチング結果</h3>
          <span className="text-sm text-gray-500">
            {mapped}/{matches.length} 列マッチ済み
          </span>
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="px-4 py-2">CSV列名</th>
            <th className="px-4 py-2">マッチしたフィールド</th>
            <th className="px-4 py-2">オブジェクト</th>
            <th className="px-4 py-2">信頼度</th>
            <th className="px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, idx) => (
            <MatchRow
              key={idx}
              match={match}
              index={idx}
              schema={schema}
              onUpdate={onUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

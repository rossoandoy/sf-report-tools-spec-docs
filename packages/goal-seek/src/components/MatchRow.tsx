import { useState } from 'react';
import type { MatchResult, SchemaFile, ManabiField } from '@sf-report-tools/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FieldSelector } from './FieldSelector';

interface Props {
  match: MatchResult;
  index: number;
  schema: SchemaFile;
  onUpdate: (index: number, objectApiName: string, field: ManabiField) => void;
}

export function MatchRow({ match, index, schema, onUpdate }: Props) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-2.5 text-sm font-medium text-gray-900">
          {match.csv_column}
        </td>
        <td className="px-4 py-2.5 text-sm text-gray-700">
          {match.matched_field ? (
            <span>{match.matched_field.label}</span>
          ) : match.suggestion ? (
            <span className="italic text-purple-600">{match.suggestion}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="px-4 py-2.5 text-sm text-gray-500">
          {match.matched_object
            ? schema[match.matched_object]?.name ?? match.matched_object
            : '-'}
        </td>
        <td className="px-4 py-2.5">
          <ConfidenceBadge
            confidence={match.confidence}
            matchType={match.match_type}
          />
        </td>
        <td className="px-4 py-2.5">
          <button
            onClick={() => setShowSelector(true)}
            className="rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
          >
            変更
          </button>
        </td>
      </tr>
      {showSelector && (
        <FieldSelector
          schema={schema}
          onSelect={(objectApiName, field) => {
            onUpdate(index, objectApiName, field);
            setShowSelector(false);
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
}

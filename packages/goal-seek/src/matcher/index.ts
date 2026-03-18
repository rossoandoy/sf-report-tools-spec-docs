import type { MatchResult, SchemaFile } from '@sf-report-tools/types';
import { buildFieldIndex, type FieldIndex } from './build-field-index';
import { exactMatch } from './exact-match';
import { fuzzyMatch } from './fuzzy-match';
import { detectComputedColumn } from './computed-column';

export type { FieldIndex } from './build-field-index';
export { buildFieldIndex } from './build-field-index';
export { fuzzyMatchCandidates } from './fuzzy-match';

/**
 * 全ヘッダーに対してマッチングを実行
 * 優先順: exact → fuzzy → computed → unmapped
 */
export function runMatching(
  headers: string[],
  schema: SchemaFile
): MatchResult[] {
  const index = buildFieldIndex(schema);
  const results: MatchResult[] = [];
  // マッチ済みオブジェクトを追跡して、同一オブジェクトのフィールドを優先
  const matchedObjects = new Set<string>();

  for (const header of headers) {
    const result = matchSingle(header, index, matchedObjects);
    results.push(result);
    if (result.matched_object) {
      matchedObjects.add(result.matched_object);
    }
  }

  return results;
}

function matchSingle(
  csvColumn: string,
  index: FieldIndex,
  preferredObjects: Set<string>
): MatchResult {
  // 1. 完全一致
  const exact = exactMatch(csvColumn, index, preferredObjects);
  if (exact) return exact;

  // 2. Fuzzy match
  const fuzzy = fuzzyMatch(csvColumn, index, preferredObjects);
  if (fuzzy) return fuzzy;

  // 3. 計算列パターン
  const computed = detectComputedColumn(csvColumn);
  if (computed) return computed;

  // 4. unmapped
  return {
    csv_column: csvColumn,
    matched_field: null,
    matched_object: null,
    confidence: 0,
    match_type: 'unmapped',
  };
}

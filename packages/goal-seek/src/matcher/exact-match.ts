import type { MatchResult } from '@sf-report-tools/types';
import type { FieldIndex } from './build-field-index';
import { normalize, applySynonyms } from './normalize';

/**
 * 正規化後の完全一致でマッチを試みる
 * label一致 → api_name一致 → 同義語一致 の優先順
 */
export function exactMatch(
  csvColumn: string,
  index: FieldIndex,
  preferredObjects: Set<string>
): MatchResult | null {
  const normalized = normalize(csvColumn);
  const synonyms = applySynonyms(normalized);

  for (const term of synonyms) {
    // label一致
    const labelHits = index.labelMap.get(term);
    if (labelHits && labelHits.length > 0) {
      const best = pickBestCandidate(labelHits, preferredObjects);
      return {
        csv_column: csvColumn,
        matched_field: best.field,
        matched_object: best.objectApiName,
        confidence: 1.0,
        match_type: 'exact',
      };
    }

    // api_name一致
    const apiHits = index.apiNameMap.get(term);
    if (apiHits && apiHits.length > 0) {
      const best = pickBestCandidate(apiHits, preferredObjects);
      return {
        csv_column: csvColumn,
        matched_field: best.field,
        matched_object: best.objectApiName,
        confidence: 0.95,
        match_type: 'exact',
      };
    }
  }

  return null;
}

/** 同名フィールドが複数オブジェクトにある場合、既マッチ済みオブジェクトを優先 */
function pickBestCandidate(
  candidates: Array<{ field: import('@sf-report-tools/types').ManabiField; objectApiName: string }>,
  preferredObjects: Set<string>
): { field: import('@sf-report-tools/types').ManabiField; objectApiName: string } {
  if (preferredObjects.size === 0) return candidates[0];

  const preferred = candidates.find((c) => preferredObjects.has(c.objectApiName));
  return preferred ?? candidates[0];
}

import { distance } from 'fastest-levenshtein';
import type { MatchResult } from '@sf-report-tools/types';
import type { FieldIndex, FieldEntry } from './build-field-index';
import { normalize, applySynonyms } from './normalize';

const MIN_CONFIDENCE = 0.4;
const MAX_CANDIDATES = 5;

/**
 * Levenshtein距離ベースのfuzzy match
 * 信頼度 = 1 - (distance / max(len1, len2))
 */
export function fuzzyMatch(
  csvColumn: string,
  index: FieldIndex,
  preferredObjects: Set<string>
): MatchResult | null {
  const normalized = normalize(csvColumn);
  const synonyms = applySynonyms(normalized);

  let bestScore = 0;
  let bestEntry: FieldEntry | null = null;

  for (const term of synonyms) {
    if (term.length === 0) continue;

    for (const entry of index.allFields) {
      // labelとapi_name両方でスコア計算し、良い方を採用
      const labelScore = calcSimilarity(term, entry.normalizedLabel);
      const apiScore = calcSimilarity(term, entry.normalizedApiName);
      const score = Math.max(labelScore, apiScore);

      // 既マッチ済みオブジェクトなら少しボーナス
      const bonus = preferredObjects.has(entry.objectApiName) ? 0.05 : 0;
      const adjustedScore = Math.min(score + bonus, 0.99);

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestEntry = entry;
      }
    }
  }

  if (bestEntry && bestScore >= MIN_CONFIDENCE) {
    return {
      csv_column: csvColumn,
      matched_field: bestEntry.field,
      matched_object: bestEntry.objectApiName,
      confidence: Math.round(bestScore * 100) / 100,
      match_type: 'fuzzy',
    };
  }

  return null;
}

function calcSimilarity(a: string, b: string): number {
  if (a.length === 0 || b.length === 0) return 0;
  const maxLen = Math.max(a.length, b.length);
  const dist = distance(a, b);
  return 1 - dist / maxLen;
}

/**
 * fuzzy matchの上位候補を返す（FieldSelector用）
 */
export function fuzzyMatchCandidates(
  csvColumn: string,
  index: FieldIndex
): Array<{ entry: FieldEntry; score: number }> {
  const normalized = normalize(csvColumn);
  const synonyms = applySynonyms(normalized);

  const scored: Array<{ entry: FieldEntry; score: number }> = [];

  for (const term of synonyms) {
    if (term.length === 0) continue;

    for (const entry of index.allFields) {
      const labelScore = calcSimilarity(term, entry.normalizedLabel);
      const apiScore = calcSimilarity(term, entry.normalizedApiName);
      const score = Math.max(labelScore, apiScore);

      if (score >= MIN_CONFIDENCE) {
        scored.push({ entry, score });
      }
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, MAX_CANDIDATES);
}

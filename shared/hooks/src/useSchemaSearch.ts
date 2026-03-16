import { useState, useMemo } from 'react';
import type { ManabiObject } from '@sf-report-tools/types';

interface SearchResult {
  object: ManabiObject;
  matchedFields: string[];
  score: number;
}

/**
 * スキーマのインクリメンタルサーチフック
 * オブジェクト名・項目名・ラベルで検索
 */
export function useSchemaSearch(objects: ManabiObject[]) {
  const [query, setQuery] = useState('');

  const results: SearchResult[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return objects
      .map((obj) => {
        let score = 0;
        const matchedFields: string[] = [];

        // オブジェクト名マッチ
        if (obj.name.toLowerCase().includes(q)) score += 10;
        if (obj.api_name.toLowerCase().includes(q)) score += 8;

        // 項目名マッチ
        for (const field of obj.fields) {
          if (field.label.toLowerCase().includes(q)) {
            score += 3;
            matchedFields.push(field.api_name);
          }
          if (field.api_name.toLowerCase().includes(q)) {
            score += 2;
            matchedFields.push(field.api_name);
          }
        }

        return { object: obj, matchedFields, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [objects, query]);

  return { query, setQuery, results };
}

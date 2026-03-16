import type { SchemaFile } from '@sf-report-tools/types';

export interface LookupPath {
  objects: string[];
  fields: string[];
  length: number;
}

/**
 * BFS で2オブジェクト間の最短Lookupパスを探索
 * Phase 0（グラフ表示）、Phase 3（ゴールシーク）、Phase 4（レポート生成）で再利用
 */
export function findLookupChain(
  schema: SchemaFile,
  source: string,
  target: string,
  maxDepth: number = 5
): LookupPath | null {
  if (source === target) {
    return { objects: [source], fields: [], length: 0 };
  }

  const visited = new Set<string>([source]);
  const queue: Array<{ object: string; path: string[]; fields: string[] }> = [
    { object: source, path: [source], fields: [] },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.path.length > maxDepth) {
      continue;
    }

    const obj = schema[current.object];
    if (!obj) continue;

    for (const lookup of obj.lookups) {
      const next = lookup.target;

      if (next === target) {
        return {
          objects: [...current.path, next],
          fields: [...current.fields, lookup.field],
          length: current.path.length,
        };
      }

      if (!visited.has(next)) {
        visited.add(next);
        queue.push({
          object: next,
          path: [...current.path, next],
          fields: [...current.fields, lookup.field],
        });
      }
    }
  }

  return null;
}

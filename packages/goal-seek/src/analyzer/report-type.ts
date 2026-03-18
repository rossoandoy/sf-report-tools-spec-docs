import type {
  MatchResult,
  ReportTypeRecommendation,
  SchemaFile,
} from '@sf-report-tools/types';
import { findLookupChain } from '@sf-report-tools/utils';

/**
 * マッチ結果のオブジェクト集合からレポートタイプを判定
 * - 1オブジェクト → standard
 * - 2オブジェクトでLookup接続あり → custom (with/without)
 * - 3+オブジェクトまたはLookup不達 → joined
 */
export function determineReportType(
  matches: MatchResult[],
  schema: SchemaFile
): ReportTypeRecommendation {
  // マッチ済みオブジェクトを集める
  const objects = new Set<string>();
  for (const m of matches) {
    if (m.matched_object) {
      objects.add(m.matched_object);
    }
  }

  const objectList = Array.from(objects);

  if (objectList.length === 0) {
    return {
      type: 'standard',
      reason: 'マッチしたオブジェクトがありません。手動でフィールドを割り当ててください。',
    };
  }

  if (objectList.length === 1) {
    return {
      type: 'standard',
      reason: `全フィールドが ${objectList[0]} に属しています。標準レポートタイプで作成可能です。`,
      definition: {
        primary: objectList[0],
        related: [],
        join_types: {},
      },
    };
  }

  // 2オブジェクトの場合: Lookup接続を確認
  if (objectList.length === 2) {
    const [a, b] = objectList;
    const pathAB = findLookupChain(schema, a, b);
    const pathBA = findLookupChain(schema, b, a);
    const path = pathAB ?? pathBA;

    if (path && path.length <= 2) {
      const primary = pathAB ? a : b;
      const related = pathAB ? b : a;
      return {
        type: 'custom',
        reason: `${primary} → ${related} のLookup関係があります。カスタムレポートタイプを作成してください。`,
        definition: {
          primary,
          related: [related],
          join_types: { [related]: 'with' },
        },
      };
    }
  }

  // 3+オブジェクト or Lookup不達: まずprimaryを決定
  const primary = findPrimaryObject(objectList, matches);
  const related = objectList.filter((o) => o !== primary);

  // 各relatedへのLookupパスを確認
  const joinTypes: Record<string, string> = {};
  let allReachable = true;

  for (const rel of related) {
    const path = findLookupChain(schema, primary, rel);
    if (path && path.length <= 3) {
      joinTypes[rel] = 'with';
    } else {
      allReachable = false;
      joinTypes[rel] = 'joined';
    }
  }

  if (allReachable && related.length <= 2) {
    return {
      type: 'custom',
      reason: `${primary} を主オブジェクトとしたカスタムレポートタイプで作成可能です。`,
      definition: { primary, related, join_types: joinTypes },
    };
  }

  return {
    type: 'joined',
    reason: `${objectList.length}つのオブジェクトにまたがっています。結合レポートの使用を推奨します。`,
    definition: { primary, related, join_types: joinTypes },
  };
}

/** マッチ数が最多のオブジェクトをprimaryとする */
function findPrimaryObject(
  objects: string[],
  matches: MatchResult[]
): string {
  const counts = new Map<string, number>();
  for (const m of matches) {
    if (m.matched_object) {
      counts.set(m.matched_object, (counts.get(m.matched_object) ?? 0) + 1);
    }
  }

  let best = objects[0];
  let bestCount = 0;
  for (const obj of objects) {
    const count = counts.get(obj) ?? 0;
    if (count > bestCount) {
      bestCount = count;
      best = obj;
    }
  }
  return best;
}

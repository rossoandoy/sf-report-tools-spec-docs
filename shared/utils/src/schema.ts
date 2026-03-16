import type { ManabiObject, Domain, SchemaFile } from '@sf-report-tools/types';

/**
 * スキーマJSONを読み込み、SchemaFile型として返す
 */
export function loadSchema(raw: Record<string, unknown>): SchemaFile {
  return raw as SchemaFile;
}

/**
 * 指定ドメインのオブジェクト一覧を返す
 */
export function getObjectsByDomain(
  schema: SchemaFile,
  domain: Domain
): ManabiObject[] {
  return Object.values(schema).filter((obj) => obj.domain === domain);
}

/**
 * API名でオブジェクトを検索
 */
export function findObjectByApiName(
  schema: SchemaFile,
  apiName: string
): ManabiObject | undefined {
  return schema[apiName];
}

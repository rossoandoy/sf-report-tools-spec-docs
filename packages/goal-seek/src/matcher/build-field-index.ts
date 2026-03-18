import type { ManabiField, SchemaFile } from '@sf-report-tools/types';
import { normalize } from './normalize';

export interface FieldEntry {
  field: ManabiField;
  objectApiName: string;
  objectName: string;
  normalizedLabel: string;
  normalizedApiName: string;
}

export interface FieldIndex {
  /** label(normalized) → FieldEntry[] */
  labelMap: Map<string, FieldEntry[]>;
  /** api_name末尾(normalized) → FieldEntry[] */
  apiNameMap: Map<string, FieldEntry[]>;
  /** 全フィールド */
  allFields: FieldEntry[];
}

/**
 * スキーマJSONから全2,554フィールドの検索インデックスを構築
 */
export function buildFieldIndex(schema: SchemaFile): FieldIndex {
  const labelMap = new Map<string, FieldEntry[]>();
  const apiNameMap = new Map<string, FieldEntry[]>();
  const allFields: FieldEntry[] = [];

  for (const obj of Object.values(schema)) {
    for (const field of obj.fields) {
      const normalizedLabel = normalize(field.label);
      // api_nameからフィールド名部分を抽出（Object.Field → Field）
      const fieldNamePart = field.api_name.includes('.')
        ? field.api_name.split('.').pop()!
        : field.api_name;
      const normalizedApiName = normalize(fieldNamePart);

      const entry: FieldEntry = {
        field,
        objectApiName: obj.api_name,
        objectName: obj.name,
        normalizedLabel,
        normalizedApiName,
      };

      allFields.push(entry);

      // labelMap
      const existing = labelMap.get(normalizedLabel);
      if (existing) {
        existing.push(entry);
      } else {
        labelMap.set(normalizedLabel, [entry]);
      }

      // apiNameMap
      const existingApi = apiNameMap.get(normalizedApiName);
      if (existingApi) {
        existingApi.push(entry);
      } else {
        apiNameMap.set(normalizedApiName, [entry]);
      }
    }
  }

  return { labelMap, apiNameMap, allFields };
}

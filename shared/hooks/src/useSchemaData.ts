import { useState, useEffect } from 'react';
import type { SchemaFile, Domain, ManabiObject } from '@sf-report-tools/types';
import { loadSchema, getObjectsByDomain } from '@sf-report-tools/utils';

interface SchemaDataState {
  schema: SchemaFile | null;
  loading: boolean;
  error: string | null;
}

/**
 * スキーマデータを読み込み・管理するフック
 * JSON importまたはfetchで取得したデータを型安全に扱う
 */
export function useSchemaData(rawData?: Record<string, unknown>): SchemaDataState & {
  objectsByDomain: (domain: Domain) => ManabiObject[];
  allObjects: ManabiObject[];
} {
  const [state, setState] = useState<SchemaDataState>({
    schema: null,
    loading: !rawData,
    error: null,
  });

  useEffect(() => {
    if (rawData) {
      setState({
        schema: loadSchema(rawData),
        loading: false,
        error: null,
      });
    }
  }, [rawData]);

  const objectsByDomain = (domain: Domain): ManabiObject[] => {
    if (!state.schema) return [];
    return getObjectsByDomain(state.schema, domain);
  };

  const allObjects = state.schema ? Object.values(state.schema) : [];

  return { ...state, objectsByDomain, allObjects };
}

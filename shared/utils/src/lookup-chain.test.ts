import { describe, it, expect } from 'vitest';
import { findLookupChain } from './lookup-chain';
import type { SchemaFile } from '@sf-report-tools/types';

const mockSchema: SchemaFile = {
  'A__c': {
    name: 'A', api_name: 'A__c', domain: 'billing',
    fields: [],
    lookups: [
      { field: 'A__c.B__c', source: 'A__c', target: 'B__c', type: 'Lookup' },
    ],
  },
  'B__c': {
    name: 'B', api_name: 'B__c', domain: 'billing',
    fields: [],
    lookups: [
      { field: 'B__c.C__c', source: 'B__c', target: 'C__c', type: 'MasterDetail' },
    ],
  },
  'C__c': {
    name: 'C', api_name: 'C__c', domain: 'lesson',
    fields: [],
    lookups: [],
  },
};

describe('findLookupChain', () => {
  it('finds direct lookup path', () => {
    const path = findLookupChain(mockSchema, 'A__c', 'B__c');
    expect(path).toEqual({
      objects: ['A__c', 'B__c'],
      fields: ['A__c.B__c'],
      length: 1,
    });
  });

  it('finds multi-hop path', () => {
    const path = findLookupChain(mockSchema, 'A__c', 'C__c');
    expect(path).toEqual({
      objects: ['A__c', 'B__c', 'C__c'],
      fields: ['A__c.B__c', 'B__c.C__c'],
      length: 2,
    });
  });

  it('returns null for unreachable target', () => {
    const path = findLookupChain(mockSchema, 'C__c', 'A__c');
    expect(path).toBeNull();
  });

  it('returns zero-length path for same source and target', () => {
    const path = findLookupChain(mockSchema, 'A__c', 'A__c');
    expect(path).toEqual({ objects: ['A__c'], fields: [], length: 0 });
  });
});

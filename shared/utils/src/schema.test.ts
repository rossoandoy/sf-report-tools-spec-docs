import { describe, it, expect } from 'vitest';
import { loadSchema, getObjectsByDomain, findObjectByApiName } from './schema';

const mockRaw = {
  'MANAERP__Invoice__c': {
    name: 'Invoice',
    api_name: 'MANAERP__Invoice__c',
    domain: 'billing',
    fields: [
      { api_name: 'Name', label: 'Name', type: 'Text', required: true },
    ],
    lookups: [],
  },
  'Contact': {
    name: 'Contact',
    api_name: 'Contact',
    domain: 'student',
    fields: [],
    lookups: [],
  },
};

describe('loadSchema', () => {
  it('returns typed schema from raw data', () => {
    const schema = loadSchema(mockRaw);
    expect(Object.keys(schema)).toHaveLength(2);
    expect(schema['MANAERP__Invoice__c'].domain).toBe('billing');
  });
});

describe('getObjectsByDomain', () => {
  it('filters objects by domain', () => {
    const schema = loadSchema(mockRaw);
    const billing = getObjectsByDomain(schema, 'billing');
    expect(billing).toHaveLength(1);
    expect(billing[0].api_name).toBe('MANAERP__Invoice__c');
  });

  it('returns empty for domain with no objects', () => {
    const schema = loadSchema(mockRaw);
    expect(getObjectsByDomain(schema, 'staff')).toHaveLength(0);
  });
});

describe('findObjectByApiName', () => {
  it('finds object by api name', () => {
    const schema = loadSchema(mockRaw);
    const obj = findObjectByApiName(schema, 'Contact');
    expect(obj?.name).toBe('Contact');
  });

  it('returns undefined for unknown api name', () => {
    const schema = loadSchema(mockRaw);
    expect(findObjectByApiName(schema, 'Unknown__c')).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { schemaReducer, type SchemaState } from './SchemaContext';
import type { SchemaFile, Domain } from '@sf-report-tools/types';

const ALL_DOMAINS: Domain[] = [
  'billing', 'lesson', 'student', 'exam', 'staff', 'event', 'core', 'other',
];

function makeState(overrides?: Partial<SchemaState>): SchemaState {
  return {
    schema: null,
    selectedDomains: new Set<Domain>(ALL_DOMAINS),
    selectedObject: null,
    searchQuery: '',
    highlightedChain: null,
    ...overrides,
  };
}

const mockSchema: SchemaFile = {
  'Obj_A': {
    name: 'Object A',
    api_name: 'Obj_A',
    domain: 'billing',
    fields: [],
    lookups: [],
  },
  'Obj_B': {
    name: 'Object B',
    api_name: 'Obj_B',
    domain: 'lesson',
    fields: [],
    lookups: [{ field: 'ref', source: 'Obj_B', target: 'Obj_A', type: 'Lookup' }],
  },
};

describe('schemaReducer', () => {
  it('SET_SCHEMA sets the schema', () => {
    const state = schemaReducer(makeState(), { type: 'SET_SCHEMA', schema: mockSchema });
    expect(state.schema).toBe(mockSchema);
  });

  it('TOGGLE_DOMAIN adds and removes domains', () => {
    let state = makeState();
    state = schemaReducer(state, { type: 'TOGGLE_DOMAIN', domain: 'billing' });
    expect(state.selectedDomains.has('billing')).toBe(false);

    state = schemaReducer(state, { type: 'TOGGLE_DOMAIN', domain: 'billing' });
    expect(state.selectedDomains.has('billing')).toBe(true);
  });

  it('SELECT_ALL_DOMAINS / CLEAR_ALL_DOMAINS', () => {
    let state = schemaReducer(makeState(), { type: 'CLEAR_ALL_DOMAINS' });
    expect(state.selectedDomains.size).toBe(0);

    state = schemaReducer(state, { type: 'SELECT_ALL_DOMAINS' });
    expect(state.selectedDomains.size).toBe(8);
  });

  it('SELECT_OBJECT sets selectedObject and clears chain', () => {
    const state = schemaReducer(
      makeState({ highlightedChain: { objects: ['a', 'b'], fields: ['f'], length: 1 } }),
      { type: 'SELECT_OBJECT', apiName: 'Obj_A' }
    );
    expect(state.selectedObject).toBe('Obj_A');
    expect(state.highlightedChain).toBeNull();
  });

  it('SET_SEARCH updates query', () => {
    const state = schemaReducer(makeState(), { type: 'SET_SEARCH', query: 'Invoice' });
    expect(state.searchQuery).toBe('Invoice');
  });

  it('SET_CHAIN sets highlighted chain', () => {
    const chain = { objects: ['a', 'b'], fields: ['f'], length: 1 };
    const state = schemaReducer(makeState(), { type: 'SET_CHAIN', chain });
    expect(state.highlightedChain).toBe(chain);
  });
});

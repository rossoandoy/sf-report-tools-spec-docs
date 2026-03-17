import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { SchemaFile, Domain } from '@sf-report-tools/types';
import type { LookupPath } from '@sf-report-tools/utils';

// ===== State =====

export interface SchemaState {
  schema: SchemaFile | null;
  selectedDomains: Set<Domain>;
  selectedObject: string | null;
  searchQuery: string;
  highlightedChain: LookupPath | null;
}

const ALL_DOMAINS: Set<Domain> = new Set([
  'billing', 'lesson', 'student', 'exam', 'staff', 'event', 'core', 'other',
]);

const initialState: SchemaState = {
  schema: null,
  selectedDomains: new Set(ALL_DOMAINS),
  selectedObject: null,
  searchQuery: '',
  highlightedChain: null,
};

// ===== Actions =====

export type SchemaAction =
  | { type: 'SET_SCHEMA'; schema: SchemaFile }
  | { type: 'TOGGLE_DOMAIN'; domain: Domain }
  | { type: 'SELECT_ALL_DOMAINS' }
  | { type: 'CLEAR_ALL_DOMAINS' }
  | { type: 'SELECT_OBJECT'; apiName: string | null }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_CHAIN'; chain: LookupPath | null };

// ===== Reducer =====

export function schemaReducer(state: SchemaState, action: SchemaAction): SchemaState {
  switch (action.type) {
    case 'SET_SCHEMA':
      return { ...state, schema: action.schema };
    case 'TOGGLE_DOMAIN': {
      const next = new Set(state.selectedDomains);
      if (next.has(action.domain)) {
        next.delete(action.domain);
      } else {
        next.add(action.domain);
      }
      return { ...state, selectedDomains: next };
    }
    case 'SELECT_ALL_DOMAINS':
      return { ...state, selectedDomains: new Set(ALL_DOMAINS) };
    case 'CLEAR_ALL_DOMAINS':
      return { ...state, selectedDomains: new Set() };
    case 'SELECT_OBJECT':
      return { ...state, selectedObject: action.apiName, highlightedChain: null };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_CHAIN':
      return { ...state, highlightedChain: action.chain };
    default:
      return state;
  }
}

// ===== Context =====

interface SchemaContextValue {
  state: SchemaState;
  dispatch: React.Dispatch<SchemaAction>;
  filteredObjects: Array<{ api_name: string; name: string; domain: Domain }>;
}

const SchemaContext = createContext<SchemaContextValue | null>(null);

export function SchemaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(schemaReducer, initialState);

  const filteredObjects = state.schema
    ? Object.values(state.schema)
        .filter((obj) => state.selectedDomains.has(obj.domain))
        .map((obj) => ({ api_name: obj.api_name, name: obj.name, domain: obj.domain }))
    : [];

  return (
    <SchemaContext.Provider value={{ state, dispatch, filteredObjects }}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema() {
  const ctx = useContext(SchemaContext);
  if (!ctx) throw new Error('useSchema must be used within SchemaProvider');
  return ctx;
}

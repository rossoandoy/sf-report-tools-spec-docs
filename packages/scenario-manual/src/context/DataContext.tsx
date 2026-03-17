import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { ScenarioCatalog, SfReportKnowledge } from '@sf-report-tools/types';

interface DataState {
  catalog: ScenarioCatalog | null;
  knowledge: SfReportKnowledge | null;
  loading: boolean;
  error: string | null;
}

type DataAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; catalog: ScenarioCatalog; knowledge: SfReportKnowledge }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: DataState = {
  catalog: null,
  knowledge: null,
  loading: true,
  error: null,
};

function reducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return { catalog: action.catalog, knowledge: action.knowledge, loading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error };
  }
}

const DataContext = createContext<DataState>(initialState);

export function useData(): DataState {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: 'LOAD_START' });
    const base = import.meta.env.BASE_URL;
    Promise.all([
      fetch(base + 'scenario-catalog.json').then((r) => r.json()),
      fetch(base + 'sf-report-knowledge.json').then((r) => r.json()),
    ])
      .then(([catalog, knowledge]) => {
        dispatch({ type: 'LOAD_SUCCESS', catalog, knowledge });
      })
      .catch((e) => {
        dispatch({ type: 'LOAD_ERROR', error: String(e) });
      });
  }, []);

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>;
}

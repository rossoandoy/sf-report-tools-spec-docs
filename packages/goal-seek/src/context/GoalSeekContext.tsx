import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { MatchResult, SchemaFile } from '@sf-report-tools/types';
import type { ExtractedData } from '../parser';
import type { AnalysisResult } from '../analyzer';

// ===== State =====

export type WizardStep = 'upload' | 'matching' | 'result';

export interface GoalSeekState {
  step: WizardStep;
  fileName: string | null;
  parsedData: ExtractedData | null;
  matches: MatchResult[];
  analysis: AnalysisResult | null;
  schema: SchemaFile | null;
  loading: boolean;
  error: string | null;
}

const initialState: GoalSeekState = {
  step: 'upload',
  fileName: null,
  parsedData: null,
  matches: [],
  analysis: null,
  schema: null,
  loading: false,
  error: null,
};

// ===== Actions =====

type Action =
  | { type: 'SET_SCHEMA'; schema: SchemaFile }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_PARSED'; fileName: string; data: ExtractedData }
  | { type: 'SET_MATCHES'; matches: MatchResult[] }
  | { type: 'UPDATE_MATCH'; index: number; match: MatchResult }
  | { type: 'SET_ANALYSIS'; analysis: AnalysisResult }
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'RESET' };

function reducer(state: GoalSeekState, action: Action): GoalSeekState {
  switch (action.type) {
    case 'SET_SCHEMA':
      return { ...state, schema: action.schema };
    case 'SET_LOADING':
      return { ...state, loading: action.loading, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.error, loading: false };
    case 'SET_PARSED':
      return {
        ...state,
        fileName: action.fileName,
        parsedData: action.data,
        loading: false,
      };
    case 'SET_MATCHES':
      return { ...state, matches: action.matches, step: 'matching' };
    case 'UPDATE_MATCH': {
      const matches = [...state.matches];
      matches[action.index] = action.match;
      return { ...state, matches };
    }
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.analysis, step: 'result' };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'RESET':
      return { ...initialState, schema: state.schema };
    default:
      return state;
  }
}

// ===== Context =====

const GoalSeekContext = createContext<GoalSeekState>(initialState);
const DispatchContext = createContext<Dispatch<Action>>(() => {});

export function GoalSeekProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GoalSeekContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </GoalSeekContext.Provider>
  );
}

export function useGoalSeek() {
  return useContext(GoalSeekContext);
}

export function useGoalSeekDispatch() {
  return useContext(DispatchContext);
}

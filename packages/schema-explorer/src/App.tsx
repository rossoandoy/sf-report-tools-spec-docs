import { useEffect } from 'react';
import { SchemaProvider, useSchema } from './context/SchemaContext';
import { NetworkGraph } from './components/NetworkGraph';
import { DomainFilter } from './components/DomainFilter';
import { SearchBar } from './components/SearchBar';
import { DetailPanel } from './components/DetailPanel';
import { loadSchema } from '@sf-report-tools/utils';

function NavBar() {
  return (
    <nav className="bg-gray-800 text-gray-300 text-sm flex items-center justify-between px-4 py-1.5">
      <a href="/" className="font-medium text-white">Manabie ERP ツール</a>
      <div className="flex gap-4">
        <a href="/schema-explorer/" className="text-white underline">データモデル</a>
        <a href="/scenario-manual/">シナリオ</a>
        <a href="/goal-seek/">ゴールシーク</a>
      </div>
    </nav>
  );
}

function AppContent() {
  const { state, dispatch } = useSchema();

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'manabie-erp-schema.json')
      .then((res) => res.json())
      .then((raw) => dispatch({ type: 'SET_SCHEMA', schema: loadSchema(raw) }));
  }, [dispatch]);

  if (!state.schema) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        スキーマを読み込み中...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <h1 className="text-lg font-bold whitespace-nowrap">データモデルビューア</h1>
        <SearchBar />
        <DomainFilter />
      </header>

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        {/* Graph */}
        <div className="flex-1 relative">
          <NetworkGraph />
        </div>

        {/* Detail Panel */}
        {state.selectedObject && (
          <aside className="w-96 border-l border-gray-200 overflow-y-auto bg-white shrink-0">
            <DetailPanel />
          </aside>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <SchemaProvider>
      <AppContent />
    </SchemaProvider>
  );
}

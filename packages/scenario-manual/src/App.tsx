import { DataProvider, useData } from './context/DataContext';
import { HashRouter, useRouter, matchRoute } from './components/HashRouter';
import { HomePage } from './pages/HomePage';
import { ScenarioPage } from './pages/ScenarioPage';
import { ConceptPage } from './pages/ConceptPage';
import { DecisionTreePage } from './pages/DecisionTreePage';

function Router() {
  const { path } = useRouter();
  const { loading, error } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        データの読み込みに失敗しました: {error}
      </div>
    );
  }

  // Route matching
  const scenarioMatch = matchRoute('/scenario/:id', path);
  if (scenarioMatch) {
    return <ScenarioPage id={scenarioMatch.id} />;
  }

  const conceptMatch = matchRoute('/concepts/:name', path);
  if (conceptMatch) {
    return <ConceptPage name={conceptMatch.name} />;
  }

  if (path === '/concepts' || path === '/concepts/') {
    return <ConceptPage name="" />;
  }

  if (path === '/decision-tree') {
    return <DecisionTreePage />;
  }

  return <HomePage />;
}

export function App() {
  return (
    <HashRouter>
      <DataProvider>
        <div className="min-h-screen bg-gray-50">
          <Router />
        </div>
      </DataProvider>
    </HashRouter>
  );
}

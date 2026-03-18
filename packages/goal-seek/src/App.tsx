import { useEffect } from 'react';
import { loadSchema } from '@sf-report-tools/utils';
import type { SchemaFile } from '@sf-report-tools/types';
import {
  GoalSeekProvider,
  useGoalSeek,
  useGoalSeekDispatch,
} from './context/GoalSeekContext';
import { WizardStepper } from './components/WizardStepper';
import { UploadPage } from './pages/UploadPage';
import { MatchingPage } from './pages/MatchingPage';
import { ResultPage } from './pages/ResultPage';

function SchemaLoader() {
  const dispatch = useGoalSeekDispatch();

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'manabie-erp-schema.json')
      .then((res) => res.json())
      .then((raw: Record<string, unknown>) => {
        const schema = loadSchema(raw) as SchemaFile;
        dispatch({ type: 'SET_SCHEMA', schema });
      })
      .catch((e) => {
        dispatch({ type: 'SET_ERROR', error: `スキーマ読み込み失敗: ${e}` });
      });
  }, [dispatch]);

  return null;
}

function PageRouter() {
  const { step } = useGoalSeek();

  switch (step) {
    case 'upload':
      return <UploadPage />;
    case 'matching':
      return <MatchingPage />;
    case 'result':
      return <ResultPage />;
  }
}

export function App() {
  return (
    <GoalSeekProvider>
      <SchemaLoader />
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              ゴールシーク — レポート設定支援
            </h1>
            <p className="text-sm text-gray-500">
              欲しい出力をアップロードすると、SFレポートの設定方法を提案します
            </p>
          </div>
        </header>

        <WizardStepperWrapper />

        <main className="pb-12">
          <PageRouter />
        </main>
      </div>
    </GoalSeekProvider>
  );
}

function WizardStepperWrapper() {
  const { step } = useGoalSeek();
  return (
    <div className="mx-auto max-w-4xl px-4">
      <WizardStepper current={step} />
    </div>
  );
}

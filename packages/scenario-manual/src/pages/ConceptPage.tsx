import type { SfConcept } from '@sf-report-tools/types';
import { useData } from '../context/DataContext';
import { useRouter } from '../components/HashRouter';

const CONCEPT_KEYS = [
  'custom_report_type',
  'joined_report',
  'bucket_field',
  'cross_filter',
  'report_formula',
];

export function ConceptPage({ name }: { name: string }) {
  const { knowledge, catalog } = useData();
  const { navigate } = useRouter();

  if (!knowledge || !catalog) return null;

  const concepts = knowledge.concepts as Record<string, SfConcept>;
  const concept = concepts[name];

  if (!concept) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <nav className="text-sm text-gray-500 mb-4">
          <button onClick={() => navigate('/')} className="hover:text-blue-600">トップ</button>
          <span className="mx-1">/</span>
          <span>概念</span>
        </nav>

        {/* Concept list */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">SF概念ガイド</h1>
        <div className="space-y-3">
          {CONCEPT_KEYS.map((key) => {
            const c = concepts[key];
            if (!c) return null;
            return (
              <button
                key={key}
                onClick={() => navigate(`/concepts/${key}`)}
                className="block w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <h3 className="font-semibold text-gray-900">{c.sf_name}</h3>
                <p className="text-sm text-gray-500">{c.business_name}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Find scenarios using this concept
  const relatedScenarios = catalog.scenarios.filter((s) =>
    s.concept_explanations.some((ce) => ce.concept === name)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/')} className="hover:text-blue-600">トップ</button>
        <span className="mx-1">/</span>
        <button onClick={() => navigate('/concepts/')} className="hover:text-blue-600">概念</button>
        <span className="mx-1">/</span>
        <span>{concept.sf_name}</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{concept.sf_name}</h1>
      <p className="text-lg text-gray-600 mb-6">{concept.business_name}</p>

      {/* Analogy */}
      <section className="mb-6">
        <h2 className="font-bold text-gray-900 mb-2">たとえると</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-900">
          {concept.analogy}
        </div>
      </section>

      {/* When to use */}
      <section className="mb-6">
        <h2 className="font-bold text-gray-900 mb-2">いつ使う？</h2>
        <p className="text-gray-700">{concept.when_to_use}</p>
      </section>

      {/* Vs */}
      {concept.vs && concept.vs.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-gray-900 mb-2">他の機能との違い</h2>
          <div className="space-y-2">
            {concept.vs.map((v) => (
              <div key={v.name} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="font-medium text-gray-900">vs {v.name}</span>
                <p className="text-sm text-gray-600 mt-0.5">{v.short}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Common mistakes */}
      {concept.common_mistakes && concept.common_mistakes.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-gray-900 mb-2">よくある間違い</h2>
          <div className="space-y-2">
            {concept.common_mistakes.map((m, i) => (
              <div key={i} className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <span className="shrink-0 text-amber-500">⚠</span>
                <p className="text-amber-800">{m}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Manabie examples */}
      <section className="mb-6">
        <h2 className="font-bold text-gray-900 mb-2">Manabie ERPでの使用例</h2>
        <ul className="space-y-1">
          {concept.manabie_examples.map((ex, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{ex}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Related scenarios */}
      {relatedScenarios.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-gray-900 mb-2">この概念を使用するシナリオ</h2>
          <div className="space-y-2">
            {relatedScenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/scenario/${s.id}`)}
                className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-400 mr-2">{s.id}</span>
                <span className="font-medium text-gray-900">{s.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm">
          ← シナリオ一覧
        </button>
        <button onClick={() => navigate('/concepts/')} className="text-blue-600 hover:underline text-sm">
          ← 概念一覧
        </button>
      </div>
    </div>
  );
}

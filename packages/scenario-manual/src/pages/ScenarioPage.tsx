import type { Domain } from '@sf-report-tools/types';
import { DOMAIN_LABELS, DOMAIN_COLORS } from '@sf-report-tools/types';
import { useData } from '../context/DataContext';
import { useRouter } from '../components/HashRouter';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { StepList } from '../components/StepList';
import { ConceptAccordion } from '../components/ConceptAccordion';
import { PitfallAlert } from '../components/PitfallAlert';

export function ScenarioPage({ id }: { id: string }) {
  const { catalog } = useData();
  const { navigate } = useRouter();

  if (!catalog) return null;

  const scenario = catalog.scenarios.find((s) => s.id === id);
  if (!scenario) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">シナリオ「{id}」が見つかりません</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline">
          トップに戻る
        </button>
      </div>
    );
  }

  const domainColor = DOMAIN_COLORS[scenario.domain as Domain] ?? '#94A3B8';
  const domainLabel = DOMAIN_LABELS[scenario.domain as Domain] ?? scenario.domain;

  const relatedScenarios = catalog.scenarios.filter((s) =>
    scenario.related_scenarios.includes(s.id)
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <button onClick={() => navigate('/')} className="hover:text-blue-600">
          トップ
        </button>
        <span className="mx-1">/</span>
        <span>{scenario.id}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: domainColor }}
          />
          <span className="text-sm text-gray-500">{domainLabel}</span>
          <span className="text-sm text-gray-400">{scenario.id}</span>
          <DifficultyBadge difficulty={scenario.difficulty} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{scenario.title}</h1>
        <p className="text-gray-600 mt-1">{scenario.description}</p>
      </div>

      {/* 1. 目的 — ユーザーストーリー */}
      <Section title="目的">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 italic">&ldquo;{scenario.user_story}&rdquo;</p>
        </div>
      </Section>

      {/* Sidebar: 使用オブジェクト */}
      <Section title="使用するオブジェクト">
        <div className="flex flex-wrap gap-2">
          <ObjectChip label={scenario.objects.primary} isPrimary />
          {scenario.objects.related.map((r) => (
            <ObjectChip key={r.object} label={r.object} subtitle={r.relation} />
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-400">
          レポートタイプ: <span className="font-medium text-gray-600">{scenario.sf_features.report_type}</span>
        </div>
      </Section>

      {/* 2. ステップバイステップ手順 */}
      <Section title="ステップバイステップ手順">
        <StepList steps={scenario.steps} />
      </Section>

      {/* 3. SF概念の解説 */}
      {scenario.concept_explanations.length > 0 && (
        <Section title="なぜその設定か（SF概念の解説）">
          <ConceptAccordion explanations={scenario.concept_explanations} />
        </Section>
      )}

      {/* 4. つまずきポイント */}
      {scenario.pitfalls.length > 0 && (
        <Section title="よくあるつまずきポイント">
          <PitfallAlert pitfalls={scenario.pitfalls} />
        </Section>
      )}

      {/* 5. 関連シナリオ */}
      {relatedScenarios.length > 0 && (
        <Section title="関連シナリオ">
          <div className="space-y-2">
            {relatedScenarios.map((rs) => (
              <button
                key={rs.id}
                onClick={() => navigate(`/scenario/${rs.id}`)}
                className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs text-gray-400 mr-2">{rs.id}</span>
                <span className="font-medium text-gray-900">{rs.title}</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Back */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm">
          ← シナリオ一覧に戻る
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 pb-1 border-b border-gray-200">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ObjectChip({
  label,
  isPrimary,
  subtitle,
}: {
  label: string;
  isPrimary?: boolean;
  subtitle?: string;
}) {
  const displayName = label.replace('MANAERP__', '').replace('__c', '');
  return (
    <div
      className={`px-3 py-1.5 rounded-lg text-sm border ${
        isPrimary
          ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
          : 'bg-gray-50 border-gray-200 text-gray-700'
      }`}
    >
      <span className="font-medium">{displayName}</span>
      {isPrimary && <span className="text-xs ml-1 text-indigo-500">(主)</span>}
      {subtitle && <span className="block text-xs text-gray-400 mt-0.5">{subtitle}</span>}
    </div>
  );
}

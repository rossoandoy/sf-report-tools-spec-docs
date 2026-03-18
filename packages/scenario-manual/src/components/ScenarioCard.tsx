import type { Scenario, Domain } from '@sf-report-tools/types';
import { DOMAIN_LABELS, DOMAIN_COLORS } from '@sf-report-tools/types';
import { DifficultyBadge } from './DifficultyBadge';
import { useRouter } from './HashRouter';

export function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const { navigate } = useRouter();
  const domainColor = DOMAIN_COLORS[scenario.domain as Domain] ?? '#94A3B8';
  const domainLabel = DOMAIN_LABELS[scenario.domain as Domain] ?? scenario.domain;

  return (
    <button
      onClick={() => navigate(`/scenario/${scenario.id}`)}
      className="text-left w-full p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-gray-300 transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: domainColor }}
        />
        <span className="text-xs text-gray-500">{domainLabel}</span>
        <span className="text-xs text-gray-400">{scenario.id}</span>
        <DifficultyBadge difficulty={scenario.difficulty} />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{scenario.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-2">{scenario.user_story}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {scenario.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

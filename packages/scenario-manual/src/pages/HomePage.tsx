import { useState, useMemo } from 'react';
import type { Domain, Difficulty, Scenario } from '@sf-report-tools/types';
import { DOMAIN_LABELS, DOMAIN_COLORS } from '@sf-report-tools/types';
import { useData } from '../context/DataContext';
import { ScenarioCard } from '../components/ScenarioCard';
import { SearchInput } from '../components/SearchInput';
import { useRouter } from '../components/HashRouter';

const SCENARIO_DOMAINS: Domain[] = ['billing', 'lesson', 'exam', 'staff', 'student', 'event'];
const DIFFICULTIES: Difficulty[] = ['basic', 'intermediate', 'advanced'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  basic: '基本',
  intermediate: '中級',
  advanced: '上級',
};

function matchesSearch(scenario: Scenario, query: string): boolean {
  const q = query.toLowerCase();
  return (
    scenario.title.toLowerCase().includes(q) ||
    scenario.description.toLowerCase().includes(q) ||
    scenario.user_story.toLowerCase().includes(q) ||
    scenario.tags.some((t) => t.toLowerCase().includes(q)) ||
    scenario.id.toLowerCase().includes(q)
  );
}

export function HomePage() {
  const { catalog } = useData();
  const { navigate } = useRouter();
  const [activeDomain, setActiveDomain] = useState<Domain | 'all'>('all');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!catalog) return [];
    return catalog.scenarios.filter((s) => {
      if (activeDomain !== 'all' && s.domain !== activeDomain) return false;
      if (difficulty !== 'all' && s.difficulty !== difficulty) return false;
      if (search && !matchesSearch(s, search)) return false;
      return true;
    });
  }, [catalog, activeDomain, difficulty, search]);

  if (!catalog) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          業務シナリオ型マニュアル
        </h1>
        <p className="text-sm text-gray-500">
          業務ゴールからレポート作成手順を探す — {catalog.scenarios.length} シナリオ
        </p>
      </div>

      {/* Navigation links */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => navigate('/decision-tree')}
          className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          レポートタイプ選択フロー
        </button>
        <button
          onClick={() => navigate('/concepts/custom_report_type')}
          className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
        >
          SF概念ガイド
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="シナリオを検索（例: 未収金、出欠、勤怠...）"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Domain tabs */}
        <button
          onClick={() => setActiveDomain('all')}
          className={`px-3 py-1 text-sm rounded-full border transition-colors ${
            activeDomain === 'all'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
          }`}
        >
          全て
        </button>
        {SCENARIO_DOMAINS.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDomain(d)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              activeDomain === d
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
            style={
              activeDomain === d
                ? { backgroundColor: DOMAIN_COLORS[d], borderColor: DOMAIN_COLORS[d] }
                : undefined
            }
          >
            {DOMAIN_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setDifficulty('all')}
          className={`px-2.5 py-0.5 text-xs rounded-full border ${
            difficulty === 'all'
              ? 'bg-gray-200 border-gray-400 font-medium'
              : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          全レベル
        </button>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-2.5 py-0.5 text-xs rounded-full border ${
              difficulty === d
                ? 'bg-gray-200 border-gray-400 font-medium'
                : 'bg-white border-gray-200 text-gray-500'
            }`}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          該当するシナリオが見つかりません
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      )}
    </div>
  );
}

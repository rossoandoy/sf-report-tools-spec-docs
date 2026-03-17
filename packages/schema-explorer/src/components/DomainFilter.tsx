import type { Domain } from '@sf-report-tools/types';
import { DOMAIN_COLORS, DOMAIN_LABELS } from '@sf-report-tools/types';
import { useSchema } from '../context/SchemaContext';

const DOMAINS: Domain[] = [
  'billing', 'lesson', 'student', 'exam', 'staff', 'event', 'core', 'other',
];

export function DomainFilter() {
  const { state, dispatch } = useSchema();
  const allSelected = DOMAINS.every((d) => state.selectedDomains.has(d));

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        className="px-2 py-0.5 text-xs rounded border border-gray-300 hover:bg-gray-100"
        onClick={() =>
          dispatch({ type: allSelected ? 'CLEAR_ALL_DOMAINS' : 'SELECT_ALL_DOMAINS' })
        }
      >
        {allSelected ? '全解除' : '全選択'}
      </button>
      {DOMAINS.map((domain) => {
        const active = state.selectedDomains.has(domain);
        return (
          <button
            key={domain}
            className="px-2 py-0.5 text-xs rounded-full border transition-colors"
            style={{
              backgroundColor: active ? DOMAIN_COLORS[domain] : 'transparent',
              borderColor: DOMAIN_COLORS[domain],
              color: active ? '#fff' : DOMAIN_COLORS[domain],
            }}
            onClick={() => dispatch({ type: 'TOGGLE_DOMAIN', domain })}
          >
            {DOMAIN_LABELS[domain]}
          </button>
        );
      })}
    </div>
  );
}

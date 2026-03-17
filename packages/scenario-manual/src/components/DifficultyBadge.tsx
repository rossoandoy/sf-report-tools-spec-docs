import type { Difficulty } from '@sf-report-tools/types';

const BADGE_STYLES: Record<Difficulty, string> = {
  basic: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const BADGE_LABELS: Record<Difficulty, string> = {
  basic: '基本',
  intermediate: '中級',
  advanced: '上級',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${BADGE_STYLES[difficulty]}`}
    >
      {BADGE_LABELS[difficulty]}
    </span>
  );
}

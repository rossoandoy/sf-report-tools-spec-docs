import { useState } from 'react';
import type { ConceptExplanation } from '@sf-report-tools/types';
import { useRouter } from './HashRouter';

export function ConceptAccordion({ explanations }: { explanations: ConceptExplanation[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { navigate } = useRouter();

  if (explanations.length === 0) return null;

  return (
    <div className="space-y-2">
      {explanations.map((exp, i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <span className="font-medium text-gray-900">
              {exp.concept.replace(/_/g, ' ')}
            </span>
            <span className="text-gray-400">{openIndex === i ? '−' : '+'}</span>
          </button>
          {openIndex === i && (
            <div className="px-4 py-3 space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">いつ必要？</span>
                <p className="text-gray-600">{exp.when_needed}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">イメージ</span>
                <p className="text-gray-600">{exp.analogy}</p>
              </div>
              {exp.vs_alternative && (
                <div>
                  <span className="font-medium text-gray-700">
                    vs {exp.vs_alternative.name}
                  </span>
                  <p className="text-gray-600">{exp.vs_alternative.difference}</p>
                </div>
              )}
              <button
                onClick={() => navigate(`/concepts/${exp.concept}`)}
                className="text-blue-600 hover:underline text-xs"
              >
                詳しく見る →
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

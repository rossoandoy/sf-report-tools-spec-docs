import type { ScenarioStep } from '@sf-report-tools/types';

export function StepList({ steps }: { steps: ScenarioStep[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step) => (
        <li key={step.step} className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
            {step.step}
          </span>
          <div className="flex-1 pt-0.5">
            <h4 className="font-semibold text-gray-900">{step.action}</h4>
            <p className="text-sm text-gray-600 mt-0.5">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

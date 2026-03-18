import type { WizardStep } from '../context/GoalSeekContext';

const STEPS: Array<{ key: WizardStep; label: string; number: number }> = [
  { key: 'upload', label: 'ファイルアップロード', number: 1 },
  { key: 'matching', label: 'マッチング確認', number: 2 },
  { key: 'result', label: '分析結果', number: 3 },
];

interface Props {
  current: WizardStep;
}

export function WizardStepper({ current }: Props) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {STEPS.map((step, idx) => {
        const isActive = idx === currentIdx;
        const isDone = idx < currentIdx;

        return (
          <div key={step.key} className="flex items-center gap-2">
            {idx > 0 && (
              <div
                className={`h-0.5 w-8 ${isDone ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : isDone
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isDone ? '\u2713' : step.number}
              </div>
              <span
                className={`text-sm ${
                  isActive ? 'font-semibold text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

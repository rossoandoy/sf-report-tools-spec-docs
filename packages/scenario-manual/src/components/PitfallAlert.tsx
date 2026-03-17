export function PitfallAlert({ pitfalls }: { pitfalls: string[] }) {
  if (pitfalls.length === 0) return null;

  return (
    <div className="space-y-2">
      {pitfalls.map((pitfall, i) => (
        <div
          key={i}
          className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm"
        >
          <span className="shrink-0 text-amber-500">⚠</span>
          <p className="text-amber-800">{pitfall}</p>
        </div>
      ))}
    </div>
  );
}

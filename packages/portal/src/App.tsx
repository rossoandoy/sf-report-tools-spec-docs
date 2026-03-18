const tools = [
  {
    title: 'データモデルビューア',
    description: 'ERDネットワークグラフでManabie ERPの265オブジェクト・473リレーションを可視化。ドメインフィルタと検索で素早く探索。',
    href: '/schema-explorer/',
    icon: '🔍',
    phase: 'Phase 0',
  },
  {
    title: '業務シナリオマニュアル',
    description: '30の業務シナリオから、目的に合ったSalesforceレポートの作成手順をステップバイステップで案内。',
    href: '/scenario-manual/',
    icon: '📋',
    phase: 'Phase 1',
  },
  {
    title: 'ゴールシーク',
    description: '欲しいレポート出力（Excel/CSV）をアップロードすると、SFレポートの設定方法を自動提案。',
    href: '/goal-seek/',
    icon: '🎯',
    phase: 'Phase 3',
  },
];

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-bold">Manabie ERP レポート活用支援ツール</h1>
          <p className="mt-2 text-gray-300">
            Salesforceレポート・ダッシュボードを業務で活用するためのツール群
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-gray-300"
            >
              <div className="text-3xl mb-3">{tool.icon}</div>
              <div className="text-xs text-gray-400 font-medium mb-1">{tool.phase}</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{tool.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{tool.description}</p>
            </a>
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-8">
        Manabie ERP Report Tools
      </footer>
    </div>
  );
}

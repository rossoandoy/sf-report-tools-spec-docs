# CLAUDE.md — Manabie ERP レポート活用支援ツール群

## プロジェクト概要

Salesforceレポート・ダッシュボードの「ユーザー駆動型導入戦略」を実装するツール群。
エンドユーザーが「レポートをマスターする」のではなく「業務のためにデータを使う」ことを支援する。

## 対象データモデル

Manabie ERPは Salesforceパッケージ製品（MANAERP__名前空間）。
テーブル定義: `data/manabie-erp-schema.json`（265オブジェクト、2,554項目）

### ドメイン分類

| ドメイン | オブジェクト数 | 項目数 | 代表オブジェクト |
|---------|-------------|-------|----------------|
| billing | 67 | 725 | Invoice, Payment, Bill_Item, Order_Group |
| lesson | 41 | 325 | Lesson, Lesson_Schedule, Class, Course_Offering |
| student | 22 | 330 | Contact, Enrollment, Student_Product |
| exam | 27 | 197 | Exam, Score_Entry, Student_Exam |
| staff | 19 | 168 | Timesheet, Payrate_Master, Time_Off_Balance |
| event | 6 | 51 | Event_Master, Event_Participant, Trial_Lesson |
| core | 13 | 276 | Account, User, Lead, Case, Campaign |

## 設計原則

### 1. モノレポ構成
```
sf-report-tools/
├── CLAUDE.md                          # このファイル
├── .claude/
│   └── rules/
│       ├── data-schema.md             # スキーマ操作時のルール
│       ├── react-components.md        # UI実装ルール
│       ├── api-integration.md         # Claude API / SF API連携ルール
│       └── testing.md                 # テスト方針
├── data/
│   ├── manabie-erp-schema.json        # テーブル定義（265 objects）
│   ├── domain-summary.json            # ドメイン別サマリ
│   ├── scenario-catalog.yaml          # 業務シナリオカタログ
│   └── sf-report-knowledge.yaml       # SFレポート機能ナレッジ
├── packages/
│   ├── schema-explorer/               # Phase 0: データモデル可視化
│   ├── scenario-manual/               # Phase 1: シナリオ型マニュアル
│   ├── report-chatbot/                # Phase 2: AI Q&A Bot
│   ├── goal-seek/                     # Phase 3: ゴールシーク型設定支援
│   └── report-generator/              # Phase 4: レポート自動生成
├── shared/
│   ├── types/                         # 共通型定義
│   ├── utils/                         # 共通ユーティリティ
│   └── hooks/                         # 共通React hooks
├── docs/
│   ├── architecture.md                # アーキテクチャ決定記録
│   ├── adr/                           # Architecture Decision Records
│   └── specs/                         # 機能仕様書（本ドキュメント群）
└── scripts/
    ├── convert-schema.py              # Excel→JSON変換
    └── validate-schema.py             # スキーマ整合性チェック
```

### 2. 追記型管理（既存原則の継承）
- `docs/architecture.md` は追記型。決定を覆す場合もDeprecated行を残す
- ADR（Architecture Decision Record）は `docs/adr/ADR-NNNN-title.md` 形式で個別ファイル
- 機能仕様書の変更履歴はGit diffで追跡

### 3. Phase間のデータ共有
- `data/` ディレクトリが全Phaseの共通基盤
- `manabie-erp-schema.json` を変更した場合、全Phaseへの影響を確認すること
- `shared/types/` の型定義は全パッケージで共有

### 4. テスト方針
- ユニットテスト: Vitest
- コンポーネントテスト: React Testing Library
- E2E: Playwright（Phase 2以降）
- スキーマ整合性: `scripts/validate-schema.py` をCI必須

### 5. 技術スタック
- フロントエンド: React 18 + TypeScript + Tailwind CSS
- グラフ描画: D3.js（schema-explorer）、Recharts（dashboard系）
- LLMバックエンド: Claude API（claude-sonnet-4-20250514）
- ベクトルDB: Chroma DB（ローカル開発）/ Zilliz Cloud（本番）
- Bot: Slack Bolt SDK
- ビルド: Vite + pnpm workspaces

### 6. コーディング規約
- 日本語コメント可（ユーザー向けテキストは日本語、内部変数名は英語）
- 型安全: `strict: true`、`any` 禁止
- コンポーネント: 関数コンポーネント + hooks のみ
- 状態管理: React Context + useReducer（小規模）、Zustand（複雑な場合）

## 命名規則

| 対象 | 規則 | 例 |
|------|------|-----|
| パッケージ名 | kebab-case | schema-explorer |
| コンポーネント | PascalCase | ObjectGraph.tsx |
| hooks | camelCase, use接頭辞 | useSchemaSearch.ts |
| 型定義 | PascalCase | ManabiObject, LookupRelation |
| テスト | *.test.ts(x) | ObjectGraph.test.tsx |
| 仕様書 | SPEC-NNNN-title.md | SPEC-0001-schema-explorer.md |
| ADR | ADR-NNNN-title.md | ADR-0001-monorepo-structure.md |

## Claudeへの指示

### やること
- 実装前に該当する仕様書（`docs/specs/SPEC-*.md`）を必ず参照する
- `data/manabie-erp-schema.json` の構造を理解してから実装する
- 新規コンポーネント追加時は `shared/types/` に型定義を追加する
- PRコメントに「影響を受けるPhase」を明記する

### やらないこと
- `data/` 配下のJSONを手動編集しない（`scripts/convert-schema.py` 経由）
- 仕様書にない機能を勝手に追加しない
- テストなしでのマージ提案をしない

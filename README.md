# Manabie ERP レポート活用支援ツール群

Salesforceレポート・ダッシュボードの**ユーザー駆動型導入戦略**を実装するツール群です。
エンドユーザーが「レポートをマスターする」のではなく「**業務のためにデータを使う**」ことを支援します。

## Phase構成

| Phase | パッケージ | 概要 | 状態 |
|-------|-----------|------|------|
| 0 | `schema-explorer` | データモデル可視化ツール — ERD表示、検索、リレーション探索 | 実装済み |
| 1 | `scenario-manual` | シナリオ型マニュアル — 業務目的からレポート設定手順を提示 | 実装済み |
| 2 | `report-chatbot` | AI Q&A Bot — 自然言語でレポートの質問に回答（Slack連携） | 未着手 |
| 3 | `goal-seek` | ゴールシーク型設定支援 — 「何を知りたいか」からレポート設定を逆算 | 実装済み |
| 4 | `report-generator` | レポート自動生成 — メタデータAPIでレポートを直接作成 | 未着手 |

## デプロイ

| ツール | URL |
|-------|-----|
| ポータル | `/` |
| データモデルビューア | `/schema-explorer/` |
| 業務シナリオマニュアル | `/scenario-manual/` |
| ゴールシーク | `/goal-seek/` |

## ディレクトリ構成

```
sf-report-tools-spec-docs/
├── CLAUDE.md                          # プロジェクト設計ドキュメント
├── package.json                       # ルートpackage.json（共通devDeps）
├── pnpm-workspace.yaml                # pnpmワークスペース定義
├── tsconfig.base.json                 # 共通TypeScript設定
├── tsconfig.json                      # プロジェクトリファレンス
├── vitest.config.ts                   # 共通テスト設定
├── data/
│   ├── manabie-erp-schema.json        # テーブル定義（265 objects, 473 lookups）
│   └── domain-summary.json            # ドメイン別サマリ
├── docs/
│   ├── architecture.md                # アーキテクチャ決定記録
│   ├── adr/                           # Architecture Decision Records
│   └── specs/                         # Phase別機能仕様書（SPEC-0000〜0004）
├── packages/
│   ├── portal/                        # ポータル（ツール一覧）
│   ├── schema-explorer/               # Phase 0
│   ├── scenario-manual/               # Phase 1
│   ├── report-chatbot/                # Phase 2
│   ├── goal-seek/                     # Phase 3
│   └── report-generator/              # Phase 4
├── shared/
│   ├── types/                         # @sf-report-tools/types — 共通型定義
│   ├── utils/                         # @sf-report-tools/utils — スキーマ操作、Lookupパス探索
│   └── hooks/                         # @sf-report-tools/hooks — 共通React hooks
└── scripts/
    ├── enrich-schema.py               # スキーマJSON補完（domain, lookups付与）
    └── validate-schema.py             # スキーマ整合性チェック（CI用）
```

## 対象データモデル

Manabie ERPはSalesforceパッケージ製品（`MANAERP__`名前空間）です。

| ドメイン | オブジェクト数 | 項目数 | 代表オブジェクト |
|---------|-------------|-------|----------------|
| billing | 67 | 725 | Invoice, Payment, Bill_Item, Order_Group |
| lesson | 41 | 325 | Lesson, Lesson_Schedule, Class, Course_Offering |
| student | 22 | 330 | Contact, Enrollment, Student_Product |
| exam | 27 | 197 | Exam, Score_Entry, Student_Exam |
| staff | 19 | 168 | Timesheet, Payrate_Master, Time_Off_Balance |
| event | 6 | 51 | Event_Master, Event_Participant, Trial_Lesson |
| core | 13 | 276 | Account, User, Lead, Case, Campaign |

**合計: 265オブジェクト / 2,554項目 / 473 Lookup関係**

## 技術スタック

- **フロントエンド**: React 19 + TypeScript 5.9 + Tailwind CSS 4
- **グラフ描画**: D3.js（schema-explorer）、Recharts（dashboard系）
- **LLMバックエンド**: Claude API（claude-sonnet-4-20250514）
- **ベクトルDB**: Chroma DB（ローカル）/ Zilliz Cloud（本番）
- **Bot**: Slack Bolt SDK
- **ビルド**: Vite 6 + pnpm workspaces
- **テスト**: Vitest 3 + React Testing Library

## セットアップ

```bash
# 前提: Node.js >= 20, pnpm >= 9
pnpm install

# スキーマ補完（domain, lookups付与）
pnpm enrich-schema

# 型チェック
pnpm typecheck

# テスト
pnpm test

# スキーマ整合性チェック
pnpm validate-schema

# サイト全体ビルド
pnpm build:site
```

## 共有パッケージ

| パッケージ | 用途 | 使用Phase |
|-----------|------|-----------|
| `@sf-report-tools/types` | 全型定義（Domain, ManabiObject, Scenario等） | 全Phase |
| `@sf-report-tools/utils` | スキーマ操作、BFS Lookupパス探索 | 0, 2, 3, 4 |
| `@sf-report-tools/hooks` | useSchemaData, useSchemaSearch | 0, 3 |

## ドキュメント

- [アーキテクチャ決定記録](docs/architecture.md)
- [ADR-0001: モノレポ構成](docs/adr/ADR-0001-monorepo-structure.md)
- 機能仕様書: `docs/specs/SPEC-0000` 〜 `SPEC-0004`

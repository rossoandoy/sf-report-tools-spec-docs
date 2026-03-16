# Manabie ERP レポート活用支援ツール群

Salesforceレポート・ダッシュボードの**ユーザー駆動型導入戦略**を実装するツール群です。
エンドユーザーが「レポートをマスターする」のではなく「**業務のためにデータを使う**」ことを支援します。

## Phase構成

| Phase | パッケージ | 概要 | 状態 |
|-------|-----------|------|------|
| 0 | `schema-explorer` | データモデル可視化ツール — ERD表示、検索、リレーション探索 | 仕様策定済 |
| 1 | `scenario-manual` | シナリオ型マニュアル — 業務目的からレポート設定手順を提示 | 仕様策定済 |
| 2 | `report-chatbot` | AI Q&A Bot — 自然言語でレポートの質問に回答（Slack連携） | 仕様策定済 |
| 3 | `goal-seek` | ゴールシーク型設定支援 — 「何を知りたいか」からレポート設定を逆算 | 仕様策定済 |
| 4 | `report-generator` | レポート自動生成 — メタデータAPIでレポートを直接作成 | 仕様策定済 |

## ディレクトリ構成

```
sf-report-tools-spec-docs/
├── CLAUDE.md                          # プロジェクト設計ドキュメント
├── data/
│   ├── manabie-erp-schema.json        # テーブル定義（265 objects, 2,554 fields）
│   └── domain-summary.json            # ドメイン別サマリ
├── docs/
│   ├── architecture.md                # アーキテクチャ決定記録
│   ├── adr/                           # Architecture Decision Records
│   └── specs/                         # Phase別機能仕様書（SPEC-0000〜0004）
├── packages/
│   ├── schema-explorer/               # Phase 0
│   ├── scenario-manual/               # Phase 1
│   ├── report-chatbot/                # Phase 2
│   ├── goal-seek/                     # Phase 3
│   └── report-generator/              # Phase 4
├── shared/
│   ├── types/                         # 共通型定義
│   ├── utils/                         # 共通ユーティリティ
│   └── hooks/                         # 共通React hooks
└── scripts/                           # ビルド・変換スクリプト
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

**合計: 265オブジェクト / 2,554項目**

## 技術スタック

- **フロントエンド**: React 18 + TypeScript + Tailwind CSS
- **グラフ描画**: D3.js（schema-explorer）、Recharts（dashboard系）
- **LLMバックエンド**: Claude API（claude-sonnet-4-20250514）
- **ベクトルDB**: Chroma DB（ローカル）/ Zilliz Cloud（本番）
- **Bot**: Slack Bolt SDK
- **ビルド**: Vite + pnpm workspaces

## セットアップ

> 各パッケージの実装は今後進行予定です。セットアップ手順は実装に合わせて追記します。

## ドキュメント

- [アーキテクチャ決定記録](docs/architecture.md)
- [ADR-0001: モノレポ構成](docs/adr/ADR-0001-monorepo-structure.md)
- 機能仕様書: `docs/specs/SPEC-0000` 〜 `SPEC-0004`

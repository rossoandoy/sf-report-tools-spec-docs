# アーキテクチャ決定記録

## 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    data/ （共通基盤層）                       │
│  manabie-erp-schema.json │ scenario-catalog.yaml            │
│  domain-summary.json     │ sf-report-knowledge.yaml         │
├─────────────────┬───────────┬───────────┬───────────────────┤
│ schema-explorer │ scenario  │ report    │ goal-seek         │
│ (Phase 0)       │ -manual   │ -chatbot  │ (Phase 3)         │
│ React+D3.js     │ (Phase 1) │ (Phase 2) │ React+Claude API  │
│                 │ Static    │ Slack Bot │                   │
│                 │ Site      │ +Claude   │                   │
│                 │           │ API+RAG   │                   │
├─────────────────┴───────────┴───────────┴───────────────────┤
│                report-generator (Phase 4)                    │
│  Claude Code + SF Metadata API + GitHub Actions              │
└─────────────────────────────────────────────────────────────┘
```

## 決定ログ

| # | 日付 | 決定 | 理由 | 関連ADR |
|---|------|------|------|---------|
| 1 | 2026-03-15 | モノレポ（pnpm workspaces） | Phase間でスキーマ型定義・ユーティリティを共有するため | ADR-0001 |
| 2 | 2026-03-15 | data/をPhase 0で先行構築 | 全Phaseの共通基盤。JSON化すればRAG・マッチング・可視化すべてに再利用可能 | ADR-0002 |
| 3 | 2026-03-15 | シナリオカタログをYAML管理 | 構造化データとして機械可読。Git diffで差分追跡。LLMプロンプトに直接注入可能 | ADR-0003 |
| 4 | 2026-03-15 | Claude API（Sonnet 4）をLLMバックエンドに採用 | 既存Pro契約活用。日本語品質。コスト最適化 | ADR-0004 |
| 5 | 2026-03-15 | Phase 4はDevOps Center統合構想の拡張として実装 | 既存の追記型管理表・GitHub Actions基盤を再利用 | ADR-0005 |

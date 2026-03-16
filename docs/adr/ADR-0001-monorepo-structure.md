# ADR-0001: モノレポ構成の採用

## ステータス: Accepted
## 日付: 2026-03-15

## コンテキスト

ユーザー駆動型レポート導入戦略は4つのPhaseで構成され、各Phaseは独立したアプリケーションとして開発される。
一方で、全Phaseは共通のデータ基盤（manabie-erp-schema.json, scenario-catalog.yaml）と
共通の型定義を使用する。

## 選択肢

1. **モノレポ（pnpm workspaces）** — 全Phaseを1リポジトリで管理
2. **マルチレポ** — Phase別に独立リポジトリ
3. **Git submodules** — 共通部分をsubmoduleとして共有

## 決定

**選択肢1: モノレポ（pnpm workspaces）を採用する。**

## 理由

- `data/` ディレクトリのスキーマJSON・YAMLを全Phaseで直接参照できる
- `shared/types/` の型定義を変更すると、全Phaseで即座に型チェックが走る
- Phase 0（データモデル可視化）の成果物がPhase 2（RAG知識ベース）に直接利用される
- 既存のDevOps Center統合構想リポジトリ（manabie-erp-salesforce/）とは別リポジトリとする。本リポジトリはツール群であり、Salesforceメタデータは含まない
- CI/CDはPhase単位で独立実行可能（changed filesベースのトリガー）

## 結果

- `pnpm-workspace.yaml` でパッケージ管理
- TypeScriptのproject referencesで型チェックの高速化
- Vercel/GitHub Pagesへのデプロイはパッケージ単位

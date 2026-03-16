# SPEC-0002: Phase 2 — AIチャットボット（レポートQ&A）

## ステータス: Draft
## 優先度: P1
## 見積期間: 6週間
## 依存: SPEC-0000（スキーマJSON）, SPEC-0001（シナリオカタログ + 知識YAML）

---

## 1. 目的

自然言語で「こんなレポートが欲しい」と質問すると、Manabie ERPのデータモデルを踏まえた
具体的なレポート作成手順を回答するAIアシスタント。

## 2. 成果物

| 成果物 | パス | 用途 |
|--------|------|------|
| Slack Bot | `packages/report-chatbot/slack-bot/` | Slackチャネルでの対話 |
| RAG知識ベース | `packages/report-chatbot/knowledge/` | ベクトル化済みナレッジ |
| インデクサー | `packages/report-chatbot/indexer/` | JSONとYAMLのベクトル化 |

## 3. アーキテクチャ

```
[ユーザー質問 (Slack)]
       ↓
[Slack Bolt SDK (Node.js)]
       ↓
[RAG検索]─────────────────────────────┐
  ├── manabie-erp-schema.json chunks  │
  ├── scenario-catalog.yaml chunks    │ Chroma DB
  └── sf-report-knowledge.yaml chunks │
       ↓                              │
[コンテキスト構築]←────────────────────┘
  ├── 関連オブジェクト定義（項目・Lookup）
  ├── 類似シナリオ（手順付き）
  └── SF概念解説
       ↓
[Claude API (claude-sonnet-4-20250514)]
  system: "あなたはManabie ERPのSalesforceレポート専門家です..."
  context: [RAG結果]
  user: [ユーザー質問]
       ↓
[回答整形 → Slack応答]
```

## 4. 知識ベース構築仕様

### 4.1 チャンク戦略

| ソース | チャンク単位 | チャンク数（概算） |
|--------|------------|------------------|
| manabie-erp-schema.json | オブジェクト単位（fields + lookups） | 265 |
| scenario-catalog.yaml | シナリオ単位（全フィールド） | 30+ |
| sf-report-knowledge.yaml | 概念単位（concept + examples） | 10+ |

### 4.2 Embedding

- モデル: `sentence-transformers/multilingual-e5-large`（日本語対応）
- ベクトルDB: Chroma DB（ローカル開発）、Zilliz Cloud Free Tier（本番）
- メタデータ: `{ source, domain, object_api_name, scenario_id, concept_name }`

### 4.3 インデクシングスクリプト

```typescript
// packages/report-chatbot/indexer/index.ts
interface ChunkMetadata {
  source: 'schema' | 'scenario' | 'knowledge';
  domain?: Domain;
  object_api_name?: string;
  scenario_id?: string;
  concept_name?: string;
}

// スキーマチャンク: オブジェクトごとに1チャンク
// 内容: "Invoice (MANAERP__Invoice__c): 請求書オブジェクト。35項目。
//        主要項目: Amount(Currency), Status(Picklist:Draft/Sent/Paid/Overdue), ...
//        Lookup先: Contact(生徒), Invoice_Schedule_Master(請求スケジュール), ...
//        Lookup元: Payment(入金), Invoice_Bill_Item(請求明細), ..."

// シナリオチャンク: シナリオごとに1チャンク
// 内容: シナリオ全文（title, description, objects, steps, pitfalls含む）

// 知識チャンク: 概念ごとに1チャンク
// 内容: 概念定義 + 業務言葉 + アナロジー + Manabie具体例
```

## 5. Claude API呼び出し仕様

### 5.1 System Prompt

```
あなたはManabie ERP（Salesforce上の学習塾向けERPパッケージ）のレポート・ダッシュボード専門アドバイザーです。

## あなたの役割
- ユーザーの「業務上の目的」を理解し、それを実現するSalesforceレポートの作成手順を具体的に案内する
- Salesforce固有の概念（カスタムレポートタイプ、結合レポート、バケット行、数式等）は、業務言葉で説明する
- Manabie ERPのオブジェクト構造（MANAERP__名前空間）を正確に参照する

## 回答の構成
1. 目的の確認（ユーザーがやりたいことの要約）
2. 使用するオブジェクトとその関係
3. 必要なSF機能の説明（業務言葉で）
4. ステップバイステップの手順
5. よくあるつまずきポイント（該当する場合）
6. 関連する発展シナリオの提案

## 制約
- 実データ（個人情報等）は一切参照しない
- 不確実な場合は「確認してください」と明示する
- レポート以外のSF設定（Flow、権限等）は範囲外として案内する
```

### 5.2 コンテキスト注入テンプレート

```
## 関連オブジェクト定義
{RAG結果: スキーマチャンク}

## 類似シナリオ
{RAG結果: シナリオチャンク（上位3件）}

## SF概念リファレンス
{RAG結果: 知識チャンク（上位2件）}

## ユーザー質問
{ユーザーの質問文}
```

## 6. Slack Bot仕様

### 6.1 コマンド

| トリガー | 動作 |
|---------|------|
| `/report-help <質問>` | RAG検索 + Claude API → 回答をスレッドに投稿 |
| `/report-scenario <ドメイン>` | そのドメインのシナリオ一覧を表示 |
| `/report-concept <概念名>` | SF概念の解説を表示 |

### 6.2 対話フロー

```
User: /report-help 生徒ごとの未収金を確認したい

Bot: 🔍 検索中... 関連情報を確認しています

Bot:
📊 **生徒別未収金一覧レポート**

**使用オブジェクト:**
- Invoice（MANAERP__Invoice__c）— 請求書
- Payment（MANAERP__Payment__c）— 入金
- Contact — 生徒

**必要な準備:**
カスタムレポートタイプ「Invoice with Payment」を作成します。
これは「Lookupで繋がる複数テーブルを1つのレポートで見る設計図」です。

**手順:**
1️⃣ 設定 → レポートタイプ → 新規
   主オブジェクト: Invoice
   関連: Payment（with or without ← 重要！入金なし=未収金を含めるため）

2️⃣ レポートタブ → 新規 → 上記レポートタイプを選択

3️⃣ フィルタ: ステータス ≠ 入金済

4️⃣ グループ化: 生徒名（Contact.Name）

5️⃣ 集計数式: 請求額合計 - 入金額合計 = 未収金額

⚠️ **よくあるつまずき:**
- 「with or without」を設定し忘れると、入金済みのレコードのみ表示されます
- 標準レポートタイプではPayment項目が見えません

💡 **次に試してみませんか？**
- 支払方法別の入金状況レポート (BIL-003)
- 月別売上推移ダッシュボード (BIL-005)
```

### 6.3 フィードバック収集

- 回答に👍👎リアクションを付与可能
- 👎の場合「何が期待と違いましたか？」をフォローアップ
- フィードバックログを `data/feedback/` に蓄積（シナリオ改善の材料）

## 7. 非機能要件

| 項目 | 要件 |
|------|------|
| 応答時間 | 初回応答（検索中表示）: 1秒以内、完全回答: 10秒以内 |
| 同時接続 | 10ユーザー同時（Slack workspace規模想定） |
| コスト | Claude API: 月$50以内（Sonnet活用、キャッシュ有効化） |
| セキュリティ | 実データをLLMに送信しない。テーブル定義+シナリオのみ |
| 可用性 | 平日9:00-21:00（塾の営業時間帯） |

## 8. 受入基準

- [ ] `/report-help 未収金` でBIL-001相当の回答が返る
- [ ] 回答にManabie ERP固有のオブジェクト名（MANAERP__Invoice__c等）が正しく含まれる
- [ ] SF概念（カスタムレポートタイプ等）が業務言葉で説明されている
- [ ] 回答末尾に関連シナリオが提案される
- [ ] 👍👎フィードバックが記録される
- [ ] RAGの検索精度: 上位3件に関連シナリオが含まれる確率80%以上

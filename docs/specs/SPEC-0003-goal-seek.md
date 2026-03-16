# SPEC-0003: Phase 3 — ゴールシーク型レポート設定支援ツール

## ステータス: Draft
## 優先度: P1
## 見積期間: 6週間
## 依存: SPEC-0000（スキーマJSON）, SPEC-0001（知識YAML）

---

## 1. 目的

ユーザーが「こういう出力が欲しい」という完成形のCSV/Excelをアップロードすると、
そのデータ構造をManabie ERPのテーブル定義と照合し、
SFレポートで同等の出力を実現するための設定手順を自動生成する。

## 2. 処理フロー

```
[ユーザー] CSV/Excelアップロード
    ↓
[Step 1] ヘッダー解析
    列名を抽出し、data/manabie-erp-schema.json の
    2,554項目と fuzzy matching
    ↓
[Step 2] オブジェクト特定
    マッチした項目が属するオブジェクトを特定。
    複数オブジェクトにまたがる場合はLookupチェーンを探索
    ↓
[Step 3] レポートタイプ判定
    - 単一オブジェクト → 標準レポートタイプ
    - 複数オブジェクト（Lookup接続） → カスタムレポートタイプ
    - 複数の独立データブロック → 結合レポート
    ↓
[Step 4] 集計パターン推定
    CSVの構造を分析:
    - 小計行の存在 → バケット行 or グループ化
    - 列方向の展開 → クロス集計
    - 計算列 → レポート数式
    - 前行比較 → PREVGROUPVAL
    ↓
[Step 5] 設定手順生成
    Claude APIで手順書を生成（sf-report-knowledge.yamlを参照）
    ↓
[Step 6] 最適化提案（オプション）
    「この列はバケットより数式が効率的」等の代替案
```

## 3. 成果物

| 成果物 | パス | 用途 |
|--------|------|------|
| Webアプリ | `packages/goal-seek/` | CSVアップロード + 手順表示 |
| マッチングエンジン | `packages/goal-seek/src/matcher/` | ヘッダー↔スキーマ照合 |
| 手順生成エンジン | `packages/goal-seek/src/generator/` | Claude API連携 |

## 4. 画面仕様

### 4.1 ステップ1: アップロード画面

```
┌──────────────────────────────────────────┐
│  📤 完成形のCSV/Excelをアップロード       │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   ドラッグ&ドロップ or ファイル選択   │  │
│  │   対応形式: .csv, .xlsx, .tsv       │  │
│  └────────────────────────────────────┘  │
│                                          │
│  💡 ヒント: Excelで「こんな表が欲しい」  │
│     を作ってアップロードしてください      │
└──────────────────────────────────────────┘
```

### 4.2 ステップ2: マッチング確認画面

```
┌──────────────────────────────────────────────────────┐
│  📋 ヘッダーとManabie ERPオブジェクトの照合結果       │
│                                                      │
│  CSV列名        →  Manabie項目           信頼度      │
│  ──────────────────────────────────────────────────  │
│  生徒名          →  Contact.Name          ✅ 98%     │
│  請求月          →  Invoice.Invoice_Date   ✅ 92%    │
│  請求額          →  Invoice.Amount         ✅ 95%    │
│  入金額          →  Payment.Amount         ✅ 90%    │
│  未収金          →  （計算列）             ⚠️ 推定   │
│  支払方法        →  Payment.Method         ✅ 88%    │
│                                                      │
│  ⚠️ 「未収金」は計算列と推定されました。              │
│     レポート数式で「請求額 - 入金額」として実現します  │
│                                                      │
│  検出オブジェクト: Contact, Invoice, Payment          │
│  → カスタムレポートタイプが必要です                    │
│                                                      │
│  [修正する] [この照合で手順を生成 →]                  │
└──────────────────────────────────────────────────────┘
```

### 4.3 ステップ3: 手順表示画面

```
┌──────────────────────────────────────────────────────┐
│  📝 レポート設定手順                                  │
│                                                      │
│  レポートタイプ: カスタムレポートタイプ                │
│  理由: Invoice, Payment, Contact を結合するため       │
│                                                      │
│  ─── Step 1: カスタムレポートタイプ作成 ──────────── │
│  設定 → レポートタイプ → 新規                        │
│  主: MANAERP__Invoice__c                             │
│  関連: MANAERP__Payment__c (with or without)          │
│  ...                                                 │
│                                                      │
│  ─── Step 5: 数式列の追加 ──────────────────────── │
│  列メニュー → 集計数式                               │
│  名前: 未収金                                        │
│  数式: SUM(Amount) - SUM(Payment_Amount)             │
│                                                      │
│  💡 最適化提案:                                      │
│  「支払方法」列はバケット行でグルーピングするより     │
│   フィルタで絞り込む方がパフォーマンスが良い場合が    │
│   あります                                           │
│                                                      │
│  [手順をMarkdownでコピー] [PDFダウンロード]          │
└──────────────────────────────────────────────────────┘
```

## 5. マッチングエンジン仕様

### 5.1 マッチング戦略

```typescript
interface MatchResult {
  csv_column: string;
  matched_field: ManabiField | null;
  confidence: number;      // 0.0 - 1.0
  match_type: 'exact' | 'fuzzy' | 'computed' | 'unmapped';
  suggestion?: string;     // match_type === 'computed' の場合の計算方法
}

// マッチング優先順位:
// 1. 完全一致（label or api_name）
// 2. 日本語ラベル fuzzy match（Levenshtein distance）
// 3. 英語API名 fuzzy match
// 4. LLM推定（Claude APIで「この列名はどの項目に対応するか」を推論）
// 5. 計算列推定（「未収金」=「請求額-入金額」等のパターンマッチ）
```

### 5.2 レポートタイプ判定ロジック

```typescript
function determineReportType(matchedObjects: string[]): ReportTypeRecommendation {
  if (matchedObjects.length === 1) {
    return { type: 'standard', reason: '単一オブジェクトのため' };
  }

  // Lookupチェーンの探索
  const chain = findLookupChain(matchedObjects, schema);
  if (chain) {
    return {
      type: 'custom_report_type',
      reason: `${chain.join(' → ')} のLookup関係で結合`,
      definition: buildCustomReportTypeDef(chain)
    };
  }

  // Lookupで繋がらない場合
  return {
    type: 'joined_report',
    reason: '直接のLookup関係がないため横並び比較',
    blocks: matchedObjects.map(obj => ({ object: obj, type: 'standard_or_custom' }))
  };
}
```

### 5.3 集計パターン推定

```typescript
interface AggregationPattern {
  type: 'grouping' | 'bucket' | 'cross_filter' | 'formula' | 'prevgroupval';
  target_column: string;
  detail: string;
}

// CSVの構造分析:
// - 同じ列に繰り返し値がある → grouping候補
// - 小計行（合計、平均等のラベル） → summary formula
// - 列ヘッダーが日付/月名の連続 → cross_filter or joined_report
// - 前行との差分列 → PREVGROUPVAL
// - 比率列（%表記） → PARENTGROUPVAL or カスタム数式
```

## 6. Claude API呼び出し仕様

### 6.1 手順生成プロンプト

```
## コンテキスト
ユーザーがアップロードしたCSVのヘッダーと、Manabie ERPオブジェクトの照合結果:
{matchResults}

レポートタイプ判定結果:
{reportTypeRecommendation}

集計パターン推定結果:
{aggregationPatterns}

## SF レポート知識
{sf-report-knowledge.yaml の該当部分}

## 指示
上記の照合結果と判定に基づいて、このCSVと同等の出力をSalesforceレポートで
実現するためのステップバイステップ手順を生成してください。

各ステップには:
1. 操作対象（設定画面のパス）
2. 具体的な設定値
3. なぜその設定が必要かの説明（業務言葉で）
を含めてください。

最後に「最適化提案」として、より効率的な方法があれば提示してください。
```

## 7. 非機能要件

| 項目 | 要件 |
|------|------|
| CSV解析 | 10,000行以内のCSVを5秒以内にヘッダー解析 |
| マッチング | 2,554項目との照合を3秒以内 |
| 手順生成 | Claude API応答含め15秒以内 |
| ファイルサイズ | アップロード上限: 10MB |
| セキュリティ | CSVデータはブラウザ上のみで処理（サーバー送信はヘッダーのみ） |

## 8. 受入基準

- [ ] CSV（5列以上）をアップロードするとヘッダー解析結果が表示される
- [ ] 信頼度80%以上のマッチが全列の70%以上を占めること
- [ ] 単一オブジェクト/複数オブジェクト/計算列の3パターンで正しく判定される
- [ ] 生成された手順がステップバイステップで実行可能な粒度であること
- [ ] 「未収金一覧」「月別売上」「科目別受講者数」の3つのサンプルCSVで正しい手順が生成される

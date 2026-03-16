# SPEC-0000: Phase 0 — テーブル定義JSON化 + データモデル可視化

## ステータス: Draft
## 優先度: P0（全Phaseの前提）
## 見積期間: 2週間

---

## 1. 目的

Manabie ERPテーブル定義Excel（276オブジェクト、2,594項目）を構造化JSONに変換し、
オブジェクト間のLookup関係をインタラクティブに探索できるWebアプリを構築する。
このJSONと可視化が、Phase 1〜4すべての共通基盤となる。

## 2. 成果物

| 成果物 | パス | 用途 |
|--------|------|------|
| スキーマJSON | `data/manabie-erp-schema.json` | 全Phaseの共通データソース |
| ドメインサマリJSON | `data/domain-summary.json` | ドメイン別フィルタリング |
| 変換スクリプト | `scripts/convert-schema.py` | Excel更新時の再生成 |
| 検証スクリプト | `scripts/validate-schema.py` | CI用整合性チェック |
| Webアプリ | `packages/schema-explorer/` | インタラクティブ可視化 |

## 3. スキーマJSON仕様

### 3.1 トップレベル構造
```typescript
// data/manabie-erp-schema.json
type SchemaFile = Record<string, ManabiObject>;

interface ManabiObject {
  name: string;            // 表示名（例: "Invoice"）
  api_name: string;        // API名（例: "MANAERP__Invoice__c"）
  domain: Domain;          // ドメイン分類
  fields: ManabiField[];
  lookups: LookupRelation[];
}

type Domain = 'billing' | 'lesson' | 'student' | 'exam' | 'staff' | 'event' | 'core' | 'other';

interface ManabiField {
  api_name: string;        // フル修飾API名
  label: string;           // ラベル
  type: FieldType;         // データ型
  required: boolean;
  length?: number;
  referenceTo?: string;    // Lookup先オブジェクトAPI名
  picklistValues?: string; // カンマ区切り
  description?: string;
}

type FieldType = 'Text' | 'Number' | 'Currency' | 'Date' | 'DateTime' | 'Checkbox'
  | 'Picklist' | 'MultiselectPicklist' | 'Lookup' | 'MasterDetail'
  | 'Formula' | 'Email' | 'Phone' | 'Url' | 'TextArea' | 'LongTextArea'
  | 'RichTextArea' | 'AutoNumber' | 'Percent' | 'Geolocation';

interface LookupRelation {
  field: string;           // Lookup項目のAPI名
  source: string;          // 参照元オブジェクトAPI名
  target: string;          // 参照先オブジェクトAPI名
  type: 'Lookup' | 'MasterDetail';
}
```

### 3.2 ドメインサマリ構造
```typescript
// data/domain-summary.json
interface DomainSummary {
  [domain: string]: {
    object_count: number;
    total_fields: number;
    objects: string[];      // API名のリスト
  };
}
```

## 4. 変換スクリプト仕様

### 4.1 convert-schema.py
- 入力: `ManabieERP_table_definition.xlsx`（tableDefinition_* シート）
- 出力: `data/manabie-erp-schema.json`, `data/domain-summary.json`
- 処理:
  1. MANAERP__名前空間 + 標準オブジェクト（Account, Contact等）のみ抽出
  2. ドメイン分類をAPI名のキーワードマッチングで自動付与
  3. Lookup/MasterDetail関係を抽出してlookups配列に格納
  4. description列にメタデータ的でない値（コメント等）が混在している場合は除外
- 冪等性: 同一Excelから何度実行しても同一JSONを出力すること

### 4.2 validate-schema.py
- 検証項目:
  - 全Lookupの参照先オブジェクトがスキーマ内に存在すること
  - ドメイン分類が全オブジェクトに付与されていること
  - 必須項目（name, api_name, fields）が全オブジェクトに存在すること
  - JSON Schema準拠であること
- CI連携: `exit 0` で成功、`exit 1` で失敗（エラー詳細をstderrに出力）

## 5. schema-explorer Webアプリ仕様

### 5.1 画面構成

```
┌──────────────────────────────────────────────────────┐
│ [ドメインフィルタ] [検索バー]            [表示モード] │
├───────────────────────┬──────────────────────────────┤
│                       │                              │
│   ネットワークグラフ    │   オブジェクト詳細パネル      │
│   (D3.js force)       │   ・オブジェクト名            │
│                       │   ・項目一覧（型、必須、参照先）│
│   ノード = オブジェクト │   ・Lookup先/元の一覧         │
│   エッジ = Lookup関係  │   ・所属ドメイン              │
│   色 = ドメイン       │   ・レポート可能性ヒント       │
│                       │                              │
├───────────────────────┴──────────────────────────────┤
│ [選択中のLookupチェーン表示]                           │
│ Contact → Invoice → Payment（3ホップ）                │
└──────────────────────────────────────────────────────┘
```

### 5.2 機能一覧

| ID | 機能 | 優先度 | 説明 |
|----|------|--------|------|
| SE-001 | ネットワークグラフ表示 | P0 | D3.js force-directed graphで全オブジェクトとLookup関係を表示 |
| SE-002 | ドメインフィルタ | P0 | billing/lesson/student等のドメインでフィルタリング |
| SE-003 | オブジェクト検索 | P0 | 日本語名・API名でインクリメンタルサーチ |
| SE-004 | オブジェクト詳細パネル | P0 | ノードクリックで項目一覧・Lookup関係を右パネルに表示 |
| SE-005 | Lookupチェーンハイライト | P1 | オブジェクト選択時にLookup先/元を2ホップまでハイライト |
| SE-006 | レポート可能性ヒント | P1 | 「このオブジェクト群からレポート作成可能」の表示 |
| SE-007 | Lookupパス探索 | P2 | 2オブジェクト間の最短Lookupパスを探索・表示 |
| SE-008 | エクスポート | P2 | 表示中のグラフをSVG/PNGでエクスポート |

### 5.3 非機能要件

| 項目 | 要件 |
|------|------|
| 初期表示 | 265オブジェクトを3秒以内にレンダリング |
| レスポンス | フィルタ・検索は200ms以内 |
| ブラウザ | Chrome 120+, Edge 120+, Safari 17+ |
| モバイル | レスポンシブ対応（閲覧のみ、タッチ操作対応） |
| ホスティング | 静的ファイルのみ（SPA）。GitHub Pages or Vercel |

### 5.4 技術詳細

- React 18 + TypeScript
- D3.js v7（force simulation）
- Tailwind CSS
- データ: ビルド時にJSONをバンドル（APIサーバー不要）
- 状態管理: useReducer + Context（フィルタ状態、選択オブジェクト）

## 6. 受入基準

- [ ] `scripts/convert-schema.py` がExcelから冪等にJSONを生成できる
- [ ] `scripts/validate-schema.py` がCI上で全検証パスする
- [ ] 265オブジェクトがネットワークグラフで表示される
- [ ] ドメインフィルタで7ドメインを切り替え表示できる
- [ ] オブジェクトクリックで項目一覧とLookup関係が表示される
- [ ] billingドメイン（67 objects）を選択した状態でInvoice→Payment→ContactのLookupチェーンが視覚的に追跡できる

# SPEC-0001: Phase 1 — 業務シナリオ型マニュアル + シナリオカタログ

## ステータス: Draft
## 優先度: P0
## 見積期間: 4週間
## 依存: SPEC-0000（data/manabie-erp-schema.json）

---

## 1. 目的

「レポートタイプの選び方」ではなく「未収金を確認したい」等の業務ゴール起点でレポート作成手順を提供する。
SF固有概念（カスタムレポートタイプ、結合レポート、数式等）は、それが必要なシナリオの中で初めて解説する。

## 2. 成果物

| 成果物 | パス | 用途 |
|--------|------|------|
| シナリオカタログYAML | `data/scenario-catalog.yaml` | 全Phase共通のシナリオ定義 |
| SFレポート知識YAML | `data/sf-report-knowledge.yaml` | SF機能→業務言葉の翻訳辞書 |
| マニュアルサイト | `packages/scenario-manual/` | 静的サイト（検索付き） |

## 3. シナリオカタログ仕様

### 3.1 YAML構造
```yaml
# data/scenario-catalog.yaml
version: "1.0"
last_updated: "2026-03-15"

scenarios:
  - id: "BIL-001"
    domain: "billing"
    title: "生徒別未収金一覧"
    description: "請求済みだが入金が完了していない生徒ごとの未収金額を一覧表示する"
    user_story: "校舎管理者として、月末に未収金のある生徒を確認し、保護者に連絡したい"
    difficulty: "intermediate"  # basic | intermediate | advanced
    
    # 使用するオブジェクトとその関係
    objects:
      primary: "MANAERP__Invoice__c"
      related:
        - object: "MANAERP__Payment__c"
          relation: "Lookup (Invoice → Payment)"
        - object: "Contact"
          relation: "Lookup (Invoice → Contact)"
    
    # 必要なSF機能
    sf_features:
      report_type: "custom"  # standard | custom | joined
      custom_report_type_definition:
        primary: "MANAERP__Invoice__c"
        related: "MANAERP__Payment__c (Lookup)"
        with_or_without: "with_or_without"  # invoiceがあってpaymentがない = 未収金
      grouping: ["Contact.Name"]
      summary_formula: "SUM(MANAERP__Invoice__c.MANAERP__Amount__c) - SUM(MANAERP__Payment__c.MANAERP__Amount__c)"
      filters:
        - field: "MANAERP__Invoice__c.MANAERP__Status__c"
          operator: "not_equal"
          value: "Paid"
      bucket_fields: []
      cross_filter: false
    
    # よくあるつまずきポイント
    pitfalls:
      - "カスタムレポートタイプを作成せずに標準レポートタイプで試みて、Payment項目が表示されない"
      - "with_or_without の設定を忘れて、入金済みレコードのみ表示される"
    
    # SF概念の解説（このシナリオで初出の場合）
    concept_explanations:
      - concept: "custom_report_type"
        when_needed: "InvoiceとPaymentのように、Lookupで繋がる2つのオブジェクトのデータを1つのレポートで見たい場合"
        analogy: "Excelで2つのシートをVLOOKUPで結合するイメージ。SFではレポートタイプが結合の設計図になる"
        vs_alternative:
          name: "joined_report"
          difference: "カスタムレポートタイプは「縦の結合」（リレーションで繋がるデータを1枚に）。結合レポートは「横の比較」（独立したデータを並べて比較）"

    # 手順（ステップバイステップ）
    steps:
      - step: 1
        action: "カスタムレポートタイプの作成"
        detail: "設定 → レポートタイプ → 新規。主オブジェクト: Invoice、関連オブジェクト: Payment（with or without）"
        screenshot_hint: "report-type-builder"
      - step: 2
        action: "レポート新規作成"
        detail: "レポートタブ → 新規レポート → 作成したレポートタイプを選択"
        screenshot_hint: "report-builder-select-type"
      - step: 3
        action: "フィルタ設定"
        detail: "ステータス ≠ 入金済 のフィルタを追加"
        screenshot_hint: "report-filter"
      - step: 4
        action: "グループ化"
        detail: "生徒名（Contact.Name）でグループ化"
        screenshot_hint: "report-grouping"
      - step: 5
        action: "集計数式の追加"
        detail: "列ヘッダーメニュー → 集計数式 → 請求額合計 - 入金額合計"
        screenshot_hint: "report-formula"
    
    # 関連シナリオ
    related_scenarios: ["BIL-002", "BIL-003"]
    
    tags: ["未収金", "請求", "入金", "カスタムレポートタイプ"]
```

### 3.2 シナリオID体系

| プレフィックス | ドメイン | 初期シナリオ数目標 |
|-------------|---------|-----------------|
| BIL | 請求・決済 | 8 |
| LES | 授業・レッスン | 6 |
| EXM | 成績・試験 | 5 |
| STF | スタッフ勤怠 | 4 |
| ENR | 入退塾管理 | 4 |
| EVT | イベント | 3 |
| 合計 | | 30 |

### 3.3 difficulty定義

| レベル | 定義 | SF機能の範囲 |
|--------|------|-------------|
| basic | 標準レポートタイプ + フィルタ + グループ化のみ | 新規レポート作成の基本操作 |
| intermediate | カスタムレポートタイプ or バケット行 or 集計数式 | 1つのSF固有概念を使用 |
| advanced | 結合レポート or クロス集計 or 複数数式の組み合わせ | 複数のSF固有概念を組み合わせ |

## 4. SFレポート知識YAML仕様

```yaml
# data/sf-report-knowledge.yaml
version: "1.0"

# SF機能 → 業務言葉の翻訳辞書
concepts:
  custom_report_type:
    sf_name: "カスタムレポートタイプ"
    business_name: "複数テーブルの結合設計図"
    analogy: "ExcelのVLOOKUP結合をあらかじめ定義しておく仕組み"
    when_to_use: "Lookupで繋がる複数オブジェクトのデータを1つのレポートで見たい場合"
    vs:
      - name: "結合レポート"
        short: "カスタムレポートタイプ＝縦の結合、結合レポート＝横の比較"
    common_mistakes:
      - "標準レポートタイプで試みて参照先の項目が見えない"
      - "with_or_without の設定を忘れる"
    manabie_examples:
      - "Invoice × Payment → 未収金一覧"
      - "Lesson × Student_Session → 出欠付き授業一覧"
      - "Exam × Score_Entry → 成績付き試験一覧"

  joined_report:
    sf_name: "結合レポート"
    business_name: "異なる角度のデータを横並び比較するレポート"
    analogy: "Excelで複数シートを横に並べて見比べるイメージ"
    when_to_use: "異なるレポートタイプのデータを1画面で比較したい場合"
    manabie_examples:
      - "4月の成績 vs 7月の成績（同一生徒の時系列比較）"
      - "今月の売上 vs 前月の売上（期間比較）"

  bucket_field:
    sf_name: "バケット行"
    business_name: "行データを分類して小計を出す"
    analogy: "Excelのピボットテーブルの行ラベルに分類条件を設定するイメージ"
    when_to_use: "既存のPicklist値とは異なる切り口で分類・小計したい場合"
    manabie_examples:
      - "支払方法を「口座振替」「クレジット」「その他」にグルーピング"
      - "学年を「小学生」「中学生」「高校生」にグルーピング"

  cross_filter:
    sf_name: "クロス集計"
    business_name: "行データを列に展開してマトリクス表示"
    analogy: "Excelのピボットテーブルの列ラベルに相当"
    when_to_use: "行 × 列のマトリクス表示が必要な場合"
    manabie_examples:
      - "校舎別 × 月別 売上マトリクス"
      - "科目別 × 学年別 受講者数マトリクス"

  report_formula:
    sf_name: "レポート数式"
    business_name: "レポート上で計算列を追加する"
    key_functions:
      - name: "PREVGROUPVAL"
        business: "前の行グループの値と比較（前月比など）"
      - name: "PARENTGROUPVAL"
        business: "親グループの値との比率（構成比など）"
    manabie_examples:
      - "PREVGROUPVAL → 前月比増減額"
      - "PARENTGROUPVAL → 校舎別構成比率"
      - "カスタム数式 → 未収率（未収金額 / 請求総額 × 100）"

# レポートタイプ選択フローチャート（decision tree）
decision_tree:
  start: "何をしたいですか？"
  nodes:
    - id: "q1"
      question: "複数のオブジェクトのデータを組み合わせて見たい？"
      yes: "q2"
      no: "standard_report"
    - id: "q2"
      question: "組み合わせたいオブジェクトはLookup/MasterDetailで繋がっている？"
      yes: "custom_report_type"
      no: "q3"
    - id: "q3"
      question: "異なる時期や異なる条件のデータを横に並べて比較したい？"
      yes: "joined_report"
      no: "custom_report_type_with_formula"
  outcomes:
    standard_report: "標準レポートタイプで十分です"
    custom_report_type: "カスタムレポートタイプを作成してください"
    joined_report: "結合レポートを使ってください"
    custom_report_type_with_formula: "カスタムレポートタイプ + レポート数式を組み合わせてください"
```

## 5. マニュアルサイト仕様

### 5.1 技術構成
- Astro（静的サイトジェネレーター）or Next.js (Static Export)
- MDXでコンテンツ管理（scenario-catalog.yamlから自動生成）
- 全文検索: Pagefind（静的サイト用）
- ホスティング: GitHub Pages / Vercel

### 5.2 ページ構成

| パス | ページ | 内容 |
|------|--------|------|
| `/` | トップ | ドメイン別シナリオ一覧 + 検索 |
| `/scenario/:id` | シナリオ詳細 | 目的→完成イメージ→手順→概念解説→つまずきポイント |
| `/concepts/:name` | SF概念ページ | 概念の解説 + 使用シナリオ一覧 |
| `/decision-tree` | 選択フロー | レポートタイプ選択のインタラクティブフローチャート |
| `/search` | 検索結果 | 全文検索結果（日本語対応） |

### 5.3 シナリオ詳細ページの構造

```
1. 目的（ユーザーストーリー形式）
   「校舎管理者として、月末に未収金のある生徒を確認し、保護者に連絡したい」

2. 完成イメージ
   レポートのスクリーンショット or モックアップ

3. ステップバイステップ手順
   各ステップにスクリーンショットとtips

4. なぜその設定か（SF概念の解説）
   「カスタムレポートタイプを使うのは、InvoiceとPaymentが
    Lookupで繋がっているから。標準レポートタイプでは
    この2つのオブジェクトを1つのレポートで見られない」

5. よくあるつまずきポイント
   FAQ形式

6. 関連シナリオ
   「この次に試してみたいレポート」
```

## 6. 受入基準

- [ ] scenario-catalog.yaml に全6ドメイン、最低30シナリオが定義されている
- [ ] sf-report-knowledge.yaml に5つのSF概念（カスタムRT、結合、バケット、クロス、数式）が定義されている
- [ ] decision-tree が正しくレポートタイプを推薦する（5パターン以上のテストケース）
- [ ] billingドメインの8シナリオがマニュアルサイトで閲覧可能
- [ ] 全文検索で日本語クエリ（例:「未収金」）が正しくヒットする
- [ ] シナリオ詳細ページの4層構造（目的→手順→概念→つまずき）が実装されている

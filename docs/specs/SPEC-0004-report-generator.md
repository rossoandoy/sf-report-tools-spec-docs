# SPEC-0004: Phase 4 — レポート自動生成パイプライン

## ステータス: Draft
## 優先度: P2
## 見積期間: 8週間
## 依存: SPEC-0000, SPEC-0001, SF DevOps Center統合構想（既存）

---

## 1. 目的

KPI定義（YAML）からSalesforce Report/Dashboard Metadata XMLを自動生成し、
SF CLIでSandboxにデプロイする。
既存のDevOps Center + Claude Code Action パイプラインと統合し、
追記型管理表への記録も自動化する。

## 2. 処理フロー

```
[KPI定義 YAML]
    ↓ Claude Code
[Report Metadata XML生成]
    ↓
[Dashboard Metadata XML生成]
    ↓
[force-app/main/default/reports/ に配置]
[force-app/main/default/dashboards/ に配置]
    ↓
[sf project deploy start --target-org sandbox]
    ↓
[GitHub PR作成]
    ↓ Claude Code Action（既存パイプライン）
[config-changelog.md 自動追記]
[migration-checklist.md 自動追記]
[test-impact-log.md 自動追記]
```

## 3. KPI定義YAML仕様

```yaml
# kpi-definitions/billing-kpis.yaml
version: "1.0"
kpi_set: "billing_monthly"
description: "請求・決済の月次KPIダッシュボード"

reports:
  - id: "RPT-BIL-001"
    name: "月別売上集計"
    folder: "Manabie_Billing_Reports"
    report_type:
      type: "custom"
      primary_object: "MANAERP__Bill_Item__c"
      related_objects:
        - object: "MANAERP__Order_Group__c"
          relationship: "Lookup"
    columns:
      - field: "MANAERP__Bill_Item__c.MANAERP__Amount__c"
        aggregate: "SUM"
      - field: "MANAERP__Bill_Item__c.MANAERP__Billing_Period__c"
        aggregate: "GROUP"
      - field: "Account.Name"
        aggregate: "GROUP"
    filters:
      - field: "MANAERP__Bill_Item__c.MANAERP__Status__c"
        operator: "equals"
        value: "Confirmed"
    groupings:
      rows:
        - field: "Account.Name"
          sort_order: "Asc"
      columns:
        - field: "MANAERP__Bill_Item__c.MANAERP__Billing_Period__c"
          sort_order: "Asc"
    format: "MATRIX"
    chart:
      type: "VerticalColumn"
      grouping: "MANAERP__Bill_Item__c.MANAERP__Billing_Period__c"

  - id: "RPT-BIL-002"
    name: "未収金一覧"
    folder: "Manabie_Billing_Reports"
    report_type:
      type: "custom"
      primary_object: "MANAERP__Invoice__c"
      related_objects:
        - object: "MANAERP__Payment__c"
          relationship: "Lookup"
          join_type: "with_or_without"
    columns:
      - field: "Contact.Name"
      - field: "MANAERP__Invoice__c.MANAERP__Amount__c"
        aggregate: "SUM"
      - field: "MANAERP__Payment__c.MANAERP__Amount__c"
        aggregate: "SUM"
    summary_formulas:
      - name: "Outstanding_Amount"
        label: "未収金額"
        formula: "MANAERP__Invoice__c.MANAERP__Amount__c:SUM - MANAERP__Payment__c.MANAERP__Amount__c:SUM"
        format: "Currency"
    filters:
      - field: "MANAERP__Invoice__c.MANAERP__Status__c"
        operator: "not_equals"
        value: "Paid"
    groupings:
      rows:
        - field: "Contact.Name"
    format: "SUMMARY"

dashboard:
  name: "月次請求KPIダッシュボード"
  folder: "Manabie_Billing_Dashboards"
  components:
    - report_id: "RPT-BIL-001"
      type: "Chart"
      position: { row: 0, col: 0, width: 6, height: 4 }
    - report_id: "RPT-BIL-002"
      type: "Table"
      position: { row: 0, col: 6, width: 6, height: 4 }
```

## 4. Metadata XML生成仕様

### 4.1 Report XML テンプレート

Claude Codeが `data/manabie-erp-schema.json` を参照しながら、
KPI定義YAMLの各reportエントリから以下のXMLを生成する。

```xml
<!-- force-app/main/default/reports/Manabie_Billing_Reports/RPT_BIL_001.report-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<Report xmlns="http://soap.sforce.com/2006/04/metadata">
    <name>月別売上集計</name>
    <reportType>{カスタムレポートタイプAPI名}</reportType>
    <format>Matrix</format>
    <columns>
        <field>{項目API名}</field>
        <aggregateTypes>Sum</aggregateTypes>
    </columns>
    <groupingsDown>
        <field>{グループ化項目API名}</field>
        <sortOrder>Asc</sortOrder>
        <dateGranularity>Day</dateGranularity>
    </groupingsDown>
    <filter>
        <criteriaItems>
            <column>{フィルタ項目API名}</column>
            <columnToColumn>false</columnToColumn>
            <isUnlocked>true</isUnlocked>
            <operator>equals</operator>
            <value>{フィルタ値}</value>
        </criteriaItems>
    </filter>
    <chart>
        <chartType>VerticalColumn</chartType>
        <groupingColumn>{チャートグループ項目}</groupingColumn>
    </chart>
</Report>
```

### 4.2 生成時のバリデーション

Claude Codeは生成前に以下を検証する:
1. KPI定義内の全項目API名が `manabie-erp-schema.json` に存在すること
2. Lookup関係が実際のスキーマと一致すること
3. 集計関数が項目のデータ型と互換であること（Currency/Number項目にのみSUM等）
4. カスタムレポートタイプが必要な場合、そのメタデータも同時生成すること

## 5. DevOps Center統合

### 5.1 GitHub Actions ワークフロー

```yaml
name: Report Auto-Generation
on:
  push:
    paths:
      - 'kpi-definitions/**'

jobs:
  generate-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate Report Metadata
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: |
            kpi-definitions/ 配下の変更されたYAMLファイルを分析し、
            以下を実行してください。
            
            1. data/manabie-erp-schema.json を参照して項目の存在を確認
            2. Report Metadata XMLを生成し force-app/main/default/reports/ に配置
            3. Dashboard Metadata XMLを生成し force-app/main/default/dashboards/ に配置
            4. カスタムレポートタイプが必要な場合はそのXMLも生成
            5. docs/config-changelog.md に変更行を追記
            6. docs/migration-checklist.md に移送対象を追記
            
            生成したXMLはSalesforce Metadata API形式に準拠すること。
            docs/ への追記は追記型ルールに従うこと（既存行は変更しない）。
      
      - name: Deploy to Sandbox
        run: sf project deploy start --target-org sandbox --source-dir force-app/
```

### 5.2 追記型管理表への記録フォーマット

```markdown
<!-- config-changelog.md への追記例 -->
| 45 | 2026-05-10 | #89 | WI-030 | Report | 新規 | RPT-BIL-001 月別売上集計（Matrix, Bill_Item base） | ⬜ 未移送 | KPI定義から自動生成 |
| 46 | 2026-05-10 | #89 | WI-030 | Dashboard | 新規 | 月次請求KPIダッシュボード | ⬜ 未移送 | RPT-BIL-001, RPT-BIL-002 を含む |
```

## 6. 受入基準

- [ ] KPI定義YAMLからReport Metadata XMLが正しく生成される
- [ ] 生成されたXMLが `sf project deploy start` で Sandboxにデプロイ成功する
- [ ] カスタムレポートタイプが必要な場合、CustomReportType XMLも同時生成される
- [ ] 項目API名のバリデーションでスキーマに存在しない項目が検出される
- [ ] config-changelog.md, migration-checklist.md に追記型で記録される
- [ ] billing KPIセット（2レポート + 1ダッシュボード）のE2Eが成功する

/**
 * Manabie ERP スキーマ型定義
 * 全パッケージで共有する型定義
 * 
 * data/manabie-erp-schema.json の型安全なアクセスを提供
 */

// ===== ドメイン =====

export type Domain =
  | 'billing'   // 請求・決済（67 objects）
  | 'lesson'    // 授業・レッスン（41 objects）
  | 'student'   // 生徒・保護者（22 objects）
  | 'exam'      // 成績・試験（27 objects）
  | 'staff'     // スタッフ勤怠（19 objects）
  | 'event'     // イベント・活動（6 objects）
  | 'core'      // 標準オブジェクト（13 objects）
  | 'other';    // その他

export const DOMAIN_LABELS: Record<Domain, string> = {
  billing: '請求・決済',
  lesson: '授業・レッスン',
  student: '生徒・保護者',
  exam: '成績・試験',
  staff: 'スタッフ勤怠',
  event: 'イベント・活動',
  core: '標準オブジェクト',
  other: 'その他',
};

export const DOMAIN_COLORS: Record<Domain, string> = {
  billing: '#DC2626',
  lesson: '#2563EB',
  student: '#059669',
  exam: '#D97706',
  staff: '#7C3AED',
  event: '#DB2777',
  core: '#475569',
  other: '#94A3B8',
};

// ===== スキーマ =====

export type FieldType =
  | 'Text' | 'Number' | 'Currency' | 'Date' | 'DateTime'
  | 'Checkbox' | 'Picklist' | 'MultiselectPicklist'
  | 'Lookup' | 'MasterDetail' | 'Formula'
  | 'Email' | 'Phone' | 'Url'
  | 'TextArea' | 'LongTextArea' | 'RichTextArea'
  | 'AutoNumber' | 'Percent' | 'Geolocation';

export interface ManabiField {
  api_name: string;
  label: string;
  type: FieldType;
  required: boolean;
  length?: number;
  referenceTo?: string;
  picklistValues?: string;
  description?: string;
}

export interface LookupRelation {
  field: string;
  source: string;
  target: string;
  type: 'Lookup' | 'MasterDetail';
}

export interface ManabiObject {
  name: string;
  api_name: string;
  domain: Domain;
  fields: ManabiField[];
  lookups: LookupRelation[];
}

export type SchemaFile = Record<string, ManabiObject>;

export interface DomainSummary {
  [domain: string]: {
    object_count: number;
    total_fields: number;
    objects: string[];
  };
}

// ===== シナリオカタログ =====

export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export type ReportTypeKind = 'standard' | 'custom' | 'joined';

export interface ScenarioObject {
  object: string;
  relation: string;
}

export interface SfFeatures {
  report_type: ReportTypeKind;
  custom_report_type_definition?: {
    primary: string;
    related: string;
    with_or_without: 'with' | 'with_or_without';
  };
  grouping: string[];
  summary_formula?: string;
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  bucket_fields: string[];
  cross_filter: boolean;
}

export interface ScenarioStep {
  step: number;
  action: string;
  detail: string;
  screenshot_hint?: string;
}

export interface ConceptExplanation {
  concept: string;
  when_needed: string;
  analogy: string;
  vs_alternative?: {
    name: string;
    difference: string;
  };
}

export interface Scenario {
  id: string;
  domain: Domain;
  title: string;
  description: string;
  user_story: string;
  difficulty: Difficulty;
  objects: {
    primary: string;
    related: ScenarioObject[];
  };
  sf_features: SfFeatures;
  pitfalls: string[];
  concept_explanations: ConceptExplanation[];
  steps: ScenarioStep[];
  related_scenarios: string[];
  tags: string[];
}

export interface ScenarioCatalog {
  version: string;
  last_updated: string;
  scenarios: Scenario[];
}

// ===== SFレポート知識 =====

export interface SfConcept {
  sf_name: string;
  business_name: string;
  analogy: string;
  when_to_use: string;
  vs?: Array<{ name: string; short: string }>;
  common_mistakes?: string[];
  manabie_examples: string[];
}

export interface DecisionTreeNode {
  id: string;
  question: string;
  yes: string;
  no: string;
}

export interface SfReportKnowledge {
  version: string;
  concepts: Record<string, SfConcept>;
  decision_tree: {
    start: string;
    nodes: DecisionTreeNode[];
    outcomes: Record<string, string>;
  };
}

// ===== ゴールシーク =====

export type MatchType = 'exact' | 'fuzzy' | 'computed' | 'unmapped';

export interface MatchResult {
  csv_column: string;
  matched_field: ManabiField | null;
  matched_object: string | null;
  confidence: number;
  match_type: MatchType;
  suggestion?: string;
}

export interface ReportTypeRecommendation {
  type: ReportTypeKind;
  reason: string;
  definition?: {
    primary: string;
    related: string[];
    join_types: Record<string, string>;
  };
}

export interface AggregationPattern {
  type: 'grouping' | 'bucket' | 'cross_filter' | 'formula' | 'prevgroupval';
  target_column: string;
  detail: string;
}

// ===== KPI定義（Phase 4） =====

export interface KpiReportColumn {
  field: string;
  aggregate?: 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'COUNT' | 'GROUP';
}

export interface KpiReport {
  id: string;
  name: string;
  folder: string;
  report_type: {
    type: ReportTypeKind;
    primary_object: string;
    related_objects?: Array<{
      object: string;
      relationship: string;
      join_type?: string;
    }>;
  };
  columns: KpiReportColumn[];
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  groupings: {
    rows?: Array<{ field: string; sort_order: string }>;
    columns?: Array<{ field: string; sort_order: string }>;
  };
  summary_formulas?: Array<{
    name: string;
    label: string;
    formula: string;
    format: string;
  }>;
  format: 'TABULAR' | 'SUMMARY' | 'MATRIX';
  chart?: {
    type: string;
    grouping: string;
  };
}

export interface KpiDashboardComponent {
  report_id: string;
  type: 'Chart' | 'Table' | 'Metric' | 'Gauge';
  position: { row: number; col: number; width: number; height: number };
}

export interface KpiDefinition {
  version: string;
  kpi_set: string;
  description: string;
  reports: KpiReport[];
  dashboard: {
    name: string;
    folder: string;
    components: KpiDashboardComponent[];
  };
}

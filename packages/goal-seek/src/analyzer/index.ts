import type {
  MatchResult,
  ReportTypeRecommendation,
  AggregationPattern,
  SchemaFile,
} from '@sf-report-tools/types';
import { determineReportType } from './report-type';
import { detectAggregationPatterns } from './aggregation';

export interface AnalysisResult {
  reportType: ReportTypeRecommendation;
  aggregationPatterns: AggregationPattern[];
  usedObjects: string[];
}

/**
 * マッチ結果 + サンプルデータから構造分析を実行
 */
export function analyzeStructure(
  matches: MatchResult[],
  sampleRows: string[][],
  schema: SchemaFile
): AnalysisResult {
  const reportType = determineReportType(matches, schema);
  const aggregationPatterns = detectAggregationPatterns(matches, sampleRows);

  const usedObjects = Array.from(
    new Set(
      matches
        .map((m) => m.matched_object)
        .filter((o): o is string => o !== null)
    )
  );

  return { reportType, aggregationPatterns, usedObjects };
}

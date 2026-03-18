import type { ParsedSheet } from './csv-parser';

const MAX_SAMPLE_ROWS = 10;

export interface ExtractedData {
  headers: string[];
  sampleRows: string[][];
  totalRows: number;
}

/** ヘッダー + サンプル行（最大10行）を抽出 */
export function extractHeadersAndSamples(sheet: ParsedSheet): ExtractedData {
  return {
    headers: sheet.headers,
    sampleRows: sheet.rows.slice(0, MAX_SAMPLE_ROWS),
    totalRows: sheet.rows.length,
  };
}

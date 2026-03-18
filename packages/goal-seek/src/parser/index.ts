import { parseCsv } from './csv-parser';
import { parseXlsx } from './xlsx-parser';
import { extractHeadersAndSamples, type ExtractedData } from './header-extractor';

export type { ExtractedData } from './header-extractor';
export type { ParsedSheet } from './csv-parser';

/** ファイル拡張子に応じてパーサーを呼び分け、ヘッダー+サンプルを返す */
export async function parseFile(file: File): Promise<ExtractedData> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer();
    const sheet = await parseXlsx(buffer);
    return extractHeadersAndSamples(sheet);
  }

  // CSV / TSV / その他テキスト
  const text = await file.text();
  const sheet = parseCsv(text);
  return extractHeadersAndSamples(sheet);
}

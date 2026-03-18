import type { ParsedSheet } from './csv-parser';

export async function parseXlsx(buffer: ArrayBuffer): Promise<ParsedSheet> {
  // Dynamic import to avoid bundling SheetJS (~400KB) upfront
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: '',
  });

  if (data.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = data[0].map(String);
  const rows = data.slice(1).map((row) => row.map(String));
  return { headers, rows };
}

import Papa from 'papaparse';

export interface ParsedSheet {
  headers: string[];
  rows: string[][];
}

export function parseCsv(text: string): ParsedSheet {
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true,
    delimiter: '', // auto-detect (handles TSV too)
  });

  if (result.data.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = result.data[0];
  const rows = result.data.slice(1);
  return { headers, rows };
}

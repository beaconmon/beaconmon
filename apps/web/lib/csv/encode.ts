export interface CsvColumn {
  key: string;
  header: string;
}

export const CSV_ROW_LIMIT = 25_000;

export function toCsv(rows: Record<string, unknown>[], columns: CsvColumn[]): string {
  if (rows.length > CSV_ROW_LIMIT) {
    throw new Error(`Export exceeds ${CSV_ROW_LIMIT.toLocaleString()} row limit`);
  }
  const headerRow = columns.map((c) => escapeField(c.header)).join(',');
  const dataRows = rows.map((row) =>
    columns
      .map((c) => {
        const v = row[c.key];
        return escapeField(v == null ? '' : String(v));
      })
      .join(',')
  );
  // UTF-8 BOM for Excel/Numbers compatibility
  return '﻿' + [headerRow, ...dataRows].join('\r\n');
}

function escapeField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

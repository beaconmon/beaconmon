import { describe, it, expect } from 'vitest';
import { toCsv, CSV_ROW_LIMIT } from './encode';

const COLS = [
  { key: 'a', header: 'col_a' },
  { key: 'b', header: 'col_b' },
];

describe('toCsv', () => {
  it('produces header and data rows separated by CRLF', () => {
    const csv = toCsv([{ a: 'hello', b: 'world' }], COLS);
    const lines = csv.replace(/^﻿/, '').split('\r\n');
    expect(lines[0]).toBe('col_a,col_b');
    expect(lines[1]).toBe('hello,world');
  });

  it('prefixes output with UTF-8 BOM', () => {
    const csv = toCsv([], COLS);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it('quotes fields containing commas', () => {
    const csv = toCsv([{ a: 'price, usd', b: '1' }], COLS);
    expect(csv).toContain('"price, usd"');
  });

  it('quotes fields containing double-quotes and escapes them', () => {
    const csv = toCsv([{ a: 'say "hi"', b: '2' }], COLS);
    expect(csv).toContain('"say ""hi"""');
  });

  it('quotes fields containing newlines', () => {
    const csv = toCsv([{ a: 'line1\nline2', b: '3' }], COLS);
    expect(csv).toContain('"line1\nline2"');
  });

  it('quotes fields containing carriage returns', () => {
    const csv = toCsv([{ a: 'a\rb', b: '4' }], COLS);
    expect(csv).toContain('"a\rb"');
  });

  it('renders null and undefined as empty strings', () => {
    const csv = toCsv([{ a: null, b: undefined }], COLS);
    const lines = csv.replace(/^﻿/, '').split('\r\n');
    expect(lines[1]).toBe(',');
  });

  it('outputs only a header row for an empty rows array', () => {
    const csv = toCsv([], COLS);
    const lines = csv.replace(/^﻿/, '').split('\r\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('col_a,col_b');
  });

  it(`respects the ${CSV_ROW_LIMIT.toLocaleString()}-row hard cap`, () => {
    const rows = Array.from({ length: CSV_ROW_LIMIT + 1 }, (_, i) => ({ a: String(i), b: '' }));
    expect(() => toCsv(rows, COLS)).toThrow(/25,000/);
  });
});

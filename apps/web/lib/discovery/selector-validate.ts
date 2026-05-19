import * as cheerio from 'cheerio';

const MIN_MATCH = 1;
const MAX_MATCH = 10;

export interface SelectorValidation {
  chosen: string | null;
  counts: Record<string, number>;
}

export function pickBestSelector(html: string, candidates: string[]): SelectorValidation {
  const $ = cheerio.load(html);
  const counts: Record<string, number> = {};

  for (const sel of candidates) {
    try {
      const count = $(sel).length;
      counts[sel] = count;
      if (count >= MIN_MATCH && count <= MAX_MATCH) {
        return { chosen: sel, counts };
      }
    } catch {
      counts[sel] = 0;
    }
  }

  return { chosen: null, counts };
}

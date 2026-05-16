interface PrioritizedUrl {
  url: string;
  pathname: string;
  rank: number;
  matchedPattern: string;
}

const PATTERN_RULES: Array<{ pattern: RegExp; rank: number; label: string }> = [
  { pattern: /^\/api\/health(z)?(\/|$)/i, rank: 0, label: 'health endpoint' },
  { pattern: /^\/healthz?(\/|$)/i, rank: 1, label: 'health endpoint' },
  { pattern: /^\/(sign[-_]?in|signin|log[-_]?in|login)\/?$/i, rank: 2, label: 'login page' },
  { pattern: /^\/(sign[-_]?up|signup|register)\/?$/i, rank: 3, label: 'signup page' },
  { pattern: /^\/status\/?$/i, rank: 4, label: 'status page' },
  { pattern: /^\/pricing\/?$/i, rank: 5, label: 'pricing page' },
  { pattern: /^\/checkout(\/|$)/i, rank: 6, label: 'checkout page' },
  { pattern: /^\/api(\/|$)/i, rank: 7, label: 'API endpoint' },
];

const APEX_RANK = 100;

function getRegistrableDomain(host: string): string {
  return host.replace(/^www\./i, '').toLowerCase();
}

export function prioritizeUrls(urls: string[], apexDomain: string): PrioritizedUrl[] {
  const apex = getRegistrableDomain(apexDomain);
  const seenPaths = new Set<string>();
  const out: PrioritizedUrl[] = [];

  for (const raw of urls) {
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      continue;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') continue;
    const host = getRegistrableDomain(parsed.hostname);
    if (host !== apex && !host.endsWith(`.${apex}`)) continue;

    const pathname = parsed.pathname || '/';
    const dedupeKey = `${parsed.hostname}${pathname}`;
    if (seenPaths.has(dedupeKey)) continue;
    seenPaths.add(dedupeKey);

    if (pathname === '/' || pathname === '') continue;

    let rank = APEX_RANK;
    let matchedPattern = 'apex path';
    for (const rule of PATTERN_RULES) {
      if (rule.pattern.test(pathname)) {
        rank = rule.rank;
        matchedPattern = rule.label;
        break;
      }
    }

    const cleanedUrl = `${parsed.protocol}//${parsed.hostname}${pathname}`;
    out.push({ url: cleanedUrl, pathname, rank, matchedPattern });
  }

  out.sort((a, b) => (a.rank - b.rank) || a.pathname.localeCompare(b.pathname));
  return out;
}

export type { PrioritizedUrl };

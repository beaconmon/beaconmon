import { prioritizeUrls } from './prioritize';

export interface Suggestion {
  type: 'http' | 'ssl' | 'domain';
  url: string;
  name: string;
  reason: string;
  defaultIntervalSeconds: number;
  checkedByDefault: boolean;
}

export interface BuildSuggestionsInput {
  domain: string;
  sitemapUrls: string[];
  existingUrls: string[];
  planMonitorLimit: number;
  existingMonitorCount: number;
  planMinIntervalSeconds: number;
}

export interface BuildSuggestionsResult {
  suggestions: Suggestion[];
  cappedByPlan: boolean;
  apexAlreadyMonitored: boolean;
}

const MAX_TOTAL = 8;
const MAX_FROM_SITEMAP = 5;
const HTTP_INTERVAL_BUFFER_SECONDS = 300;
const EXPIRY_INTERVAL_SECONDS = 86_400;

function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    return `${u.protocol}//${u.hostname}${u.pathname === '/' ? '' : u.pathname}`.toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
}

function apexUrl(domain: string): string {
  return `https://${domain}`;
}

export function buildSuggestions(input: BuildSuggestionsInput): BuildSuggestionsResult {
  const {
    domain,
    sitemapUrls,
    existingUrls,
    planMonitorLimit,
    existingMonitorCount,
    planMinIntervalSeconds,
  } = input;

  const existingSet = new Set(existingUrls.map(normalizeUrl));
  const apex = apexUrl(domain);
  const apexNormalized = normalizeUrl(apex);
  const apexAlreadyMonitored = existingSet.has(apexNormalized);

  const httpInterval = Math.max(planMinIntervalSeconds, HTTP_INTERVAL_BUFFER_SECONDS);

  const headroom = planMonitorLimit === -1
    ? MAX_TOTAL
    : Math.max(0, planMonitorLimit - existingMonitorCount);
  const cap = Math.min(MAX_TOTAL, headroom);
  const cappedByPlan = planMonitorLimit !== -1 && headroom < MAX_TOTAL;

  const out: Suggestion[] = [];

  const apexCandidates: Suggestion[] = [
    {
      type: 'http',
      url: apex,
      name: `${domain} — homepage`,
      reason: 'Status code + response time on the front door',
      defaultIntervalSeconds: httpInterval,
      checkedByDefault: true,
    },
    {
      type: 'ssl',
      url: apex,
      name: `${domain} — SSL certificate`,
      reason: 'Warn 30/14/7 days before the certificate expires',
      defaultIntervalSeconds: EXPIRY_INTERVAL_SECONDS,
      checkedByDefault: true,
    },
    {
      type: 'domain',
      url: apex,
      name: `${domain} — domain expiry`,
      reason: "WHOIS-based warning so you don't lose the domain",
      defaultIntervalSeconds: EXPIRY_INTERVAL_SECONDS,
      checkedByDefault: true,
    },
  ];

  for (const candidate of apexCandidates) {
    if (out.length >= cap) break;
    const key = `${candidate.type}:${normalizeUrl(candidate.url)}`;
    const exists = existingUrls.some(
      (u) => normalizeUrl(u) === normalizeUrl(candidate.url)
    );
    if (candidate.type === 'http' && exists) continue;
    if (existingSet.has(key)) continue;
    out.push(candidate);
  }

  const prioritized = prioritizeUrls(sitemapUrls, domain);
  let fromSitemap = 0;
  for (const p of prioritized) {
    if (out.length >= cap) break;
    if (fromSitemap >= MAX_FROM_SITEMAP) break;
    const normalized = normalizeUrl(p.url);
    if (existingSet.has(normalized)) continue;
    if (out.some((s) => normalizeUrl(s.url) === normalized && s.type === 'http')) continue;

    out.push({
      type: 'http',
      url: p.url,
      name: `${domain}${p.pathname}`,
      reason: `Discovered ${p.matchedPattern}`,
      defaultIntervalSeconds: httpInterval,
      checkedByDefault: true,
    });
    fromSitemap += 1;
  }

  return { suggestions: out, cappedByPlan, apexAlreadyMonitored };
}

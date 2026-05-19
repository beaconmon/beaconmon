import { prioritizeUrls } from './prioritize';

export interface Suggestion {
  type: 'http' | 'ssl' | 'domain' | 'content';
  url: string;
  name: string;
  reason: string;
  defaultIntervalSeconds: number;
  checkedByDefault: boolean;
  source?: 'sitemap' | 'ai' | 'ai+sitemap' | 'apex';
  aiReason?: string;
  selectorCandidates?: string[];
  selectorChosen?: string | null;
  classification?: 'pricing' | 'changelog' | 'feature' | 'docs' | 'legal' | 'other';
  generatedAt?: string;
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

// --- Smart Setup AI suggestions (Pro/Business only) ---

export interface AiIntent {
  kind: 'http' | 'content';
  url: string;
  name: string;
  reason: string;
  priority: number;
}

export interface BuildAiSuggestionsInput {
  baselineSuggestions: Suggestion[];
  domain: string;
  aiIntents: AiIntent[];
  existingUrls: string[];
  planMonitorLimit: number;
  existingMonitorCount: number;
  planMinIntervalSeconds: number;
}

const CONTENT_INTERVAL_SECONDS = 3_600;

export function buildAiSuggestions(input: BuildAiSuggestionsInput): Suggestion[] {
  const {
    baselineSuggestions,
    domain,
    aiIntents,
    existingUrls,
    planMonitorLimit,
    existingMonitorCount,
    planMinIntervalSeconds,
  } = input;

  const existingSet = new Set(existingUrls.map(normalizeUrl));
  const apexNorm = normalizeUrl(`https://${domain}`);
  const httpInterval = Math.max(planMinIntervalSeconds, HTTP_INTERVAL_BUFFER_SECONDS);

  const headroom =
    planMonitorLimit === -1 ? MAX_TOTAL : Math.max(0, planMonitorLimit - existingMonitorCount);
  const cap = Math.min(MAX_TOTAL, headroom);

  // Step 1: always start with apex http/ssl/domain from baseline
  const result: Suggestion[] = baselineSuggestions
    .filter((s) => normalizeUrl(s.url) === apexNorm)
    .map((s) => ({ ...s, source: 'apex' as const }));

  const seen = new Set<string>(result.map((s) => `${s.type}:${normalizeUrl(s.url)}`));

  // Index non-apex baseline suggestions by normalized URL for merge detection
  const baselineByUrl = new Map<string, Suggestion>();
  for (const s of baselineSuggestions) {
    if (normalizeUrl(s.url) !== apexNorm) {
      baselineByUrl.set(normalizeUrl(s.url), s);
    }
  }

  // Step 2: walk AI intents in priority order
  const sorted = [...aiIntents].sort((a, b) => b.priority - a.priority);
  for (const intent of sorted) {
    if (result.length >= cap) break;

    const monitorType: Suggestion['type'] = intent.kind === 'content' ? 'content' : 'http';
    const norm = normalizeUrl(intent.url);
    const key = `${monitorType}:${norm}`;

    if (seen.has(key)) continue;
    if (existingSet.has(norm)) continue;

    try {
      new URL(intent.url);
    } catch {
      continue;
    }

    const baselineMatch = baselineByUrl.get(norm);
    result.push({
      type: monitorType,
      url: intent.url,
      name: intent.name,
      reason: intent.reason,
      defaultIntervalSeconds:
        monitorType === 'content' ? CONTENT_INTERVAL_SECONDS : httpInterval,
      checkedByDefault: intent.priority >= 7,
      source: baselineMatch ? 'ai+sitemap' : 'ai',
      aiReason: intent.reason,
    });
    seen.add(key);
  }

  // Step 3: fill remaining slots from non-apex baseline suggestions
  for (const s of baselineSuggestions) {
    if (result.length >= cap) break;
    const norm = normalizeUrl(s.url);
    if (norm === apexNorm) continue;
    const key = `${s.type}:${norm}`;
    if (seen.has(key)) continue;
    if (existingSet.has(norm)) continue;
    result.push({ ...s, source: 'sitemap' });
    seen.add(key);
  }

  return result;
}

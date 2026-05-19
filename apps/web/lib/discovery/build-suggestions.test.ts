import { describe, it, expect } from 'vitest';
import { buildSuggestions, buildAiSuggestions } from './build-suggestions';
import type { BuildAiSuggestionsInput, AiIntent, Suggestion } from './build-suggestions';

const baseInput = {
  domain: 'example.com',
  sitemapUrls: [] as string[],
  existingUrls: [] as string[],
  planMonitorLimit: 10,
  existingMonitorCount: 0,
  planMinIntervalSeconds: 300,
};

describe('buildSuggestions', () => {
  it('always emits the 3 apex baselines when sitemap is empty', () => {
    const { suggestions } = buildSuggestions(baseInput);
    const types = suggestions.map((s) => s.type).sort();
    expect(types).toEqual(['domain', 'http', 'ssl']);
  });

  it('caps total suggestions at 8', () => {
    const sitemap = Array.from({ length: 20 }, (_, i) => `https://example.com/page-${i}`);
    const { suggestions } = buildSuggestions({ ...baseInput, sitemapUrls: sitemap });
    expect(suggestions.length).toBeLessThanOrEqual(8);
  });

  it('caps sitemap-derived monitors at 5 (so total ≤ 3+5 = 8)', () => {
    const sitemap = Array.from({ length: 20 }, (_, i) => `https://example.com/p-${i}`);
    const { suggestions } = buildSuggestions({ ...baseInput, sitemapUrls: sitemap });
    const httpFromSitemap = suggestions.filter(
      (s) => s.type === 'http' && s.url !== 'https://example.com'
    );
    expect(httpFromSitemap.length).toBeLessThanOrEqual(5);
  });

  it('excludes URLs that are already monitored', () => {
    const { suggestions } = buildSuggestions({
      ...baseInput,
      sitemapUrls: ['https://example.com/api/health', 'https://example.com/about'],
      existingUrls: ['https://example.com/api/health'],
    });
    expect(suggestions.find((s) => s.url === 'https://example.com/api/health')).toBeUndefined();
    expect(suggestions.find((s) => s.url === 'https://example.com/about')).toBeDefined();
  });

  it('respects plan headroom and reports cappedByPlan', () => {
    const result = buildSuggestions({
      ...baseInput,
      planMonitorLimit: 10,
      existingMonitorCount: 8,
      sitemapUrls: ['https://example.com/a', 'https://example.com/b'],
    });
    expect(result.suggestions).toHaveLength(2);
    expect(result.cappedByPlan).toBe(true);
  });

  it('returns no suggestions when plan is exhausted', () => {
    const result = buildSuggestions({
      ...baseInput,
      planMonitorLimit: 10,
      existingMonitorCount: 10,
    });
    expect(result.suggestions).toHaveLength(0);
    expect(result.cappedByPlan).toBe(true);
  });

  it('treats -1 monitor limit as unlimited (capped only at 8)', () => {
    const sitemap = Array.from({ length: 10 }, (_, i) => `https://example.com/p-${i}`);
    const result = buildSuggestions({
      ...baseInput,
      planMonitorLimit: -1,
      existingMonitorCount: 999,
      sitemapUrls: sitemap,
    });
    expect(result.cappedByPlan).toBe(false);
    expect(result.suggestions.length).toBeLessThanOrEqual(8);
  });

  it('skips the homepage HTTP monitor when the apex URL is already monitored', () => {
    const { suggestions, apexAlreadyMonitored } = buildSuggestions({
      ...baseInput,
      existingUrls: ['https://example.com'],
    });
    expect(apexAlreadyMonitored).toBe(true);
    expect(suggestions.find((s) => s.type === 'http' && s.url === 'https://example.com'))
      .toBeUndefined();
    expect(suggestions.find((s) => s.type === 'ssl')).toBeDefined();
    expect(suggestions.find((s) => s.type === 'domain')).toBeDefined();
  });

  it('clamps HTTP interval to plan minimum + 300s buffer', () => {
    const { suggestions } = buildSuggestions({ ...baseInput, planMinIntervalSeconds: 60 });
    const http = suggestions.find((s) => s.type === 'http');
    expect(http?.defaultIntervalSeconds).toBe(300);
  });

  it('all suggestions are checked by default', () => {
    const { suggestions } = buildSuggestions(baseInput);
    expect(suggestions.every((s) => s.checkedByDefault === true)).toBe(true);
  });
});

// ─── buildAiSuggestions ───────────────────────────────────────────────────────

const apexSuggestions: Suggestion[] = [
  {
    type: 'http',
    url: 'https://example.com',
    name: 'example.com — homepage',
    reason: 'Status code + response time',
    defaultIntervalSeconds: 300,
    checkedByDefault: true,
  },
  {
    type: 'ssl',
    url: 'https://example.com',
    name: 'example.com — SSL',
    reason: 'SSL expiry',
    defaultIntervalSeconds: 86400,
    checkedByDefault: true,
  },
  {
    type: 'domain',
    url: 'https://example.com',
    name: 'example.com — domain expiry',
    reason: 'WHOIS expiry',
    defaultIntervalSeconds: 86400,
    checkedByDefault: true,
  },
];

const baseAiInput: BuildAiSuggestionsInput = {
  baselineSuggestions: apexSuggestions,
  domain: 'example.com',
  aiIntents: [],
  existingUrls: [],
  planMonitorLimit: 10,
  existingMonitorCount: 0,
  planMinIntervalSeconds: 300,
};

const pricingIntent: AiIntent = {
  kind: 'content',
  url: 'https://example.com/pricing',
  name: 'Pricing page',
  reason: 'Price changes are business-critical',
  priority: 9,
};

const loginIntent: AiIntent = {
  kind: 'http',
  url: 'https://example.com/login',
  name: 'Login page',
  reason: 'Downtime on login is critical',
  priority: 8,
};

const lowPriorityIntent: AiIntent = {
  kind: 'content',
  url: 'https://example.com/blog',
  name: 'Blog index',
  reason: 'Low-signal content',
  priority: 3,
};

describe('buildAiSuggestions', () => {
  it('always includes the 3 apex baselines tagged as "apex" source', () => {
    const result = buildAiSuggestions(baseAiInput);
    const apexItems = result.filter((s) => s.source === 'apex');
    expect(apexItems).toHaveLength(3);
    expect(apexItems.map((s) => s.type).sort()).toEqual(['domain', 'http', 'ssl']);
  });

  it('adds AI intents with source="ai" after apex baselines', () => {
    const result = buildAiSuggestions({
      ...baseAiInput,
      aiIntents: [pricingIntent],
    });
    const aiItem = result.find((s) => s.url === 'https://example.com/pricing');
    expect(aiItem).toBeDefined();
    expect(aiItem?.source).toBe('ai');
    expect(aiItem?.type).toBe('content');
  });

  it('inserts AI intents in priority order (highest first)', () => {
    const mediumPriority: AiIntent = {
      kind: 'http',
      url: 'https://example.com/changelog',
      name: 'Changelog',
      reason: 'Feature updates',
      priority: 6,
    };
    const result = buildAiSuggestions({
      ...baseAiInput,
      aiIntents: [lowPriorityIntent, pricingIntent, mediumPriority],
    });
    const nonApex = result.filter((s) => s.source !== 'apex');
    const priorities = nonApex.map((s) => {
      const intent = [lowPriorityIntent, pricingIntent, mediumPriority].find(
        (i) => i.url === s.url
      );
      return intent?.priority ?? 0;
    });
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i]).toBeLessThanOrEqual(priorities[i - 1]);
    }
  });

  it('marks AI intents with priority ≥ 7 as checkedByDefault=true', () => {
    const result = buildAiSuggestions({
      ...baseAiInput,
      aiIntents: [pricingIntent, lowPriorityIntent],
    });
    const pricing = result.find((s) => s.url === 'https://example.com/pricing');
    const blog = result.find((s) => s.url === 'https://example.com/blog');
    expect(pricing?.checkedByDefault).toBe(true);
    expect(blog?.checkedByDefault).toBe(false);
  });

  it('assigns content monitors an hourly default interval', () => {
    const result = buildAiSuggestions({
      ...baseAiInput,
      aiIntents: [pricingIntent],
    });
    const pricing = result.find((s) => s.url === 'https://example.com/pricing');
    expect(pricing?.defaultIntervalSeconds).toBe(3600);
  });

  it('assigns http AI intents an interval respecting plan minimum', () => {
    const result = buildAiSuggestions({
      ...baseAiInput,
      planMinIntervalSeconds: 60,
      aiIntents: [loginIntent],
    });
    const login = result.find((s) => s.url === 'https://example.com/login');
    expect(login?.defaultIntervalSeconds).toBe(300);
  });

  it('excludes URLs already in existingUrls', () => {
    const result = buildAiSuggestions({
      ...baseAiInput,
      existingUrls: ['https://example.com/pricing'],
      aiIntents: [pricingIntent],
    });
    expect(result.find((s) => s.url === 'https://example.com/pricing')).toBeUndefined();
  });

  it('deduplicates: does not add the same (type, url) twice', () => {
    const duplicate = { ...pricingIntent };
    const result = buildAiSuggestions({
      ...baseAiInput,
      aiIntents: [pricingIntent, duplicate],
    });
    const matches = result.filter((s) => s.url === 'https://example.com/pricing');
    expect(matches).toHaveLength(1);
  });

  it('tags a URL present in both baseline and AI intents as source="ai+sitemap"', () => {
    const baselineWithPricing: Suggestion[] = [
      ...apexSuggestions,
      {
        type: 'http',
        url: 'https://example.com/pricing',
        name: 'Pricing (sitemap)',
        reason: 'From sitemap',
        defaultIntervalSeconds: 300,
        checkedByDefault: true,
      },
    ];
    const result = buildAiSuggestions({
      ...baseAiInput,
      baselineSuggestions: baselineWithPricing,
      aiIntents: [pricingIntent],
    });
    // AI proposes 'content' type; baseline had 'http' — different keys, so it's
    // a new content entry tagged ai+sitemap (the baseline http entry is ignored
    // because the ai intent uses kind='content').
    const contentPricing = result.find(
      (s) => s.url === 'https://example.com/pricing' && s.type === 'content'
    );
    expect(contentPricing?.source).toBe('ai+sitemap');
  });

  it('respects plan headroom — stops adding once cap is reached', () => {
    const manyIntents: AiIntent[] = Array.from({ length: 10 }, (_, i) => ({
      kind: 'http' as const,
      url: `https://example.com/page-${i}`,
      name: `Page ${i}`,
      reason: 'test',
      priority: 5,
    }));
    const result = buildAiSuggestions({
      ...baseAiInput,
      planMonitorLimit: 5,
      existingMonitorCount: 0,
      aiIntents: manyIntents,
    });
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('treats planMonitorLimit=-1 as unlimited (capped only at 8)', () => {
    const manyIntents: AiIntent[] = Array.from({ length: 10 }, (_, i) => ({
      kind: 'http' as const,
      url: `https://example.com/page-${i}`,
      name: `Page ${i}`,
      reason: 'test',
      priority: 5,
    }));
    const result = buildAiSuggestions({
      ...baseAiInput,
      planMonitorLimit: -1,
      existingMonitorCount: 999,
      aiIntents: manyIntents,
    });
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it('fills remaining slots from baseline non-apex suggestions with source="sitemap"', () => {
    const baselineWithExtra: Suggestion[] = [
      ...apexSuggestions,
      {
        type: 'http',
        url: 'https://example.com/about',
        name: 'About',
        reason: 'From sitemap',
        defaultIntervalSeconds: 300,
        checkedByDefault: true,
      },
    ];
    const result = buildAiSuggestions({
      ...baseAiInput,
      baselineSuggestions: baselineWithExtra,
      aiIntents: [],
    });
    const about = result.find((s) => s.url === 'https://example.com/about');
    expect(about).toBeDefined();
    expect(about?.source).toBe('sitemap');
  });

  it('skips AI intents with invalid URLs', () => {
    const badIntent: AiIntent = {
      kind: 'http',
      url: 'not-a-url',
      name: 'Bad',
      reason: 'broken',
      priority: 9,
    };
    const result = buildAiSuggestions({
      ...baseAiInput,
      aiIntents: [badIntent],
    });
    expect(result.find((s) => s.url === 'not-a-url')).toBeUndefined();
  });
});

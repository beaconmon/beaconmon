import { describe, it, expect } from 'vitest';
import { buildSuggestions } from './build-suggestions';

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

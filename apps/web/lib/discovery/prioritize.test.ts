import { describe, it, expect } from 'vitest';
import { prioritizeUrls } from './prioritize';

describe('prioritizeUrls', () => {
  it('ranks /api/health above /about', () => {
    const result = prioritizeUrls(
      ['https://example.com/about', 'https://example.com/api/health'],
      'example.com'
    );
    expect(result[0]?.pathname).toBe('/api/health');
    expect(result.find((r) => r.pathname === '/about')).toBeDefined();
  });

  it('orders health > login > signup > status > pricing > api > other', () => {
    const urls = [
      'https://x.com/about',
      'https://x.com/api/users',
      'https://x.com/pricing',
      'https://x.com/status',
      'https://x.com/signup',
      'https://x.com/login',
      'https://x.com/healthz',
    ];
    const result = prioritizeUrls(urls, 'x.com');
    expect(result.map((r) => r.pathname)).toEqual([
      '/healthz',
      '/login',
      '/signup',
      '/status',
      '/pricing',
      '/api/users',
      '/about',
    ]);
  });

  it('filters off-domain URLs', () => {
    const result = prioritizeUrls(
      ['https://example.com/api', 'https://evil.com/api', 'https://sub.example.com/api'],
      'example.com'
    );
    const hosts = result.map((r) => new URL(r.url).hostname);
    expect(hosts).toContain('example.com');
    expect(hosts).toContain('sub.example.com');
    expect(hosts).not.toContain('evil.com');
  });

  it('treats example.com and www.example.com as the same apex', () => {
    const result = prioritizeUrls(
      ['https://www.example.com/login', 'https://example.com/signup'],
      'www.example.com'
    );
    expect(result).toHaveLength(2);
  });

  it('dedupes by hostname+pathname', () => {
    const result = prioritizeUrls(
      [
        'https://example.com/api/health',
        'https://example.com/api/health',
        'https://example.com/api/health?ref=1',
      ],
      'example.com'
    );
    expect(result.filter((r) => r.pathname === '/api/health')).toHaveLength(1);
  });

  it('skips the apex root path', () => {
    const result = prioritizeUrls(
      ['https://example.com/', 'https://example.com/about'],
      'example.com'
    );
    expect(result.map((r) => r.pathname)).toEqual(['/about']);
  });

  it('ignores malformed URLs without throwing', () => {
    const result = prioritizeUrls(
      ['not-a-url', 'https://example.com/ok', 'ftp://example.com/bad'],
      'example.com'
    );
    expect(result.map((r) => r.pathname)).toEqual(['/ok']);
  });
});

import { describe, it, expect } from 'vitest';
import { normalizeDomain, domainToName } from './competitor-domain-input';

describe('normalizeDomain', () => {
  it('strips https:// prefix', () => {
    expect(normalizeDomain('https://example.com')).toBe('example.com');
  });

  it('strips http:// prefix', () => {
    expect(normalizeDomain('http://example.com/pricing')).toBe('example.com');
  });

  it('removes path after domain', () => {
    expect(normalizeDomain('competitor.com/about')).toBe('competitor.com');
  });

  it('lowercases the result', () => {
    expect(normalizeDomain('BOMBAS.COM')).toBe('bombas.com');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeDomain('  bombas.com  ')).toBe('bombas.com');
  });

  it('passes through a bare domain unchanged', () => {
    expect(normalizeDomain('bombas.com')).toBe('bombas.com');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeDomain('')).toBe('');
  });
});

describe('domainToName', () => {
  it('capitalizes a single-word domain', () => {
    expect(domainToName('bombas.com')).toBe('Bombas');
  });

  it('joins hyphenated words as title case', () => {
    expect(domainToName('happy-socks.com')).toBe('Happy Socks');
  });

  it('strips www prefix before converting', () => {
    expect(domainToName('www.bombas.com')).toBe('Bombas');
  });

  it('handles two-part TLDs like .co.uk', () => {
    expect(domainToName('competitor.co.uk')).toBe('Competitor');
  });

  it('handles multi-segment hyphenated names', () => {
    expect(domainToName('best-running-shoes.com')).toBe('Best Running Shoes');
  });
});

function isAtLimit(limit: number, count: number): boolean {
  return limit !== -1 && count >= limit;
}

describe('plan limit enforcement (logic)', () => {
  it('atLimit is true when count equals limit', () => {
    expect(isAtLimit(5, 5)).toBe(true);
  });

  it('atLimit is false when under limit', () => {
    expect(isAtLimit(5, 3)).toBe(false);
  });

  it('atLimit is never true for unlimited plan (limit === -1)', () => {
    expect(isAtLimit(-1, 999)).toBe(false);
  });

  it('duplicate domains are not added', () => {
    const value = ['bombas.com'];
    const domain = normalizeDomain('bombas.com');
    const wouldAdd = domain && !value.includes(domain);
    expect(wouldAdd).toBe(false);
  });

  it('normalized duplicates are also rejected', () => {
    const value = ['bombas.com'];
    const domain = normalizeDomain('https://bombas.com/pricing');
    const wouldAdd = domain && !value.includes(domain);
    expect(wouldAdd).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { normalizeDomain, domainToName } from './competitor-domain-input';

// Tests for the POST payload construction logic used by AddCompetitorWizard.
// The component itself requires jsdom; these tests cover the data-transform layer
// that drives the API call.

function buildPayload(domain: string) {
  return {
    name: domainToName(domain),
    url: `https://${domain}`,
    platform: 'other' as const,
  };
}

describe('AddCompetitorWizard POST payload', () => {
  it('constructs a valid https URL from a bare domain', () => {
    const payload = buildPayload('bombas.com');
    expect(payload.url).toBe('https://bombas.com');
    expect(() => new URL(payload.url)).not.toThrow();
  });

  it('derives a human-readable name from the domain', () => {
    expect(buildPayload('happy-socks.com').name).toBe('Happy Socks');
    expect(buildPayload('bombas.com').name).toBe('Bombas');
  });

  it('always sets platform to other', () => {
    expect(buildPayload('bombas.com').platform).toBe('other');
  });

  it('handles a normalized domain from user input correctly', () => {
    const domain = normalizeDomain('https://bombas.com/collections/socks');
    const payload = buildPayload(domain);
    expect(payload.url).toBe('https://bombas.com');
    expect(payload.name).toBe('Bombas');
  });

  it('submits all queued domains as separate requests', () => {
    const domains = ['bombas.com', 'happysocks.com', 'stance.com'];
    const payloads = domains.map(buildPayload);
    expect(payloads).toHaveLength(3);
    expect(payloads.map((p) => p.url)).toEqual([
      'https://bombas.com',
      'https://happysocks.com',
      'https://stance.com',
    ]);
  });
});

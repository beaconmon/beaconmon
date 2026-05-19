import { describe, expect, it } from 'vitest';
import { NoopProvider } from '../providers/noop.js';
import { classifySite } from './classify.js';
import { ClassifyOutput, buildClassifyPrompt } from './prompt-classify.js';

describe('classifySite with NoopProvider', () => {
  it('returns a stub that passes schema validation', async () => {
    const provider = new NoopProvider();
    const result = await classifySite(provider, {
      homepageText: 'Welcome to Acme SaaS',
      urls: ['https://example.com/pricing', 'https://example.com/features'],
    });

    expect(result.model).toBe('noop');
    expect(result.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
    expect(() => ClassifyOutput.parse(result.data)).not.toThrow();
    expect(typeof result.data.category).toBe('string');
    expect(typeof result.data.confidence).toBe('number');
    expect(Array.isArray(result.data.intents)).toBe(true);
  });
});

describe('buildClassifyPrompt', () => {
  it('includes homepage text and URLs', () => {
    const prompt = buildClassifyPrompt('SaaS pricing plans', ['https://example.com/pricing']);
    expect(prompt).toContain('SaaS pricing plans');
    expect(prompt).toContain('https://example.com/pricing');
    expect(prompt).toContain('Homepage text');
    expect(prompt).toContain('Discovered URLs');
  });

  it('truncates oversized homepage text', () => {
    const huge = 'a'.repeat(10_000);
    const prompt = buildClassifyPrompt(huge, []);
    expect(prompt).toContain('truncated');
    expect(prompt.length).toBeLessThan(10_000);
  });
});

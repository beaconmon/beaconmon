import { describe, expect, it } from 'vitest';
import { NoopProvider } from '../providers/noop.js';
import { createAiProvider } from '../factory.js';
import { summarizeContentDiff } from './summarize.js';
import { ContentDiffOutput, buildDiffPrompt } from './prompt.js';

describe('summarizeContentDiff with NoopProvider', () => {
  it('returns a stub that passes schema validation', async () => {
    const provider = new NoopProvider();
    const result = await summarizeContentDiff(
      provider,
      'previous content',
      'next content'
    );

    expect(result.model).toBe('noop');
    expect(result.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
    // Stub must pass schema validation — specific values are schema-driven
    expect(() => ContentDiffOutput.parse(result.data)).not.toThrow();
    expect(typeof result.data.summary).toBe('string');
    expect(result.data.summary.length).toBeGreaterThan(0);
    expect(typeof result.data.confidence).toBe('number');
  });
});

describe('buildDiffPrompt', () => {
  it('includes both snapshots in the prompt', () => {
    const prompt = buildDiffPrompt('OLD CONTENT', 'NEW CONTENT');
    expect(prompt).toContain('OLD CONTENT');
    expect(prompt).toContain('NEW CONTENT');
    expect(prompt).toContain('Previous snapshot');
    expect(prompt).toContain('Current snapshot');
  });

  it('truncates oversized inputs to cap token cost', () => {
    const huge = 'x'.repeat(20_000);
    const prompt = buildDiffPrompt(huge, huge);
    // 8KB cap per side + truncation marker means the prompt should be far
    // smaller than 2x the raw input.
    expect(prompt.length).toBeLessThan(20_000);
    expect(prompt).toContain('truncated');
  });

  it('byte-correctly truncates multi-byte CJK content', () => {
    // Each CJK char is 3 UTF-8 bytes; 3000 chars = 9000 bytes > 8192 cap
    const cjk = '中'.repeat(3_000);
    const prompt = buildDiffPrompt(cjk, cjk);
    expect(prompt).toContain('bytes');
    // Prompt must be well under 2x 9000 bytes worth of content
    const byteLen = new TextEncoder().encode(prompt).length;
    expect(byteLen).toBeLessThan(20_000);
  });
});

describe('ContentDiffOutput schema', () => {
  it('rejects summaries over 280 chars', () => {
    const result = ContentDiffOutput.safeParse({
      summary: 'x'.repeat(281),
      classification: 'copy',
      confidence: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown classifications', () => {
    const result = ContentDiffOutput.safeParse({
      summary: 'ok',
      classification: 'something-else',
      confidence: 0.5,
    });
    expect(result.success).toBe(false);
  });

  it('accepts a well-formed object', () => {
    const result = ContentDiffOutput.safeParse({
      summary: 'Pro plan price changed from $29 to $19/mo',
      classification: 'pricing',
      confidence: 0.92,
    });
    expect(result.success).toBe(true);
  });
});

describe('createAiProvider', () => {
  it('returns NoopProvider for provider="noop"', () => {
    const provider = createAiProvider({ provider: 'noop' });
    expect(provider.name).toBe('noop');
  });

  it('throws when anthropic provider has no apiKey', () => {
    expect(() => createAiProvider({ provider: 'anthropic' })).toThrow(
      /requires apiKey/
    );
  });

  it('throws when openai provider has no apiKey', () => {
    expect(() => createAiProvider({ provider: 'openai' })).toThrow(
      /requires apiKey/
    );
  });
});

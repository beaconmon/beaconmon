import { describe, expect, it } from 'vitest';
import { NoopProvider } from '../providers/noop.js';
import { proposeSelectors } from './select-selectors.js';
import { SelectorsOutput, buildSelectorsPrompt } from './prompt-selectors.js';

describe('proposeSelectors with NoopProvider', () => {
  it('returns a stub that passes schema validation', async () => {
    const provider = new NoopProvider();
    const result = await proposeSelectors(provider, {
      pageHtml: '<html><body><span class="price">$29</span></body></html>',
      intentName: 'pricing',
    });

    expect(result.model).toBe('noop');
    expect(result.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
    expect(() => SelectorsOutput.parse(result.data)).not.toThrow();
    expect(result.data.candidates.length).toBeGreaterThanOrEqual(1);
    expect(typeof result.data.rationale).toBe('string');
  });
});

describe('buildSelectorsPrompt', () => {
  it('includes intent name and HTML', () => {
    const html = '<div class="price">$29/mo</div>';
    const prompt = buildSelectorsPrompt(html, 'pricing');
    expect(prompt).toContain('pricing');
    expect(prompt).toContain(html);
  });

  it('truncates HTML to MAX_HTML_BYTES', () => {
    const huge = '<div>' + 'x'.repeat(30_000) + '</div>';
    const prompt = buildSelectorsPrompt(huge, 'pricing');
    expect(prompt).toContain('truncated');
    const byteLen = new TextEncoder().encode(prompt).length;
    expect(byteLen).toBeLessThan(20_000);
  });

  it('truncated HTML ends with >', () => {
    // Confirm mid-tag truncation fix: the cut point is moved back to last >
    const repeatingTags = '<span class="price">$29</span>'.repeat(1_000);
    const prompt = buildSelectorsPrompt(repeatingTags, 'pricing');
    // Extract the HTML block between ```html and ```
    const match = prompt.match(/```html\n([\s\S]*?)\n```/);
    if (match) {
      const htmlBlock = match[1]!.split('\n…[truncated')[0]!;
      expect(htmlBlock.trimEnd()).toMatch(/>$/);
    }
  });
});

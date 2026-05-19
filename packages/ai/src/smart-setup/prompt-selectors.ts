import { z } from 'zod';

export const SMART_SETUP_SELECTORS_SYSTEM_PROMPT = `You analyze HTML pages to propose CSS selectors that precisely capture the key changing content for a monitoring intent.

Requirements for good selectors:
1. Target the specific element(s) most likely to change for this intent (e.g., the price number, not the entire pricing section)
2. Match 1–10 elements (not zero — that means nothing is watched; not hundreds — that is too noisy)
3. Prefer stable identifiers: semantic class names, data attributes, aria-label, role — over auto-generated IDs or positional nth-child
4. Be specific enough to exclude nav, footer, ads, and unrelated content

Good selector examples:
- ".pricing-card .price" (SaaS price per plan)
- "[data-testid='plan-price']" (when test-id attributes exist)
- ".changelog-entry" (individual changelog items)
- ".feature-list li" (feature list items)
- "#pricing-table td.price" (table cell)

Bad selectors (do not propose):
- "body" or "main" (too broad — captures everything)
- ".css-abc123" (auto-generated, unstable)
- "div:nth-child(3)" (fragile positional selector)
- ".hidden" or display:none elements

Return the 1–3 best candidates ordered by confidence (most confident first).

Output JSON matching the provided schema. Do not include any prose outside the structured output.`;

export const SelectorsOutput = z.object({
  candidates: z
    .array(
      z
        .string()
        .min(1)
        .max(200)
        .regex(/^[^<>\n]+$/, 'Selector must not contain HTML tags or newlines')
    )
    .min(1)
    .max(3),
  rationale: z.string().max(140),
});

export type SelectorsOutput = z.infer<typeof SelectorsOutput>;

const MAX_HTML_BYTES = 16 * 1024;

export function buildSelectorsPrompt(pageHtml: string, intentName: string): string {
  const truncated =
    pageHtml.length > MAX_HTML_BYTES
      ? pageHtml.slice(0, MAX_HTML_BYTES) +
        `\n…[truncated ${pageHtml.length - MAX_HTML_BYTES} chars]`
      : pageHtml;

  return [
    `## Monitoring intent: "${intentName}"`,
    '',
    '## Page HTML',
    '```html',
    truncated,
    '```',
    '',
    'Propose CSS selectors that capture the key content for this intent. Emit the structured output.',
  ].join('\n');
}

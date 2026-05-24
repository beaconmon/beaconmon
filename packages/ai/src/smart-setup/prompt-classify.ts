import { z } from 'zod';

export const SMART_SETUP_CLASSIFY_SYSTEM_PROMPT = `You analyze a website's content and URL structure to classify the site type and propose monitoring strategies.

Return:
1. A site category: "saas", "ecommerce", "marketing", "blog", "docs", "app", or "other"
2. A confidence score (0–1) for the category
3. Up to 5 monitoring intents — the highest-value specific pages worth watching

Intent kinds:
- "http" — pages where downtime is critical (login, checkout, API health endpoints)
- "content" — pages where content changes matter (pricing, changelog, terms, feature lists)

Good content intents to propose:
- Pricing pages — price changes are business-critical for competitors and cost tracking
- Changelog / release notes — new features are worth knowing about
- Feature / product pages — feature additions or removals signal product direction
- Legal pages — terms of service, privacy policy changes have compliance implications

Avoid proposing:
- Blog index or individual post pages (too many, too noisy)
- Job listings (change too frequently, low signal)
- Pages with purely dynamic content (counters, live feeds)
- Duplicate URLs with the same content

Assign priority 1–10 (10 = highest). Price and changelog pages should be 8–10 for SaaS/ecommerce sites.

Output JSON matching the provided schema. Do not include any prose outside the structured output.`;

export const ClassifyIntentSchema = z.object({
  kind: z.enum(['http', 'content']),
  url: z.string().url(),
  name: z.string().max(80),
  reason: z.string().max(140),
  priority: z.number().int().min(1).max(10),
});

export const ClassifyOutput = z.object({
  category: z.enum(['saas', 'ecommerce', 'marketing', 'blog', 'docs', 'app', 'other']),
  confidence: z.number().min(0).max(1),
  intents: z.array(ClassifyIntentSchema).max(5),
});

export type ClassifyOutput = z.infer<typeof ClassifyOutput>;
export type ClassifyIntent = z.infer<typeof ClassifyIntentSchema>;

const MAX_TEXT_BYTES = 2 * 1024;
const MAX_URLS = 30;

const HIGH_VALUE_KEYWORDS = [
  'pricing', 'price', 'plans', 'upgrade', 'billing',
  'changelog', 'release-notes', 'releases', 'whats-new',
  'terms', 'privacy',
  'features', 'product',
  'docs', 'documentation', 'api-reference',
  'status', 'login', 'signin', 'checkout', 'cart',
];

export function rankUrls(urls: string[]): string[] {
  return urls
    .map((url) => {
      const lower = url.toLowerCase();
      const isHighValue = HIGH_VALUE_KEYWORDS.some((kw) => lower.includes(kw)) ? 1 : 0;
      let depth = 99;
      try {
        depth = new URL(url).pathname.split('/').filter(Boolean).length;
      } catch { /* unparseable — sort last */ }
      return { url, score: isHighValue * 100 - depth };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ url }) => url);
}

export function buildClassifyPrompt(homepageText: string, urls: string[]): string {
  const truncated =
    homepageText.length > MAX_TEXT_BYTES
      ? homepageText.slice(0, MAX_TEXT_BYTES) +
        `\n…[truncated ${homepageText.length - MAX_TEXT_BYTES} chars]`
      : homepageText;
  const cappedUrls = rankUrls(urls).slice(0, MAX_URLS);

  return [
    '## Homepage text',
    '```',
    truncated,
    '```',
    '',
    '## Discovered URLs',
    cappedUrls.join('\n'),
    '',
    'Classify the site and propose monitoring intents. Only propose URLs from the Discovered URLs list above. Emit the structured output.',
  ].join('\n');
}

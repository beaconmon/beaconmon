import { z } from 'zod';

export const CONTENT_DIFF_SYSTEM_PROMPT = `You analyze diffs between two text snapshots of the same web page.

Return:
1. A short, specific natural-language summary of what substantively changed (<= 280 chars).
   - Prefer concrete facts: "Pro plan price changed from $29 to $19" beats "pricing changed".
   - If multiple things changed, list the most important first.
2. A classification of the change:
   - "pricing"  — prices, billing cycles, plan tiers
   - "feature"  — added or removed product capabilities, integrations, limits
   - "copy"     — marketing copy, headlines, descriptions, hero text
   - "legal"    — terms, privacy, refund policy, compliance statements
   - "layout"   — order/structure changes with no new substance
   - "noise"    — timestamps, view counters, "X people viewed this", rotating
                  testimonials, CSRF tokens, last-modified dates, randomized
                  order of unchanged items, whitespace-only, attribute order
                  changes, or anything that no human would care about

Use "noise" liberally when the change is not substantive. Suppressing noise
prevents false-positive alerts for users.

Output JSON matching the provided schema. Do not include any prose outside
the structured output.`;

export const ContentDiffOutput = z.object({
  summary: z.string().min(1).max(280),
  classification: z.enum([
    'pricing',
    'feature',
    'copy',
    'legal',
    'layout',
    'noise',
  ]),
  confidence: z.number().min(0).max(1),
});

export type ContentDiffOutput = z.infer<typeof ContentDiffOutput>;
export type ContentDiffClassification = ContentDiffOutput['classification'];

/**
 * Build the user-message prompt. Truncates each side to MAX_BYTES so we cap
 * token cost on pages that grow to hundreds of KB.
 */
const MAX_BYTES = 8 * 1024;

export function buildDiffPrompt(previous: string, next: string): string {
  return [
    '## Previous snapshot',
    '```',
    truncate(previous, MAX_BYTES),
    '```',
    '',
    '## Current snapshot',
    '```',
    truncate(next, MAX_BYTES),
    '```',
    '',
    'Analyze the change and emit the structured output.',
  ].join('\n');
}

const _encoder = new TextEncoder();

function truncate(input: string, maxBytes: number): string {
  const full = _encoder.encode(input);
  if (full.length <= maxBytes) return input;
  // Binary-search for the largest char prefix whose UTF-8 encoding fits maxBytes.
  let lo = 0;
  let hi = input.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (_encoder.encode(input.slice(0, mid)).length <= maxBytes) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const truncatedBytes = full.length - maxBytes;
  return input.slice(0, lo) + `\n…[truncated ${truncatedBytes} bytes]`;
}

import { z } from 'zod';
import type { AiProvider } from './types.js';

export type Significance = 'low' | 'medium' | 'high';

const SignificanceOutput = z.object({
  significance: z.enum(['low', 'medium', 'high']),
});

const SYSTEM_PROMPT = `You are an ecommerce intelligence analyst. Given a summary of a competitor website change, classify its business significance as one of:
- high: major pricing or promotional change, significant product availability shift
- medium: notable content update, moderate copy or layout change
- low: minor cosmetic tweak, trivial metadata update, navigation micro-change

Respond by calling the tool with exactly one value.`;

export function scoreRuleBased(
  type: string,
  payload: Record<string, unknown>
): Significance {
  switch (type) {
    case 'price_changed': {
      const old = parseFloat(String(payload.oldPrice ?? '0'));
      const next = parseFloat(String(payload.newPrice ?? '0'));
      if (old > 0 && next > 0 && Math.abs(next - old) / old >= 0.05) return 'high';
      return 'medium';
    }
    case 'out_of_stock':
    case 'back_in_stock':
    case 'sale_started':
    case 'sale_ended':
      return 'high';
    case 'product_added':
    case 'product_removed':
    case 'stock_changed':
    case 'promo_detected':
      return 'medium';
    default:
      return 'medium';
  }
}

export async function scoreSiteChange(
  diff: string,
  provider: AiProvider
): Promise<Significance> {
  if (provider.name === 'noop') return 'medium';
  try {
    const result = await provider.complete({
      system: SYSTEM_PROMPT,
      user: diff || 'Content changed',
      schema: SignificanceOutput,
      schemaName: 'significance',
      maxTokens: 50,
      temperature: 0,
      timeoutMs: 4_000,
    });
    return result.data.significance;
  } catch {
    return 'medium';
  }
}

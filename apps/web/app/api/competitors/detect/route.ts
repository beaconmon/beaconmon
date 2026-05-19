import 'server-only';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { COMPETITOR_PRESETS } from '@/lib/competitor-presets';
import { pickBestSelector } from '@/lib/discovery/selector-validate';
import { createAiProvider, proposeSelectors } from '@beaconmon/ai';
import { logger } from '@/lib/logger';

const detectSchema = z.object({
  url: z.string().url(),
});

const FETCH_TIMEOUT_MS = 10_000;
const PREVIEW_MAX_CHARS = 200;

function excerptText(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > PREVIEW_MAX_CHARS
    ? normalized.slice(0, PREVIEW_MAX_CHARS) + '…'
    : normalized;
}

const AI_TIMEOUT_MS = 5_000;

async function raceTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout>;
  const sentinel = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), ms); });
  try {
    return await Promise.race([promise, sentinel]);
  } finally {
    clearTimeout(timer!);
  }
}

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  try {
    const rl = await rateLimit(`competitors:detect:${teamId}`, 10, 3600);
    if (!rl.allowed) {
      logger.warn({ service: 'web', teamId }, 'Competitor detect rate limit exceeded');
      return rateLimitResponse(rl.reset);
    }
  } catch {
    logger.warn({ service: 'web', teamId }, 'Rate limit Redis unavailable — failing open');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = detectSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { url } = parsed.data;
  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    throw new ValidationError('Invalid URL');
  }

  const ssrfCheck = await isHostnameSafe(hostname);
  if (!ssrfCheck.allowed) {
    throw new ValidationError(`Cannot fetch that URL: ${ssrfCheck.reason ?? 'reserved address'}`);
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Beaconmon/1.0 (+https://beaconmon.com)' },
      });
      if (!response.ok) {
        throw new ValidationError(`Could not fetch URL: server returned ${response.status}`);
      }
      html = await response.text();
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new ValidationError(`Could not fetch URL: ${message}`);
  }

  const $ = cheerio.load(html);

  const baseMatches = COMPETITOR_PRESETS.map((preset) => {
    for (const selector of preset.selectors) {
      try {
        const el = $(selector).first().clone();
        el.find('script, style, noscript').remove();
        const text = el.text();
        const preview = excerptText(text);
        if (preview.length > 20) {
          return { preset, selector, preview, matched: true };
        }
      } catch {
        // cheerio selector failed — try next
      }
    }
    return { preset, selector: preset.fallbackSelector, preview: '', matched: false };
  });

  const aiEnabled =
    process.env.FEATURE_AI_SMART_SETUP === 'true' &&
    !!process.env.AI_PROVIDER &&
    process.env.AI_PROVIDER !== 'noop' &&
    (plan === 'pro' || plan === 'business');

  let matches = baseMatches.map((m) => ({ ...m, aiSelector: null as string | null, aiRationale: null as string | null }));

  if (aiEnabled) {
    try {
      const provider = createAiProvider({
        provider: (process.env.AI_PROVIDER ?? 'noop') as 'anthropic' | 'openai' | 'deepseek' | 'noop',
        apiKey: process.env.AI_API_KEY,
        model: process.env.AI_MODEL,
      });

      const aiResults = await Promise.allSettled(
        COMPETITOR_PRESETS.map((preset) =>
          raceTimeout(
            proposeSelectors(provider, { pageHtml: html, intentName: preset.label }),
            AI_TIMEOUT_MS
          )
        )
      );

      matches = matches.map((m, i) => {
        const result = aiResults[i];
        if (result?.status !== 'fulfilled' || !result.value) return m;
        const { candidates, rationale } = result.value.data;
        const validation = pickBestSelector(html, candidates);
        const aiSelector = validation.chosen ?? candidates[0] ?? null;
        return { ...m, aiSelector, aiRationale: rationale };
      });

      logger.info(
        {
          service: 'web',
          teamId,
          url,
          aiEnriched: matches.filter((m) => m.aiSelector).length,
        },
        'Competitor detect AI enrichment complete'
      );
    } catch (err) {
      logger.warn({ service: 'web', teamId, url, err }, 'Competitor detect AI enrichment failed — using presets');
    }
  }

  logger.info(
    { service: 'web', teamId, url, matchCount: matches.filter((m) => m.matched).length },
    'Competitor detect complete'
  );

  return Response.json({ url, matches });
});

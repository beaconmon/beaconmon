import 'server-only';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { COMPETITOR_PRESETS } from '@/lib/competitor-presets';
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

export const POST = withAuth(async (req, { teamId, role }) => {
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

  const matches = COMPETITOR_PRESETS.map((preset) => {
    for (const selector of preset.selectors) {
      try {
        const text = $(selector).first().text();
        const preview = excerptText(text);
        if (preview.length > 20) {
          return { preset, selector, preview, matched: true };
        }
      } catch {
        // cheerio selector failed — try next
      }
    }
    return { preset, selector: preset.selectors[preset.selectors.length - 1]!, preview: '', matched: false };
  });

  logger.info(
    { service: 'web', teamId, url, matchCount: matches.filter((m) => m.matched).length },
    'Competitor detect complete'
  );

  return Response.json({ url, matches });
});

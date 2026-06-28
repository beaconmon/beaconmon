import 'server-only';
import { z } from 'zod';
import { AppError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { buildCompetitorChanges, type CompetitorChangesResult } from '@/lib/tools/competitor-changes';

export const runtime = 'nodejs';

const bodySchema = z.object({ url: z.string().min(1).max(2048) });

const CACHE_TTL_SECONDS = 2 * 60 * 60;
const FAILURE_CACHE_TTL_SECONDS = 30 * 60;
const RATE_BURST = { limit: 5, windowSec: 60 };
const RATE_HOURLY = { limit: 20, windowSec: 3600 };

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

function normalizeDomain(input: string): string | null {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let host: string;
  try {
    host = new URL(withScheme).hostname;
  } catch {
    return null;
  }
  host = host.toLowerCase().replace(/^www\./, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null;
  return host;
}

export async function POST(req: Request): Promise<Response> {
  try {
    return await handleCompetitorChanges(req);
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    logger.error({ service: 'web', err }, 'Competitor changes route unhandled error');
    return Response.json({ error: 'Something went wrong running the check.' }, { status: 500 });
  }
}

async function handleCompetitorChanges(req: Request): Promise<Response> {
  const ip = clientIp(req);

  const burst = await rateLimit(`tools:competitor-changes:burst:${ip}`, RATE_BURST.limit, RATE_BURST.windowSec);
  if (!burst.allowed) return rateLimitResponse(burst.reset);
  const hourly = await rateLimit(`tools:competitor-changes:hourly:${ip}`, RATE_HOURLY.limit, RATE_HOURLY.windowSec);
  if (!hourly.allowed) return rateLimitResponse(hourly.reset);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const domain = normalizeDomain(parsed.data.url);
  if (!domain) throw new ValidationError('Enter a valid store URL');

  const ssrf = await isHostnameSafe(domain);
  if (!ssrf.allowed) {
    throw new ValidationError(`Cannot scan that URL: ${ssrf.reason ?? 'reserved address'}`);
  }

  const cacheKey = `tool:competitor-changes:${domain}`;
  try {
    const cached = await getRedis().get(cacheKey);
    if (cached) {
      return Response.json({ ...(JSON.parse(cached) as CompetitorChangesResult), cached: true });
    }
  } catch {
    // Cache read failed, fall through.
  }

  let result: CompetitorChangesResult;
  try {
    result = await buildCompetitorChanges(domain);
  } catch (err) {
    logger.error({ service: 'web', domain, err }, 'Competitor changes build failed');
    result = { ok: false, reason: 'unreachable' };
  }

  try {
    const ttl = result.ok ? CACHE_TTL_SECONDS : FAILURE_CACHE_TTL_SECONDS;
    await getRedis().set(cacheKey, JSON.stringify(result), 'EX', ttl);
  } catch {
    // Cache write failed, still return the result.
  }

  return Response.json({ ...result, cached: false });
}

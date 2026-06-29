import 'server-only';
import { z } from 'zod';
import { AppError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { checkCoverage, type CoverageResult } from '@/lib/tools/coverage-check';
import { clientIp } from '@/lib/api/client-ip';
import { normalizeDomain } from '@/lib/tools/normalize-domain';

export const runtime = 'nodejs';

const bodySchema = z.object({
  url: z.string().min(1).max(2048),
});

const CACHE_TTL_SECONDS = 180; // 3 minutes
const RATE_BURST = { limit: 3, windowSec: 60 };
const RATE_HOURLY = { limit: 10, windowSec: 3600 };

export async function POST(req: Request): Promise<Response> {
  try {
    return await handleCoverageAudit(req);
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    logger.error({ service: 'web', err }, 'Coverage audit route unhandled error');
    return Response.json({ error: 'Something went wrong running the coverage audit.' }, { status: 500 });
  }
}

async function handleCoverageAudit(req: Request): Promise<Response> {
  const ip = clientIp(req);

  const burst = await rateLimit(`tools:coverage-audit:burst:${ip}`, RATE_BURST.limit, RATE_BURST.windowSec);
  if (!burst.allowed) return rateLimitResponse(burst.reset);
  const hourly = await rateLimit(`tools:coverage-audit:hourly:${ip}`, RATE_HOURLY.limit, RATE_HOURLY.windowSec);
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
    throw new ValidationError(`Cannot audit that URL: ${ssrf.reason ?? 'reserved address'}`);
  }

  const cacheKey = `tool:coverage:${domain}`;
  try {
    const cached = await getRedis().get(cacheKey);
    if (cached) {
      return Response.json({ ...(JSON.parse(cached) as CoverageResult), cached: true });
    }
  } catch {
    // Cache read failed -- proceed with fresh check.
  }

  let result: CoverageResult;
  try {
    result = await checkCoverage(domain);
  } catch (err) {
    logger.error({ service: 'web', domain, err }, 'Coverage audit failed');
    return Response.json({ error: 'Could not complete the audit. Check the URL and try again.' }, { status: 500 });
  }

  try {
    await getRedis().set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);
  } catch {
    // Cache write failed -- still return the fresh result.
  }

  return Response.json({ ...result, cached: false });
}

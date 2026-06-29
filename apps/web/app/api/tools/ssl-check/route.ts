import 'server-only';
import { z } from 'zod';
import { AppError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { checkSslCertificate, type SslCheckResult } from '@/lib/tools/ssl-check';
import { clientIp } from '@/lib/api/client-ip';
import { normalizeDomain } from '@/lib/tools/normalize-domain';

// Public, unauthenticated tool. Same defense in depth as the other tool routes:
//  1. SSRF guard before opening any TLS connection.
//  2. Per-IP rate limits (burst + hourly).
//  3. A Redis result cache keyed by domain so a popular host is read once per hour.
export const runtime = 'nodejs';

const bodySchema = z.object({
  domain: z.string().min(1).max(2048),
});

const CACHE_TTL_SECONDS = 60 * 60; // 1h
const RATE_BURST = { limit: 5, windowSec: 60 };
const RATE_HOURLY = { limit: 10, windowSec: 3600 };

interface SslApiResult {
  ok: true;
  domain: string;
  reachable: boolean;
  ssl: SslCheckResult | null;
}

export async function POST(req: Request): Promise<Response> {
  try {
    return await handleSslCheck(req);
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    logger.error({ service: 'web', err }, 'SSL check route unhandled error');
    return Response.json({ error: 'Something went wrong checking the certificate.' }, { status: 500 });
  }
}

async function handleSslCheck(req: Request): Promise<Response> {
  const ip = clientIp(req);

  const burst = await rateLimit(`tools:ssl-check:burst:${ip}`, RATE_BURST.limit, RATE_BURST.windowSec);
  if (!burst.allowed) return rateLimitResponse(burst.reset);
  const hourly = await rateLimit(`tools:ssl-check:hourly:${ip}`, RATE_HOURLY.limit, RATE_HOURLY.windowSec);
  if (!hourly.allowed) return rateLimitResponse(hourly.reset);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const domain = normalizeDomain(parsed.data.domain);
  if (!domain) throw new ValidationError('Enter a valid domain');

  const ssrf = await isHostnameSafe(domain);
  if (!ssrf.allowed) {
    throw new ValidationError(`Cannot check that domain: ${ssrf.reason ?? 'reserved address'}`);
  }

  const cacheKey = `tool:ssl-check:${domain}`;
  try {
    const cached = await getRedis().get(cacheKey);
    if (cached) {
      return Response.json({ ...(JSON.parse(cached) as SslApiResult), cached: true });
    }
  } catch {
    // Cache read failed -- proceed with a fresh check.
  }

  let ssl: SslCheckResult | null;
  try {
    ssl = await checkSslCertificate(domain);
  } catch (err) {
    logger.error({ service: 'web', domain, err }, 'SSL check failed');
    ssl = null;
  }

  const result: SslApiResult = { ok: true, domain, reachable: ssl !== null, ssl };

  try {
    await getRedis().set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);
  } catch {
    // Cache write failed -- still return the fresh result.
  }

  return Response.json({ ...result, cached: false });
}

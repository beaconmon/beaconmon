import 'server-only';
import { z } from 'zod';
import { AppError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { buildSnapshot, type SnapshotResult } from '@/lib/tools/snapshot';

// Public, unauthenticated tool. Defense in depth for the ungated surface:
//  1. SSRF guard on every submitted host (blocks internal/reserved targets).
//  2. Per-IP rate limits (burst + hourly) so no single client can flood.
//  3. A Redis result cache keyed by domain so a popular store is fetched once
//     per window, shielding both our egress and the target storefront.
export const runtime = 'nodejs';

const bodySchema = z.object({
  url: z.string().min(1).max(2048),
});

const CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h for a successful snapshot
const FAILURE_CACHE_TTL_SECONDS = 30 * 60; // 30m for a store we could not read
const RATE_BURST = { limit: 5, windowSec: 60 };
const RATE_HOURLY = { limit: 30, windowSec: 3600 };

/** First hop in X-Forwarded-For is the client; fall back to a shared bucket so a
 * missing header throttles together rather than bypassing the limit entirely. */
function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Normalize arbitrary user input to a bare storefront host: tolerate a missing
 * scheme, lowercase, and strip a leading www so the cache key is canonical. */
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
  // Must look like a real registrable domain (label.tld).
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null;
  return host;
}

// Bare route handler (no withAuth wrapper), so AppErrors thrown for validation
// and SSRF must be converted to responses here rather than bubbling to a 500.
export async function POST(req: Request): Promise<Response> {
  try {
    return await handleSnapshot(req);
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    logger.error({ service: 'web', err }, 'Snapshot route unhandled error');
    return Response.json({ error: 'Something went wrong running the snapshot.' }, { status: 500 });
  }
}

async function handleSnapshot(req: Request): Promise<Response> {
  const ip = clientIp(req);

  const burst = await rateLimit(`tools:snapshot:burst:${ip}`, RATE_BURST.limit, RATE_BURST.windowSec);
  if (!burst.allowed) return rateLimitResponse(burst.reset);
  const hourly = await rateLimit(`tools:snapshot:hourly:${ip}`, RATE_HOURLY.limit, RATE_HOURLY.windowSec);
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

  const cacheKey = `tool:snapshot:${domain}`;
  try {
    const cached = await getRedis().get(cacheKey);
    if (cached) {
      return Response.json({ ...(JSON.parse(cached) as SnapshotResult), cached: true });
    }
  } catch {
    // Cache read failed — fall through and build a fresh snapshot.
  }

  let result: SnapshotResult;
  try {
    result = await buildSnapshot(domain);
  } catch (err) {
    logger.error({ service: 'web', domain, err }, 'Snapshot build failed');
    result = { ok: false, reason: 'unreachable' };
  }

  try {
    const ttl = result.ok ? CACHE_TTL_SECONDS : FAILURE_CACHE_TTL_SECONDS;
    await getRedis().set(cacheKey, JSON.stringify(result), 'EX', ttl);
  } catch {
    // Cache write failed — still return the fresh result.
  }

  return Response.json({ ...result, cached: false });
}

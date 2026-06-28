import 'server-only';
import { z } from 'zod';
import { AppError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { checkUptime, type UptimeResult } from '@/lib/tools/uptime-check';

export const runtime = 'nodejs';

const bodySchema = z.object({
  url: z.string().min(1).max(2048),
});

const CACHE_TTL_SECONDS = 60;
const RATE_BURST = { limit: 5, windowSec: 60 };
const RATE_HOURLY = { limit: 15, windowSec: 3600 };

function clientIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const last = xff.split(',').at(-1)?.trim();
    if (last) return last;
  }
  return 'unknown';
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
    return await handleUptimeTest(req);
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    logger.error({ service: 'web', err }, 'Uptime test route unhandled error');
    return Response.json({ error: 'Something went wrong running the uptime test.' }, { status: 500 });
  }
}

async function handleUptimeTest(req: Request): Promise<Response> {
  const ip = clientIp(req);

  const burst = await rateLimit(`tools:uptime-test:burst:${ip}`, RATE_BURST.limit, RATE_BURST.windowSec);
  if (!burst.allowed) return rateLimitResponse(burst.reset);
  const hourly = await rateLimit(`tools:uptime-test:hourly:${ip}`, RATE_HOURLY.limit, RATE_HOURLY.windowSec);
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
    throw new ValidationError(`Cannot check that URL: ${ssrf.reason ?? 'reserved address'}`);
  }

  const cacheKey = `tool:uptime-test:${domain}`;
  try {
    const cached = await getRedis().get(cacheKey);
    if (cached) {
      return Response.json({ ...(JSON.parse(cached) as UptimeResult), cached: true });
    }
  } catch {
    // Cache read failed -- proceed with fresh check.
  }

  let result: UptimeResult;
  try {
    result = await checkUptime(domain);
  } catch (err) {
    logger.error({ service: 'web', domain, err }, 'Uptime check failed');
    return Response.json({
      ok: true,
      domain,
      status: 'down',
      checks: [{ region: 'global', label: 'Global (via Beaconmon servers)', httpStatus: null, responseMs: null, ok: false }],
      ssl: null,
      redirects: null,
      benchmark: null,
      cached: false,
    });
  }

  try {
    await getRedis().set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL_SECONDS);
  } catch {
    // Cache write failed -- still return the fresh result.
  }

  return Response.json({ ...result, cached: false });
}

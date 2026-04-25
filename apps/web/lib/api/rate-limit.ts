import 'server-only';
import { getRedis } from '@/lib/redis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Unix timestamp (seconds) when the current window resets */
  reset: number;
}

/**
 * Fixed-window rate limiter backed by Redis.
 *
 * Uses INCR + EXPIRE on a key scoped to the current time window. Simple,
 * reliable, and adds no new dependencies. Acceptable for MVP — the window
 * boundary reset is the only known edge case (burst allowed at boundary).
 *
 * @param key       Unique identifier for this limit bucket (e.g. `monitors:create:${teamId}`)
 * @param limit     Maximum allowed requests per window
 * @param windowSec Window duration in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  try {
    const redis = getRedis();
    const now = Math.floor(Date.now() / 1000);
    const windowStart = Math.floor(now / windowSec) * windowSec;
    const redisKey = `rl:${key}:${windowStart}`;

    // INCR is atomic — safe under concurrent requests
    const count = await redis.incr(redisKey);
    if (count === 1) {
      // First request in this window — set expiry (double window to handle clock skew)
      await redis.expire(redisKey, windowSec * 2);
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      reset: windowStart + windowSec,
    };
  } catch {
    // Redis unavailable — fail open so requests are not blocked
    return {
      allowed: true,
      remaining: limit,
      reset: Math.floor(Date.now() / 1000) + windowSec,
    };
  }
}

/**
 * Returns a 429 Response with standard rate-limit headers.
 * Call when rateLimit() returns allowed: false.
 */
export function rateLimitResponse(reset: number): Response {
  return Response.json(
    { error: 'Too many requests', retryAfter: reset - Math.floor(Date.now() / 1000) },
    {
      status: 429,
      headers: {
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(reset - Math.floor(Date.now() / 1000)),
      },
    }
  );
}

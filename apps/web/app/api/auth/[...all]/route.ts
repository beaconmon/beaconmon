import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';

const { GET, POST: _POST } = toNextJsHandler(auth);

// Auth POST (sign-in, sign-up, magic-link, password-reset): 10 attempts per 15 min per IP.
// Prevents credential brute-force. Fails open on Redis unavailability.
export { GET };

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1';

  try {
    const rl = await rateLimit(`auth:${ip}`, 10, 900);
    if (!rl.allowed) {
      logger.warn({ service: 'web', ip }, 'Auth rate limit exceeded');
      return rateLimitResponse(rl.reset);
    }
  } catch {
    // Redis unavailable — fail open so auth still works
  }

  return _POST(req);
}

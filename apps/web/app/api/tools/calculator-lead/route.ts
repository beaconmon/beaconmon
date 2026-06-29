import 'server-only';
import { z } from 'zod';
import { AppError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';
import { clientIp } from '@/lib/api/client-ip';

// Public, unauthenticated soft lead capture from the free calculators. There is
// no network egress here, so SSRF/Redis caching do not apply, but we still
// rate-limit per IP so the endpoint cannot be used to spam our logs.
export const runtime = 'nodejs';

const bodySchema = z.object({
  email: z.string().email().max(254),
  tool: z.string().min(1).max(64),
  result: z.union([z.string(), z.number()]).optional(),
  inputs: z.record(z.string(), z.unknown()).optional(),
});

const RATE_BURST = { limit: 3, windowSec: 60 };
const RATE_HOURLY = { limit: 10, windowSec: 3600 };

export async function POST(req: Request): Promise<Response> {
  try {
    return await handleCalculatorLead(req);
  } catch (err) {
    if (err instanceof AppError) return err.toResponse();
    logger.error({ service: 'web', err }, 'Calculator lead route unhandled error');
    return Response.json({ error: 'Something went wrong saving your result.' }, { status: 500 });
  }
}

async function handleCalculatorLead(req: Request): Promise<Response> {
  const ip = clientIp(req);

  const burst = await rateLimit(`tools:calculator-lead:burst:${ip}`, RATE_BURST.limit, RATE_BURST.windowSec);
  if (!burst.allowed) return rateLimitResponse(burst.reset);
  const hourly = await rateLimit(`tools:calculator-lead:hourly:${ip}`, RATE_HOURLY.limit, RATE_HOURLY.windowSec);
  if (!hourly.allowed) return rateLimitResponse(hourly.reset);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Enter a valid email address', parsed.error.issues);

  const { email, tool, result, inputs } = parsed.data;

  // TODO: Persist to an email_leads table once one exists in the Prisma schema.
  // Schema changes are out of scope for this build, so for now we log the lead
  // so it is captured in app logs and can be backfilled when the table lands.
  logger.info({ service: 'web', tool, email, result, inputs }, 'Calculator lead captured');

  return Response.json({ ok: true });
}

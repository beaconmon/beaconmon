import 'server-only';
import { z } from 'zod';
import { AppError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';
import { clientIp } from '@/lib/api/client-ip';
import { prisma, Prisma } from '@beaconmon/db';
import { sendCalculatorLeadEmail } from '@/lib/email/send-calculator-lead';

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
  const resultStr = result != null ? String(result) : null;

  // Upsert so re-submissions update the stored result without resending.
  const lead = await prisma.emailLead.upsert({
    where: { email_tool: { email, tool } },
    create: { email, tool, result: resultStr, inputs: inputs as Prisma.InputJsonValue | undefined, emailSent: false },
    update: { result: resultStr, inputs: inputs as Prisma.InputJsonValue | undefined },
    select: { id: true, emailSent: true },
  });

  if (!lead.emailSent) {
    try {
      const sent = await sendCalculatorLeadEmail({ email, tool, result: resultStr });
      if (sent) {
        await prisma.emailLead.update({
          where: { id: lead.id },
          data: { emailSent: true },
        });
      }
    } catch (err) {
      // Log but don't fail the request; the lead is persisted regardless.
      logger.error({ service: 'web', tool, err }, 'Calculator lead email failed, lead still saved');
    }
  }

  return Response.json({ ok: true });
}

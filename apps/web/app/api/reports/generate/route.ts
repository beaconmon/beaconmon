import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { getReportQueue } from '@/lib/queue';
import { ForbiddenError, PlanLimitError, ValidationError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const generateReportSchema = z.object({
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  clientName: z.string().min(1).max(100),
  clientNotes: z.string().max(500).optional(),
});

export const POST = withAuth(async (req, { teamId, role, plan }) => {
  if (role === 'viewer') throw new ForbiddenError();
  if (plan === 'free') throw new PlanLimitError('Report generation requires a Pro or Business plan');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = generateReportSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { periodStart, periodEnd, clientName, clientNotes } = parsed.data;

  if (new Date(periodEnd) <= new Date(periodStart)) {
    throw new ValidationError('periodEnd must be after periodStart');
  }

  const reportQueue = getReportQueue();
  const jobId = `report-${teamId}-${Date.now()}`;

  const job = await reportQueue.add(
    jobId,
    { teamId, periodStart, periodEnd, clientName, clientNotes },
    { jobId }
  );

  logger.info({ service: 'web', teamId, jobId: job.id, clientName }, 'Report generation enqueued');
  return Response.json({ jobId: job.id }, { status: 202 });
});

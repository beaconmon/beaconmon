import { withAuth } from '@/lib/api/with-auth';
import { statusPageRepository } from '@/lib/repositories/status-pages';
import { createStatusPageSchema } from '@/lib/validations/status-pages';
import { PLAN_LIMITS, ErrorCode } from '@beaconmon/types';
import { logger } from '@/lib/logger';
import { ForbiddenError, ValidationError, PlanLimitError } from '@/lib/api/errors';

export const GET = withAuth(async (_req, { teamId }) => {
  const pages = await statusPageRepository.findAll(teamId);
  return Response.json(pages);
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = createStatusPageSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { name, slug } = parsed.data;

  // Check slug uniqueness globally
  const taken = await statusPageRepository.slugExists(slug);
  if (taken) {
    return Response.json(
      { error: `The slug '${slug}' is already taken`, code: ErrorCode.SLUG_TAKEN },
      { status: 409 }
    );
  }

  // Check plan limit
  const limits = PLAN_LIMITS[plan];
  if (limits.statusPages !== -1) {
    const count = await statusPageRepository.countByTeam(teamId);
    if (count >= limits.statusPages) {
      throw new PlanLimitError(`Your plan allows a maximum of ${limits.statusPages} status pages`);
    }
  }

  const page = await statusPageRepository.create(teamId, { name, slug });
  logger.info({ service: 'web', teamId, statusPageId: page.id }, 'Status page created');
  return Response.json(page, { status: 201 });
});

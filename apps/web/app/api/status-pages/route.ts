import { withAuth } from '@/lib/api/with-auth';
import { statusPageRepository } from '@/lib/repositories/status-pages';
import { createStatusPageSchema } from '@/lib/validations/status-pages';
import { PLAN_LIMITS, ErrorCode } from '@beaconmon/types';
import { logger } from '@/lib/logger';

export const GET = withAuth(async (_req, { teamId }) => {
  const pages = await statusPageRepository.findAll(teamId);
  return Response.json(pages);
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body', code: ErrorCode.VALIDATION_ERROR },
      { status: 400 }
    );
  }

  const parsed = createStatusPageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', code: ErrorCode.VALIDATION_ERROR, issues: parsed.error.issues },
      { status: 400 }
    );
  }

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
      return Response.json(
        {
          error: `Your plan allows a maximum of ${limits.statusPages} status pages`,
          code: ErrorCode.PLAN_LIMIT_REACHED,
        },
        { status: 422 }
      );
    }
  }

  const page = await statusPageRepository.create(teamId, { name, slug });
  logger.info({ service: 'web', teamId, statusPageId: page.id }, 'Status page created');
  return Response.json(page, { status: 201 });
});

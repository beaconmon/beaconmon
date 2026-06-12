import { z } from 'zod';
import { PLAN_LIMITS } from '@beaconmon/types';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, PlanLimitError, ValidationError } from '@/lib/api/errors';
import { assertPublicHttpUrl } from '@/lib/validations/public-url';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const pages = await competitorRepository.findPages(teamId, params.id);
  return Response.json(pages);
});

const addPageSchema = z.object({
  label: z.string().min(1).max(200),
  url: z.string().url(),
  selector: z.string().optional(),
  intervalSeconds: z.number().int().min(60).optional(),
});

export const POST = withAuth<Params>(async (req, { teamId, plan, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = addPageSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  assertPublicHttpUrl(parsed.data.url);

  const limits = PLAN_LIMITS[plan];
  if (limits.competitorPagesPerCompetitor !== -1) {
    const count = await competitorRepository.countActivePages(teamId, params.id);
    if (count >= limits.competitorPagesPerCompetitor) {
      throw new PlanLimitError(
        `Your plan allows a maximum of ${limits.competitorPagesPerCompetitor} pages per competitor`
      );
    }
  }

  // Clamp instead of reject: the page still gets created, just at the slowest
  // cadence the plan permits.
  const intervalSeconds =
    parsed.data.intervalSeconds !== undefined
      ? Math.max(parsed.data.intervalSeconds, limits.checkIntervalSeconds)
      : undefined;

  const page = await competitorRepository.addPage(teamId, params.id, {
    ...parsed.data,
    intervalSeconds,
  });
  return Response.json(page, { status: 201 });
});

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { teamRepository } from '@/lib/repositories/teams';
import { z } from 'zod';

const bodySchema = z.object({ plan: z.enum(['business']) });

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.teamId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.teamId;

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    const planInfo = await teamRepository.findPlanInfo(teamId);

    if (!planInfo) {
      return Response.json({ error: 'Team not found' }, { status: 404 });
    }

    const onTrial = planInfo.trialEndsAt !== null && planInfo.trialEndsAt > new Date();
    const subStatus = planInfo.subscription?.status;
    const subActive = subStatus === 'active' || subStatus === 'past_due';

    if (!onTrial || subActive) {
      return Response.json({ error: 'Not on a trial' }, { status: 409 });
    }

    await teamRepository.updatePlan(teamId, parsed.data.plan);

    logger.info({ service: 'web', teamId, plan: parsed.data.plan }, 'Trial plan set');

    return Response.json({ ok: true });
  } catch (err) {
    logger.error({ service: 'web', teamId, err }, 'Failed to set trial plan');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

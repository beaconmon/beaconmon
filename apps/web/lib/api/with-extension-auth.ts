import { prisma } from '@beaconmon/db';
import { ErrorCode } from '@beaconmon/types';
import type { PlanTier, TeamRole } from '@beaconmon/types';
import { AppError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';
import { bearerFromRequest, resolveExtensionToken } from '@/lib/extension/token';
import type { AuthContext } from '@/lib/api/with-auth';

// Bearer-token auth for the Chrome extension. Deliberately separate from
// withAuth: the extension is cross-origin and carries no session cookie, and
// keeping it isolated means the central session path is untouched. It resolves
// the same AuthContext shape so downstream handlers (repositories, plan checks)
// work identically — tenant isolation still flows through teamId.

type ExtHandler = (req: Request, ctx: AuthContext) => Promise<Response>;

/** Resolve the team's effective plan, downgrading to free if a trial expired
 * with no active subscription. Mirrors the logic in withAuth / customSession. */
function effectivePlan(
  plan: PlanTier,
  trialEndsAt: Date | null,
  subStatus: string | undefined
): PlanTier {
  if (plan === 'free' || !trialEndsAt) return plan;
  const trialExpired = trialEndsAt < new Date();
  const hasActiveSub = subStatus === 'active' || subStatus === 'past_due';
  return trialExpired && !hasActiveSub ? 'free' : plan;
}

export function withExtensionAuth(handler: ExtHandler) {
  return async (req: Request): Promise<Response> => {
    const resolved = await resolveExtensionToken(bearerFromRequest(req));
    if (!resolved) {
      return Response.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const { userId, teamId } = resolved;

    // The token is scoped to a team, but membership can be revoked after issue,
    // so verify it fresh on every request rather than trusting the token alone.
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
      select: {
        role: true,
        team: {
          select: {
            plan: true,
            trialEndsAt: true,
            subscription: { select: { status: true } },
          },
        },
      },
    });

    if (!membership) {
      return Response.json(
        { error: 'Forbidden', code: ErrorCode.FORBIDDEN },
        { status: 403 }
      );
    }

    const ctx: AuthContext = {
      userId,
      teamId,
      role: membership.role as TeamRole,
      plan: effectivePlan(
        membership.team.plan as PlanTier,
        membership.team.trialEndsAt,
        membership.team.subscription?.status
      ),
    };

    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AppError) return err.toResponse();
      logger.error({ service: 'web', err, userId, teamId }, 'Unhandled error in extension route');
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

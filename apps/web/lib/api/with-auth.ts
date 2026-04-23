import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@beaconmon/db';
import { ErrorCode } from '@beaconmon/types';
import type { PlanTier, TeamRole } from '@beaconmon/types';

export interface AuthContext {
  userId: string;
  teamId: string;
  plan: PlanTier;
  role: TeamRole;
}

type RouteParams = { [key: string]: string | string[] | undefined };

type AuthHandler<P extends RouteParams = RouteParams> = (
  req: Request,
  ctx: AuthContext,
  params: P
) => Promise<Response>;

export function withAuth<P extends RouteParams = RouteParams>(handler: AuthHandler<P>) {
  return async (req: Request, routeCtx?: { params: Promise<P> | P }): Promise<Response> => {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Resolve teamId: X-Team-Id header takes priority, else use session default.
    const headerTeamId = req.headers.get('X-Team-Id');
    const teamId = headerTeamId ?? session.user.teamId;

    if (!teamId) {
      return Response.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // If a different team was requested via header, verify membership fresh.
    let plan: PlanTier;
    let role: TeamRole;

    if (headerTeamId && headerTeamId !== session.user.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: headerTeamId, userId } },
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

      role = membership.role as TeamRole;

      // Resolve effective plan for the switched-to team.
      let rawPlan = membership.team.plan as PlanTier;
      if (rawPlan !== 'free' && membership.team.trialEndsAt) {
        const subStatus = membership.team.subscription?.status;
        const trialExpired = membership.team.trialEndsAt < new Date();
        const hasActiveSub = subStatus === 'active' || subStatus === 'past_due';
        if (trialExpired && !hasActiveSub) {
          rawPlan = 'free';
        }
      }
      plan = rawPlan;
    } else {
      // Default team from session — still need the role.
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId } },
        select: { role: true },
      });

      if (!membership) {
        return Response.json(
          { error: 'Forbidden', code: ErrorCode.FORBIDDEN },
          { status: 403 }
        );
      }

      role = membership.role as TeamRole;
      plan = session.user.plan;
    }

    const authCtx: AuthContext = { userId, teamId, plan, role };

    try {
      const params = routeCtx?.params instanceof Promise
        ? await routeCtx.params
        : (routeCtx?.params ?? ({} as P));
      return await handler(req, authCtx, params);
    } catch (err) {
      logger.error({ service: 'web', err, userId, teamId }, 'Unhandled error in route handler');
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

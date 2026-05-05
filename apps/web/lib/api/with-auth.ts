import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@beaconmon/db';
import { ErrorCode } from '@beaconmon/types';
import type { PlanTier, TeamRole } from '@beaconmon/types';
import { AppError } from '@/lib/api/errors';

export interface AuthContext {
  userId: string;
  teamId: string;
  plan: PlanTier;
  role: TeamRole;
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  const prefix = `${name}=`;
  for (const part of header.split('; ')) {
    if (part.startsWith(prefix)) {
      try {
        return decodeURIComponent(part.slice(prefix.length));
      } catch {
        return null;
      }
    }
  }
  return null;
}

type RouteParams = { [key: string]: string | string[] | undefined };

type AuthHandler<P extends RouteParams = RouteParams> = (
  req: Request,
  ctx: AuthContext,
  params: P
) => Promise<Response>;

export function withAuth<P extends RouteParams = RouteParams>(handler: AuthHandler<P>) {
  // Next.js 16 generates `type RouteContext = { params: Promise<SegmentParams> }` and
  // checks that the exported handler's second arg extends that. Using Promise<any> for
  // params satisfies the constraint for all route segments. The cast to P is safe because
  // Next.js always resolves params to the correct shape for the route.
  return async (req: Request, routeCtx: { params: Promise<unknown> }): Promise<Response> => {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return Response.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Resolve teamId. Priority:
    //   1. X-Team-Id header (per-request override, server-to-server tools)
    //   2. bm_active_team cookie (set by /api/team/switch — persists user's selected team)
    //   3. session.user.teamId (most-recent membership baked into the session)
    const headerTeamId = req.headers.get('X-Team-Id');
    const cookieTeamId = readCookie(req, 'bm_active_team');
    const overrideTeamId = headerTeamId ?? cookieTeamId;
    const teamId = overrideTeamId ?? session.user.teamId;

    if (!teamId) {
      return Response.json(
        { error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // If a different team was requested via header or cookie, verify membership fresh.
    let plan: PlanTier;
    let role: TeamRole;

    if (overrideTeamId && overrideTeamId !== session.user.teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: overrideTeamId, userId } },
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
      const params = (await routeCtx.params ?? {}) as P;
      return await handler(req, authCtx, params);
    } catch (err) {
      if (err instanceof AppError) return err.toResponse();
      logger.error({ service: 'web', err, userId, teamId }, 'Unhandled error in route handler');
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

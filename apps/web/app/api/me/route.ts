import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';

export const GET = withAuth(async (_req, { userId, teamId, plan, role }) => {
  const team = await teamRepository.findById(teamId);

  return Response.json({
    userId,
    teamId,
    plan,
    role,
    teamName: team?.name ?? null,
    teamCreatedAt: team?.createdAt.toISOString() ?? null,
    trialEndsAt: team?.trialEndsAt?.toISOString() ?? null,
  });
});

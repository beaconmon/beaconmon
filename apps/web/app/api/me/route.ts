import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';

export const GET = withAuth(async (_req, { teamId, plan, role }) => {
  const teamCreatedAt = await teamRepository.findCreatedAt(teamId);

  return Response.json({
    teamId,
    plan,
    role,
    teamCreatedAt: teamCreatedAt?.toISOString() ?? null,
  });
});

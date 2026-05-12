import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';
import { prisma } from '@beaconmon/db';

export const GET = withAuth(async (_req, { userId, teamId, plan, role }) => {
  const [team, user] = await Promise.all([
    teamRepository.findById(teamId),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
  ]);

  return Response.json({
    userId,
    teamId,
    plan,
    role,
    email: user?.email ?? null,
    teamName: team?.name ?? null,
    teamCreatedAt: team?.createdAt.toISOString() ?? null,
    trialEndsAt: team?.trialEndsAt?.toISOString() ?? null,
  });
});

import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@beaconmon/db';

export const GET = withAuth(async (_req, { userId, teamId }) => {
  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { intelligenceLastSeenAt: true },
  });

  return Response.json({
    lastSeenAt: member?.intelligenceLastSeenAt ?? null,
  });
});

export const POST = withAuth(async (_req, { userId, teamId }) => {
  const before = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { intelligenceLastSeenAt: true },
  });

  const previousLastSeenAt = before?.intelligenceLastSeenAt ?? null;
  const now = new Date();

  await prisma.teamMember.update({
    where: { teamId_userId: { teamId, userId } },
    data: { intelligenceLastSeenAt: now },
  });

  return Response.json({
    previousLastSeenAt,
    lastSeenAt: now,
  });
});

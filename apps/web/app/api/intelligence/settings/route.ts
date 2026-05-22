import { prisma } from '@beaconmon/db';
import { digestPrefsSchema, updateDigestPrefsSchema } from '@beaconmon/types';
import { withAuth } from '@/lib/api/with-auth';
import { ValidationError, ForbiddenError } from '@/lib/api/errors';

export const GET = withAuth(async (_req, ctx) => {
  const { teamId, plan } = ctx;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { digestPrefs: true },
  });

  const parsedPrefs = digestPrefsSchema.safeParse(team?.digestPrefs ?? {});
  const prefs = parsedPrefs.success ? parsedPrefs.data : {
    frequency: null,
    channelIds: [],
    sections: { incidents: true, ownContent: true, competitors: true, smartAlerts: true, expiry: true },
  };

  return Response.json({ prefs, plan });
});

export const PATCH = withAuth(async (req, ctx) => {
  const { teamId, plan } = ctx;

  const body = await req.json().catch(() => null);
  const parsed = updateDigestPrefsSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError('Invalid request body');
  }

  const input = parsed.data;

  // Plan gates
  if (plan === 'free' && input.frequency !== null) {
    throw new ForbiddenError('Intelligence Digest requires a paid plan');
  }
  if (plan === 'starter' && (input.frequency === 'daily' || input.frequency === 'both')) {
    throw new ForbiddenError('Daily digest requires Growth or Scale plan');
  }

  // Validate that all channelIds belong to this team
  if (input.channelIds.length > 0) {
    const count = await prisma.alertChannel.count({
      where: { id: { in: input.channelIds }, teamId },
    });
    if (count !== input.channelIds.length) {
      throw new ValidationError('One or more channel IDs are invalid');
    }
  }

  await prisma.team.update({
    where: { id: teamId },
    data: { digestPrefs: input },
  });

  return Response.json({ ok: true });
});

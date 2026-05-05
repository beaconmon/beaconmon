import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { notificationPreferenceRepository } from '@/lib/repositories/notification-preferences';
import { ValidationError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const patchSchema = z.object({
  primaryChannelId: z.string().min(1).nullable(),
});

export const GET = withAuth(async (_req, { userId, teamId }) => {
  const prefs = await notificationPreferenceRepository.getOrSeedForUser(userId, teamId);
  return Response.json(prefs);
});

export const PATCH = withAuth(async (req, { userId, teamId }) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const ok = await notificationPreferenceRepository.setPrimaryChannel(
    userId,
    teamId,
    parsed.data.primaryChannelId
  );
  if (!ok) throw new ValidationError('Channel does not belong to this user');

  logger.info(
    { service: 'web', userId, teamId, primaryChannelId: parsed.data.primaryChannelId },
    'Notification preference updated'
  );
  const fresh = await notificationPreferenceRepository.getOrSeedForUser(userId, teamId);
  return Response.json(fresh);
});

import { withAuth } from '@/lib/api/with-auth';
import { alertChannelRepository } from '@/lib/repositories/alert-channels';
import { createAlertChannelSchema } from '@/lib/validations/alert-channels';
import { PLAN_LIMITS } from '@beaconmon/types';
import { logger } from '@/lib/logger';
import { ForbiddenError, ValidationError, PlanLimitError } from '@/lib/api/errors';

export const GET = withAuth(async (_req, { teamId }) => {
  const channels = await alertChannelRepository.findAll(teamId);
  return Response.json(channels);
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = createAlertChannelSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const limits = PLAN_LIMITS[plan];
  if (limits.alertChannels !== -1) {
    const count = await alertChannelRepository.countByTeam(teamId);
    if (count >= limits.alertChannels) {
      throw new PlanLimitError(`Your plan allows a maximum of ${limits.alertChannels} alert channels`);
    }
  }

  const channel = await alertChannelRepository.create(teamId, parsed.data);
  logger.info({ service: 'web', teamId, channelId: channel.id }, 'Alert channel created');
  return Response.json(channel, { status: 201 });
});

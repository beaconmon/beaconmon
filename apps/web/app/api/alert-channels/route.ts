import { withAuth } from '@/lib/api/with-auth';
import { alertChannelRepository } from '@/lib/repositories/alert-channels';
import { createAlertChannelSchema } from '@/lib/validations/alert-channels';
import { PLAN_LIMITS, ErrorCode } from '@beaconmon/types';
import { logger } from '@/lib/logger';

export const GET = withAuth(async (_req, { teamId }) => {
  const channels = await alertChannelRepository.findAll(teamId);
  return Response.json(channels);
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body', code: ErrorCode.VALIDATION_ERROR },
      { status: 400 }
    );
  }

  const parsed = createAlertChannelSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', code: ErrorCode.VALIDATION_ERROR, issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const limits = PLAN_LIMITS[plan];
  if (limits.alertChannels !== -1) {
    const count = await alertChannelRepository.countByTeam(teamId);
    if (count >= limits.alertChannels) {
      return Response.json(
        {
          error: `Your plan allows a maximum of ${limits.alertChannels} alert channels`,
          code: ErrorCode.PLAN_LIMIT_REACHED,
        },
        { status: 422 }
      );
    }
  }

  const channel = await alertChannelRepository.create(teamId, parsed.data);
  logger.info({ service: 'web', teamId, channelId: channel.id }, 'Alert channel created');
  return Response.json(channel, { status: 201 });
});

import { z } from 'zod';
import { invitationRepository } from '@/lib/repositories/invitations';
import { logger } from '@/lib/logger';
import { ErrorCode } from '@beaconmon/types';

const acceptSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(
  req: Request,
  routeCtx: { params: Promise<{ token: string }> }
): Promise<Response> {
  const { token } = await routeCtx.params;

  const invitation = await invitationRepository.findByToken(token);

  if (!invitation) {
    return Response.json(
      { error: 'Invitation not found', code: ErrorCode.INVITATION_NOT_FOUND },
      { status: 404 }
    );
  }

  if (invitation.expiresAt < new Date()) {
    return Response.json(
      { error: 'This invitation has expired', code: ErrorCode.INVITATION_EXPIRED },
      { status: 410 }
    );
  }

  if (invitation.acceptedAt) {
    return Response.json(
      { error: 'This invitation has already been used', code: ErrorCode.FORBIDDEN },
      { status: 409 }
    );
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

  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', code: ErrorCode.VALIDATION_ERROR },
      { status: 400 }
    );
  }

  const { userId } = parsed.data;

  try {
    await invitationRepository.accept(token, userId);
  } catch (err) {
    logger.error({ service: 'web', token, userId, err }, 'Failed to accept invitation');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  logger.info({ service: 'web', teamId: invitation.teamId, userId }, 'Invitation accepted');
  return Response.json({ teamId: invitation.teamId });
}

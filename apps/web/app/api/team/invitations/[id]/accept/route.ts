import { auth } from '@/lib/auth';
import { invitationRepository } from '@/lib/repositories/invitations';
import { logger } from '@/lib/logger';
import { ErrorCode } from '@beaconmon/types';

export async function POST(
  req: Request,
  routeCtx: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized', code: ErrorCode.UNAUTHORIZED }, { status: 401 });
  }

  const userId = session.user.id;
  const { id: token } = await routeCtx.params;

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

  try {
    await invitationRepository.accept(token, userId);
  } catch (err) {
    logger.error({ service: 'web', token, userId, err }, 'Failed to accept invitation');
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }

  logger.info({ service: 'web', teamId: invitation.teamId, userId }, 'Invitation accepted');
  return Response.json({ teamId: invitation.teamId });
}

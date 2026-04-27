import crypto from 'node:crypto';
import { withAuth } from '@/lib/api/with-auth';
import { invitationRepository } from '@/lib/repositories/invitations';
import { logger } from '@/lib/logger';
import { ErrorCode } from '@beaconmon/types';
import { sendInvitationEmail } from '@/lib/email/send-invitation';

export const DELETE = withAuth(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const id = params['id'] as string;

  try {
    await invitationRepository.revoke(teamId, id);
  } catch {
    return Response.json(
      { error: 'Invitation not found', code: ErrorCode.RESOURCE_NOT_FOUND },
      { status: 404 }
    );
  }

  logger.info({ service: 'web', teamId, invitationId: id }, 'Invitation revoked');
  return new Response(null, { status: 204 });
});

export const PATCH = withAuth(async (req, { teamId, role, userId }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const id = params['id'] as string;
  const newToken = crypto.randomBytes(32).toString('hex');
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  let invitation;
  try {
    invitation = await invitationRepository.resend(teamId, id, newToken, newExpiresAt);
  } catch {
    return Response.json(
      { error: 'Invitation not found', code: ErrorCode.RESOURCE_NOT_FOUND },
      { status: 404 }
    );
  }

  await sendInvitationEmail({ teamId, userId, invitation, token: newToken });

  logger.info({ service: 'web', teamId, invitationId: id }, 'Invitation resent');
  return Response.json(invitation);
});


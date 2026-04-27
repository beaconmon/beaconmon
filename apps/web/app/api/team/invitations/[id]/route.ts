import crypto from 'node:crypto';
import { Prisma } from '@beaconmon/db';
import { withAuth } from '@/lib/api/with-auth';
import { invitationRepository } from '@/lib/repositories/invitations';
import { logger } from '@/lib/logger';
import { sendInvitationEmail } from '@/lib/email/send-invitation';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';

export const DELETE = withAuth(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const id = params['id'] as string;

  try {
    await invitationRepository.revoke(teamId, id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError('Invitation not found');
    }
    throw err;
  }

  logger.info({ service: 'web', teamId, invitationId: id }, 'Invitation revoked');
  return new Response(null, { status: 204 });
});

export const PATCH = withAuth(async (req, { teamId, role, userId }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const id = params['id'] as string;
  const newToken = crypto.randomBytes(32).toString('hex');
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  let invitation;
  try {
    invitation = await invitationRepository.resend(teamId, id, newToken, newExpiresAt);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError('Invitation not found');
    }
    throw err;
  }

  await sendInvitationEmail({ teamId, userId, invitation, token: newToken });

  logger.info({ service: 'web', teamId, invitationId: id }, 'Invitation resent');
  return Response.json(invitation);
});

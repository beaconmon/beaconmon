import crypto from 'node:crypto';
import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { withAuth } from '@/lib/api/with-auth';
import { invitationRepository } from '@/lib/repositories/invitations';
import { logger } from '@/lib/logger';
import { ErrorCode } from '@beaconmon/types';
import { TeamInvitation } from '@/emails/team-invitation';

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

async function sendInvitationEmail({
  teamId,
  userId,
  invitation,
  token,
}: {
  teamId: string;
  userId: string;
  invitation: { email: string; role: string };
  token: string;
}) {
  const resendApiKey = process.env['RESEND_API_KEY'];
  const emailFrom = process.env['EMAIL_FROM'];
  const appUrl = process.env['BETTER_AUTH_URL'] ?? 'http://localhost:3000';

  if (!resendApiKey || !emailFrom) {
    logger.warn({ service: 'web', teamId }, 'RESEND_API_KEY or EMAIL_FROM not set — skipping invitation email');
    return;
  }

  const { prisma } = await import('@beaconmon/db');
  const [team, inviter] = await Promise.all([
    prisma.team.findUnique({ where: { id: teamId }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);

  const inviteUrl = `${appUrl}/invite/${token}`;
  const html = await render(
    React.createElement(TeamInvitation, {
      inviterName: inviter?.name ?? 'A teammate',
      teamName: team?.name ?? 'the team',
      role: invitation.role,
      inviteUrl,
    })
  );

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: emailFrom,
    to: invitation.email,
    subject: `You've been invited to join ${team?.name ?? 'a team'} on Beaconmon`,
    html,
  });

  if (error) {
    logger.error({ service: 'web', teamId, err: error }, 'Failed to send invitation email');
  }
}

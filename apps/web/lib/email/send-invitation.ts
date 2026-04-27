import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { logger } from '@/lib/logger';
import { TeamInvitation } from '@/emails/team-invitation';

export async function sendInvitationEmail({
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

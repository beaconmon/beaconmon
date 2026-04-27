import crypto from 'node:crypto';
import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { invitationRepository } from '@/lib/repositories/invitations';
import { teamRepository } from '@/lib/repositories/teams';
import { logger } from '@/lib/logger';
import { PLAN_LIMITS, ErrorCode } from '@beaconmon/types';
import { sendInvitationEmail } from '@/lib/email/send-invitation';
import { ForbiddenError, ValidationError, PlanLimitError } from '@/lib/api/errors';

const sendInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'viewer']),
});

export const GET = withAuth(async (_req, { teamId, role }) => {
  if (role === 'viewer') throw new ForbiddenError();
  const invitations = await invitationRepository.findPending(teamId);
  return Response.json(invitations);
});

export const POST = withAuth(async (req, { teamId, plan, role, userId }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = sendInviteSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { email, role: inviteRole } = parsed.data;

  // Privilege escalation guard: admins can only invite viewers; only owners can invite admins
  if (role === 'admin' && inviteRole !== 'viewer') throw new ForbiddenError();

  // Plan limit check (counts accepted members only)
  const limits = PLAN_LIMITS[plan];
  if (limits.teamMembers !== -1) {
    const count = await teamRepository.countMembers(teamId);
    if (count >= limits.teamMembers) {
      throw new PlanLimitError(`Your plan allows a maximum of ${limits.teamMembers} team members`);
    }
  }

  // Check if already a member
  const { prisma } = await import('@beaconmon/db');
  const existingMember = await prisma.teamMember.findFirst({
    where: { teamId, user: { email } },
  });
  if (existingMember) {
    return Response.json(
      { error: 'This email address is already a team member', code: ErrorCode.EMAIL_ALREADY_MEMBER },
      { status: 409 }
    );
  }

  // Check for pending invite
  const existingInvite = await invitationRepository.findByEmail(teamId, email);
  if (existingInvite) {
    return Response.json(
      {
        error: 'An invitation is already pending for this email',
        code: ErrorCode.INVITATION_ALREADY_PENDING,
        invitationId: existingInvite.id,
      },
      { status: 409 }
    );
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await invitationRepository.create(teamId, email, inviteRole, token, expiresAt);

  // Send email
  await sendInvitationEmail({ teamId, userId, invitation, token });

  logger.info({ service: 'web', teamId, invitationId: invitation.id }, 'Invitation sent');
  return Response.json(invitation, { status: 201 });
});

import { z } from 'zod';
import { Prisma } from '@beaconmon/db';
import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';
import { escalationPolicyRepository } from '@/lib/repositories/escalation-policies';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api/errors';

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'viewer']),
});

export const PATCH = withAuth(async (req, { teamId, role, userId: callerId }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const targetUserId = params['userId'] as string;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { role: newRole } = parsed.data;

  // Privilege escalation guard: admins cannot assign admin or owner roles
  if (role === 'admin' && newRole !== 'viewer') throw new ForbiddenError();

  // Prevent demoting the last owner
  const members = await teamRepository.findMembers(teamId);
  const targetMember = members.find((m) => m.userId === targetUserId);
  if (!targetMember) throw new NotFoundError('Member not found');

  if (targetMember.role === 'owner') {
    const ownerCount = members.filter((m) => m.role === 'owner').length;
    if (ownerCount <= 1) throw new ForbiddenError('Cannot demote the last owner of the team');
  }

  try {
    await teamRepository.updateMemberRole(teamId, targetUserId, newRole);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError('Member not found');
    }
    throw err;
  }

  logger.info({ service: 'web', teamId, targetUserId, newRole, callerId }, 'Member role updated');
  return Response.json({ success: true });
});

export const DELETE = withAuth(async (_req, { teamId, role, userId: callerId }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const targetUserId = params['userId'] as string;

  // Prevent self-removal
  if (targetUserId === callerId) {
    throw new ForbiddenError('You cannot remove yourself from the team');
  }

  // Prevent removing the last owner
  const members = await teamRepository.findMembers(teamId);
  const targetMember = members.find((m) => m.userId === targetUserId);
  if (!targetMember) throw new NotFoundError('Member not found');

  if (targetMember.role === 'owner') {
    const ownerCount = members.filter((m) => m.role === 'owner').length;
    if (ownerCount <= 1) throw new ForbiddenError('Cannot remove the last owner of the team');
  }

  try {
    await teamRepository.removeMember(teamId, targetUserId);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError('Member not found');
    }
    throw err;
  }

  // Null out this user's escalation-step recipient rows so the worker stops
  // routing alerts to them; UI surfaces the row as "Removed user" until the
  // owner cleans the policy up.
  const removedRecipients = await escalationPolicyRepository.markUserRemovedFromTeam(
    teamId,
    targetUserId
  );

  logger.info(
    { service: 'web', teamId, targetUserId, callerId, removedRecipients },
    'Member removed'
  );
  return new Response(null, { status: 204 });
});

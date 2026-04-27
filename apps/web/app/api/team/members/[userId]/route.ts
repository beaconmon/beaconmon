import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';
import { logger } from '@/lib/logger';
import { ErrorCode } from '@beaconmon/types';

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'viewer']),
});

export const PATCH = withAuth(async (req, { teamId, role, userId: callerId }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const targetUserId = params['userId'] as string;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body', code: ErrorCode.VALIDATION_ERROR },
      { status: 400 }
    );
  }

  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', code: ErrorCode.VALIDATION_ERROR, issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { role: newRole } = parsed.data;

  // Privilege escalation guard: admins cannot assign admin or owner roles
  if (role === 'admin' && newRole !== 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  // Prevent demoting the last owner
  const members = await teamRepository.findMembers(teamId);
  const targetMember = members.find((m) => m.userId === targetUserId);
  if (!targetMember) {
    return Response.json(
      { error: 'Member not found', code: ErrorCode.RESOURCE_NOT_FOUND },
      { status: 404 }
    );
  }
  if (targetMember.role === 'owner') {
    const ownerCount = members.filter((m) => m.role === 'owner').length;
    if (ownerCount <= 1) {
      return Response.json(
        { error: 'Cannot demote the last owner of the team', code: ErrorCode.FORBIDDEN },
        { status: 403 }
      );
    }
  }

  try {
    await teamRepository.updateMemberRole(teamId, targetUserId, newRole);
  } catch {
    return Response.json(
      { error: 'Member not found', code: ErrorCode.RESOURCE_NOT_FOUND },
      { status: 404 }
    );
  }

  logger.info({ service: 'web', teamId, targetUserId, newRole, callerId }, 'Member role updated');
  return Response.json({ success: true });
});

export const DELETE = withAuth(async (_req, { teamId, role, userId: callerId }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const targetUserId = params['userId'] as string;

  // Prevent self-removal
  if (targetUserId === callerId) {
    return Response.json(
      { error: 'You cannot remove yourself from the team', code: ErrorCode.FORBIDDEN },
      { status: 403 }
    );
  }

  // Prevent removing the last owner
  const members = await teamRepository.findMembers(teamId);
  const targetMember = members.find((m) => m.userId === targetUserId);
  if (!targetMember) {
    return Response.json(
      { error: 'Member not found', code: ErrorCode.RESOURCE_NOT_FOUND },
      { status: 404 }
    );
  }
  if (targetMember.role === 'owner') {
    const ownerCount = members.filter((m) => m.role === 'owner').length;
    if (ownerCount <= 1) {
      return Response.json(
        { error: 'Cannot remove the last owner of the team', code: ErrorCode.FORBIDDEN },
        { status: 403 }
      );
    }
  }

  try {
    await teamRepository.removeMember(teamId, targetUserId);
  } catch {
    return Response.json(
      { error: 'Member not found', code: ErrorCode.RESOURCE_NOT_FOUND },
      { status: 404 }
    );
  }

  logger.info({ service: 'web', teamId, targetUserId, callerId }, 'Member removed');
  return new Response(null, { status: 204 });
});

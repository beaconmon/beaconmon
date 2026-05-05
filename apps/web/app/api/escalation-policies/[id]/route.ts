import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import {
  escalationPolicyRepository,
  EscalationValidationError,
} from '@/lib/repositories/escalation-policies';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const escalationStepSchema = z
  .object({
    stepOrder: z.number().int().min(0),
    delayMinutes: z.number().int().min(0),
    channelIds: z.array(z.string().min(1)).default([]),
    userIds: z.array(z.string().min(1)).default([]),
  })
  .refine((s) => s.channelIds.length + s.userIds.length > 0, {
    message: 'Each step must have at least one recipient (channel or user)',
  });

const updateEscalationPolicySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  steps: z.array(escalationStepSchema).min(1).max(10).optional(),
});

export const GET = withAuth(async (_req, { teamId }, params) => {
  const { id } = params as { id: string };
  const policy = await escalationPolicyRepository.findById(teamId, id);
  if (!policy) throw new NotFoundError();
  return Response.json(policy);
});

export const PATCH = withAuth(async (req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const { id } = params as { id: string };

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateEscalationPolicySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  try {
    const policy = await escalationPolicyRepository.update(teamId, id, parsed.data);
    if (!policy) throw new NotFoundError();
    logger.info({ service: 'web', teamId, policyId: id }, 'Escalation policy updated');
    return Response.json(policy);
  } catch (err) {
    if (err instanceof EscalationValidationError) {
      throw new ValidationError(err.message);
    }
    throw err;
  }
});

export const DELETE = withAuth(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const { id } = params as { id: string };
  const deleted = await escalationPolicyRepository.delete(teamId, id);
  if (!deleted) throw new NotFoundError();

  logger.info({ service: 'web', teamId, policyId: id }, 'Escalation policy deleted');
  return new Response(null, { status: 204 });
});

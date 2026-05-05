import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import {
  escalationPolicyRepository,
  EscalationValidationError,
} from '@/lib/repositories/escalation-policies';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';
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

const createEscalationPolicySchema = z.object({
  name: z.string().min(1).max(100),
  steps: z.array(escalationStepSchema).min(1).max(10),
});

export const GET = withAuth(async (_req, { teamId }) => {
  const policies = await escalationPolicyRepository.findAll(teamId);
  return Response.json(policies);
});

export const POST = withAuth(async (req, { teamId, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = createEscalationPolicySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  try {
    const { policy, wasSetAsDefault } = await escalationPolicyRepository.create(
      teamId,
      parsed.data
    );
    logger.info(
      { service: 'web', teamId, policyId: policy.id, wasSetAsDefault },
      'Escalation policy created'
    );
    return Response.json({ ...policy, wasSetAsDefault }, { status: 201 });
  } catch (err) {
    if (err instanceof EscalationValidationError) {
      throw new ValidationError(err.message);
    }
    throw err;
  }
});

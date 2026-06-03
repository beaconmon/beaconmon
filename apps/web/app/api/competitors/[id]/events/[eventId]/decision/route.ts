import { z } from 'zod';
import { prisma } from '@beaconmon/db';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; eventId: string; [key: string]: string };

const decisionSchema = z.object({
  response: z.enum(['ignore', 'match', 'counter', 'leapfrog']),
  note: z.string().optional(),
});

async function assertEventOwnership(teamId: string, competitorId: string, eventId: string) {
  const row = await prisma.competitorEvent.findFirst({
    where: { id: eventId, competitorId, teamId },
    select: { id: true },
  });
  if (!row) throw new NotFoundError();
}

export const POST = withAuth<Params>(async (req, { teamId, userId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  await assertEventOwnership(teamId, params.id, params.eventId);

  const decision = await competitorRepository.upsertDecision(
    teamId,
    params.eventId,
    parsed.data.response,
    parsed.data.note,
    userId
  );
  return Response.json(decision);
});

export const DELETE = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  await assertEventOwnership(teamId, params.id, params.eventId);
  await competitorRepository.deleteDecision(teamId, params.eventId);
  return new Response(null, { status: 204 });
});

import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const channels = await competitorRepository.findChannels(teamId, params.id);
  return Response.json(channels);
});

const addChannelSchema = z.object({
  channelId: z.string().min(1),
});

export const POST = withAuth<Params>(async (req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = addChannelSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  await competitorRepository.addChannel(teamId, params.id, parsed.data.channelId);
  return new Response(null, { status: 201 });
});

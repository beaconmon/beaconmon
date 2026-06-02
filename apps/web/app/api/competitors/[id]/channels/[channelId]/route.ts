import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError } from '@/lib/api/errors';

type Params = { id: string; channelId: string; [key: string]: string };

export const DELETE = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  await competitorRepository.removeChannel(teamId, params.id, params.channelId);
  return new Response(null, { status: 204 });
});

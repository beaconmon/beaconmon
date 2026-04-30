import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';

export const GET = withAuth(async (_req, { teamId }) => {
  const tags = await monitorRepository.listTags(teamId);
  return Response.json(tags);
});

import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';

export const GET = withAuth(async (_req, { teamId }) => {
  const members = await teamRepository.findMembers(teamId);
  return Response.json(members);
});

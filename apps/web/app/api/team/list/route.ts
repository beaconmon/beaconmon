import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';

export const GET = withAuth(async (_req, { userId }) => {
  const memberships = await teamRepository.findUserMemberships(userId);
  return Response.json(memberships);
});

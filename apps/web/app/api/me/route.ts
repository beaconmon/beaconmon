import { withAuth } from '@/lib/api/with-auth';

export const GET = withAuth(async (_req, { teamId, plan, role }) => {
  return Response.json({ teamId, plan, role });
});

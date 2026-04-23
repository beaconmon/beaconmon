import { withAuth } from '@/lib/api/with-auth';
import { incidentRepository } from '@/lib/repositories/incidents';

export const GET = withAuth(async (_req, { teamId }) => {
  const incidents = await incidentRepository.findByTeam(teamId);
  return Response.json(incidents);
});

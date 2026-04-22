import { withAuth } from '@/lib/api/with-auth';
import { incidentRepository } from '@/lib/repositories/incidents';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const incidents = await incidentRepository.findByMonitor(teamId, params.id);
  return Response.json(incidents);
});

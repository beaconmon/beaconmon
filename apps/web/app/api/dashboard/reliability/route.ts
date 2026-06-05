import { withAuth } from '@/lib/api/with-auth';
import { monitoringRunRepository } from '@/lib/repositories/monitoring-runs';

export const GET = withAuth(async (_req, { teamId }) => {
  const stats = await monitoringRunRepository.reliability30d(teamId);
  return Response.json(stats);
});

import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { checkResultRepository } from '@/lib/repositories/check-results';

export const GET = withAuth(async (_req, { teamId, plan }) => {
  const monitors = await monitorRepository.findAll(teamId);
  const monitorIds = monitors.map((m) => m.id);

  if (monitorIds.length === 0) {
    return Response.json({});
  }

  const summaries = await checkResultRepository.getMonitorSummaries(teamId, monitorIds, plan);

  const result: Record<string, { uptime30d: number | null; recentRts: number[]; lastSnapshotAt: string | null }> = {};
  for (const [id, data] of summaries) {
    result[id] = {
      uptime30d: data.uptime30d,
      recentRts: data.recentRts,
      lastSnapshotAt: data.lastSnapshotAt ? data.lastSnapshotAt.toISOString() : null,
    };
  }

  return Response.json(result);
});

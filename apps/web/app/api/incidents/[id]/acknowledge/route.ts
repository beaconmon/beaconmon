import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@beaconmon/db';
import { logger } from '@/lib/logger';
import { NotFoundError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const PATCH = withAuth<Params>(async (_req, { teamId, userId }, params) => {
  const incidentId = params.id;

  // Verify the incident belongs to this team and is still open
  const incident = await prisma.incident.findFirst({
    where: { id: incidentId, teamId, resolvedAt: null },
    select: { id: true, acknowledgedAt: true },
  });

  if (!incident) throw new NotFoundError('Incident not found or already resolved');

  if (incident.acknowledgedAt) {
    return Response.json({ acknowledged: true, alreadyAcknowledged: true });
  }

  const now = new Date();
  await prisma.incident.update({
    where: { id: incidentId },
    data: { acknowledgedAt: now, acknowledgedBy: userId },
  });

  logger.info({ service: 'web', teamId, incidentId, userId }, 'Incident acknowledged');
  return Response.json({ acknowledged: true, acknowledgedAt: now.toISOString() });
});

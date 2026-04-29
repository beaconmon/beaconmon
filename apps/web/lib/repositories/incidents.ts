import { prisma } from '@beaconmon/db';

export interface IncidentRow {
  id: string;
  monitorId: string;
  startedAt: Date;
  resolvedAt: Date | null;
  resolutionType: string | null;
  acknowledgedAt: Date | null;
  acknowledgedBy: string | null;
  createdAt: Date;
}

export interface IncidentWithMonitor extends IncidentRow {
  monitor: { name: string; url: string };
}

interface BatchResult {
  count: number;
}

export const incidentRepository: {
  findByMonitor(teamId: string, monitorId: string, limit?: number): Promise<IncidentRow[]>;
  findByTeam(teamId: string, limit?: number): Promise<IncidentWithMonitor[]>;
  resolve(teamId: string, incidentId: string): Promise<BatchResult>;
} = {
  async findByMonitor(teamId, monitorId, limit = 50) {
    const rows = await prisma.incident.findMany({
      where: { teamId, monitorId },
      select: {
        id: true,
        monitorId: true,
        startedAt: true,
        resolvedAt: true,
        resolutionType: true,
        acknowledgedAt: true,
        acknowledgedBy: true,
        createdAt: true,
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
    return rows as IncidentRow[];
  },

  async findByTeam(teamId, limit = 50) {
    const rows = await prisma.incident.findMany({
      where: { teamId },
      select: {
        id: true,
        monitorId: true,
        startedAt: true,
        resolvedAt: true,
        resolutionType: true,
        acknowledgedAt: true,
        acknowledgedBy: true,
        createdAt: true,
        monitor: { select: { name: true, url: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
    return rows as IncidentWithMonitor[];
  },

  async resolve(teamId, incidentId) {
    return prisma.incident.updateMany({
      where: { id: incidentId, teamId, resolvedAt: null },
      data: {
        resolvedAt: new Date(),
        resolutionType: 'manual',
      },
    });
  },
};

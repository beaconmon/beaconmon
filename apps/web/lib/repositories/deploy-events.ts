import { prisma } from '@beaconmon/db';
import type { CreateDeployEventInput } from '@/lib/validations/deploy-events';

export interface DeployEventRow {
  id: string;
  monitorId: string;
  startedAt: Date;
  endedAt: Date | null;
  commitSha: string | null;
  description: string | null;
  suppressAlerts: boolean;
  createdAt: Date;
}

export const deployEventRepository = {
  async create(
    teamId: string,
    monitorId: string,
    data: CreateDeployEventInput
  ): Promise<DeployEventRow> {
    const endedAt = data.durationMinutes
      ? new Date(Date.now() + data.durationMinutes * 60 * 1000)
      : null;

    return prisma.deployEvent.create({
      data: {
        teamId,
        monitorId,
        commitSha: data.commitSha,
        description: data.description,
        suppressAlerts: data.suppressAlerts ?? true,
        endedAt,
      },
      select: {
        id: true,
        monitorId: true,
        startedAt: true,
        endedAt: true,
        commitSha: true,
        description: true,
        suppressAlerts: true,
        createdAt: true,
      },
    });
  },

  async endActiveDeploy(
    teamId: string,
    monitorId: string
  ): Promise<DeployEventRow | null> {
    const now = new Date();

    // Find the most recent active deploy for this monitor
    const active = await prisma.deployEvent.findFirst({
      where: {
        teamId,
        monitorId,
        startedAt: { lte: now },
        OR: [{ endedAt: null }, { endedAt: { gte: now } }],
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!active) return null;

    return prisma.deployEvent.update({
      where: { id: active.id },
      data: { endedAt: now },
      select: {
        id: true,
        monitorId: true,
        startedAt: true,
        endedAt: true,
        commitSha: true,
        description: true,
        suppressAlerts: true,
        createdAt: true,
      },
    });
  },

  async list(
    teamId: string,
    monitorId: string,
    options: { from?: Date; to?: Date; limit: number }
  ): Promise<DeployEventRow[]> {
    const where: Record<string, unknown> = { teamId, monitorId };

    if (options.from || options.to) {
      const startedAt: Record<string, Date> = {};
      if (options.from) startedAt.gte = options.from;
      if (options.to) startedAt.lte = options.to;
      where.startedAt = startedAt;
    }

    return prisma.deployEvent.findMany({
      where,
      select: {
        id: true,
        monitorId: true,
        startedAt: true,
        endedAt: true,
        commitSha: true,
        description: true,
        suppressAlerts: true,
        createdAt: true,
      },
      orderBy: { startedAt: 'desc' },
      take: options.limit,
    });
  },
};

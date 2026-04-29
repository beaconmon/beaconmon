import { prisma } from '@beaconmon/db';

export interface MaintenanceWindowRow {
  id: string;
  teamId: string;
  startsAt: Date;
  endsAt: Date;
  reason: string | null;
  createdAt: Date;
  monitorIds: string[]; // empty = applies to all monitors
}

export interface CreateMaintenanceWindowInput {
  startsAt: Date;
  endsAt: Date;
  reason?: string;
  monitorIds?: string[]; // undefined or empty = all monitors
}

export const maintenanceWindowRepository = {
  async findAll(teamId: string): Promise<MaintenanceWindowRow[]> {
    const windows = await prisma.maintenanceWindow.findMany({
      where: { teamId },
      include: { monitors: { select: { monitorId: true } } },
      orderBy: { startsAt: 'desc' },
    });

    return windows.map((w) => ({
      id: w.id,
      teamId: w.teamId,
      startsAt: w.startsAt,
      endsAt: w.endsAt,
      reason: w.reason,
      createdAt: w.createdAt,
      monitorIds: w.monitors.map((m) => m.monitorId),
    }));
  },

  async create(teamId: string, input: CreateMaintenanceWindowInput): Promise<MaintenanceWindowRow> {
    if (input.monitorIds && input.monitorIds.length > 0) {
      const validCount = await prisma.monitor.count({
        where: { id: { in: input.monitorIds }, teamId },
      });
      if (validCount !== input.monitorIds.length) {
        throw new Error('One or more monitors do not belong to this team');
      }
    }

    const window = await prisma.maintenanceWindow.create({
      data: {
        teamId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        reason: input.reason ?? null,
        monitors:
          input.monitorIds && input.monitorIds.length > 0
            ? {
                create: input.monitorIds.map((monitorId) => ({ monitorId })),
              }
            : undefined,
      },
      include: { monitors: { select: { monitorId: true } } },
    });

    return {
      id: window.id,
      teamId: window.teamId,
      startsAt: window.startsAt,
      endsAt: window.endsAt,
      reason: window.reason,
      createdAt: window.createdAt,
      monitorIds: window.monitors.map((m) => m.monitorId),
    };
  },

  async delete(teamId: string, windowId: string): Promise<boolean> {
    const window = await prisma.maintenanceWindow.findFirst({
      where: { id: windowId, teamId },
    });
    if (!window) return false;

    await prisma.maintenanceWindow.delete({ where: { id: windowId } });
    return true;
  },
};

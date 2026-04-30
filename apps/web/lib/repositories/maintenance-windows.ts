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

export interface UpdateMaintenanceWindowInput {
  startsAt?: Date;
  endsAt?: Date;
  reason?: string | null;
  monitorIds?: string[]; // empty array = all monitors
}

export const maintenanceWindowRepository = {
  async findById(teamId: string, windowId: string): Promise<MaintenanceWindowRow | null> {
    const window = await prisma.maintenanceWindow.findFirst({
      where: { id: windowId, teamId },
      include: { monitors: { select: { monitorId: true } } },
    });
    if (!window) return null;
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
    const window = await prisma.$transaction(async (tx) => {
      if (input.monitorIds && input.monitorIds.length > 0) {
        const validCount = await tx.monitor.count({
          where: { id: { in: input.monitorIds }, teamId },
        });
        if (validCount !== input.monitorIds.length) {
          throw new Error('One or more monitors do not belong to this team');
        }
      }

      return tx.maintenanceWindow.create({
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

  async update(
    teamId: string,
    windowId: string,
    input: UpdateMaintenanceWindowInput
  ): Promise<MaintenanceWindowRow | null> {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.maintenanceWindow.findFirst({
        where: { id: windowId, teamId },
      });
      if (!existing) return null;

      const effectiveStartsAt = input.startsAt ?? existing.startsAt;
      const effectiveEndsAt = input.endsAt ?? existing.endsAt;
      if (effectiveEndsAt <= effectiveStartsAt) {
        throw new Error('endsAt must be after startsAt');
      }

      if (input.monitorIds && input.monitorIds.length > 0) {
        const validCount = await tx.monitor.count({
          where: { id: { in: input.monitorIds }, teamId },
        });
        if (validCount !== input.monitorIds.length) {
          throw new Error('One or more monitors do not belong to this team');
        }
      }

      const fields: Record<string, unknown> = {};
      if (input.startsAt !== undefined) fields.startsAt = input.startsAt;
      if (input.endsAt !== undefined) fields.endsAt = input.endsAt;
      if (input.reason !== undefined) fields.reason = input.reason;

      if (Object.keys(fields).length > 0) {
        await tx.maintenanceWindow.update({ where: { id: windowId }, data: fields });
      }

      if (input.monitorIds !== undefined) {
        await tx.maintenanceWindowMonitor.deleteMany({ where: { windowId } });
        if (input.monitorIds.length > 0) {
          await tx.maintenanceWindowMonitor.createMany({
            data: input.monitorIds.map((monitorId) => ({ windowId, monitorId })),
          });
        }
      }

      return tx.maintenanceWindow.findUnique({
        where: { id: windowId },
        include: { monitors: { select: { monitorId: true } } },
      });
    });

    if (!updated) return null;
    return {
      id: updated.id,
      teamId: updated.teamId,
      startsAt: updated.startsAt,
      endsAt: updated.endsAt,
      reason: updated.reason,
      createdAt: updated.createdAt,
      monitorIds: updated.monitors.map((m) => m.monitorId),
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

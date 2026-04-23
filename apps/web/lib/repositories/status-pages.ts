import { prisma } from '@beaconmon/db';
import type { CreateStatusPageInput } from '@/lib/validations/status-pages';

const detailSelect = {
  id: true,
  name: true,
  slug: true,
  customDomain: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
  monitors: {
    select: { monitorId: true, displayOrder: true },
    orderBy: { displayOrder: 'asc' as const },
  },
} as const;

export const statusPageRepository = {
  async findAll(teamId: string) {
    return prisma.statusPage.findMany({
      where: { teamId },
      select: {
        id: true,
        name: true,
        slug: true,
        customDomain: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(teamId: string, data: CreateStatusPageInput) {
    return prisma.statusPage.create({
      data: {
        teamId,
        name: data.name,
        slug: data.slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        customDomain: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async countByTeam(teamId: string): Promise<number> {
    return prisma.statusPage.count({ where: { teamId } });
  },

  async slugExists(slug: string): Promise<boolean> {
    const count = await prisma.statusPage.count({ where: { slug } });
    return count > 0;
  },

  async findById(teamId: string, id: string) {
    return prisma.statusPage.findFirst({
      where: { id, teamId },
      select: detailSelect,
    });
  },

  async update(
    teamId: string,
    id: string,
    data: { name?: string; customDomain?: string | null; isPublic?: boolean },
    monitorIds?: string[]
  ) {
    return prisma.$transaction(async (tx) => {
      if (monitorIds !== undefined && monitorIds.length > 0) {
        const validMonitors = await tx.monitor.findMany({
          where: { id: { in: monitorIds }, teamId },
          select: { id: true },
        });
        const validIds = new Set(validMonitors.map((m) => m.id));
        const invalidIds = monitorIds.filter((mid) => !validIds.has(mid));
        if (invalidIds.length > 0) {
          throw new Error('INVALID_MONITOR_IDS');
        }
      }

      await tx.statusPage.updateMany({
        where: { id, teamId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.customDomain !== undefined && { customDomain: data.customDomain }),
          ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        },
      });

      if (monitorIds !== undefined) {
        await tx.statusPageMonitor.deleteMany({ where: { statusPageId: id } });
        if (monitorIds.length > 0) {
          await tx.statusPageMonitor.createMany({
            data: monitorIds.map((monitorId, idx) => ({
              statusPageId: id,
              monitorId,
              displayOrder: idx,
            })),
          });
        }
      }

      return tx.statusPage.findFirst({
        where: { id, teamId },
        select: detailSelect,
      });
    });
  },
};

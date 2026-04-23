import { prisma } from '@beaconmon/db';
import type { CreateStatusPageInput } from '@/lib/validations/status-pages';

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
};

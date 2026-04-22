import { prisma } from '@beaconmon/db';
import type { Prisma } from '@beaconmon/db';
import type { CreateAlertChannelInput } from '@/lib/validations/alert-channels';

export interface AlertChannelRow {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const alertChannelRepository: {
  findAll(teamId: string): Promise<AlertChannelRow[]>;
  create(teamId: string, data: CreateAlertChannelInput): Promise<AlertChannelRow>;
  countByTeam(teamId: string): Promise<number>;
} = {
  async findAll(teamId) {
    const rows = await prisma.alertChannel.findMany({
      where: { teamId, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        config: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows as AlertChannelRow[];
  },

  async create(teamId, data) {
    const row = await prisma.alertChannel.create({
      data: {
        teamId,
        name: data.name,
        type: data.type,
        config: data.config as unknown as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        name: true,
        type: true,
        config: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row as AlertChannelRow;
  },

  async countByTeam(teamId) {
    return prisma.alertChannel.count({
      where: { teamId, isActive: true },
    });
  },
};

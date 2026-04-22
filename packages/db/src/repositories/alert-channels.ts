import { prisma } from '../index.js';

export interface AlertChannel {
  id: string;
  teamId: string;
  name: string;
  type: string;
  config: unknown;
  isActive: boolean;
}

export const alertChannelRepository = {
  async findActiveByTeamId(teamId: string): Promise<AlertChannel[]> {
    return prisma.alertChannel.findMany({
      where: { teamId, isActive: true },
      select: {
        id: true,
        teamId: true,
        name: true,
        type: true,
        config: true,
        isActive: true,
      },
    });
  },
};

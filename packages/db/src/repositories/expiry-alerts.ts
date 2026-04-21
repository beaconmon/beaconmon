import { prisma } from '../index.js';

export interface CreateExpiryAlertData {
  teamId: string;
  monitorId: string;
  type: 'ssl' | 'domain';
  daysRemaining: number;
  threshold: number;
}

export const expiryAlertRepository = {
  async findByMonitorAndThreshold(
    monitorId: string,
    threshold: number
  ): Promise<{ id: string } | null> {
    // Scope to last 30 days so renewed certs/domains can trigger new alerts
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return prisma.expiryAlert.findFirst({
      where: {
        monitorId,
        threshold,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { id: true },
    });
  },

  async create(data: CreateExpiryAlertData): Promise<void> {
    await prisma.expiryAlert.create({
      data: {
        teamId: data.teamId,
        monitorId: data.monitorId,
        type: data.type,
        daysRemaining: data.daysRemaining,
        threshold: data.threshold,
      },
    });
  },
};

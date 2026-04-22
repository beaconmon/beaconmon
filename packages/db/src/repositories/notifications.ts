import { prisma } from '../index.js';

export interface CreateNotificationData {
  teamId: string;
  incidentId: string;
  channelId: string;
}

export const notificationRepository = {
  async existsRecent(
    incidentId: string,
    channelId: string,
    windowMinutes: number
  ): Promise<boolean> {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);

    const notification = await prisma.notification.findFirst({
      where: {
        incidentId,
        channelId,
        sentAt: { gte: cutoff },
      },
      select: { id: true },
    });

    return notification !== null;
  },

  async create(data: CreateNotificationData): Promise<void> {
    await prisma.notification.create({
      data: {
        teamId: data.teamId,
        incidentId: data.incidentId,
        channelId: data.channelId,
        sentAt: new Date(),
      },
    });
  },
};

import { prisma } from '@beaconmon/db';

export const heartbeatRepository = {
  async findActiveMonitorByToken(token: string) {
    return prisma.monitor.findFirst({
      where: {
        type: 'heartbeat',
        isActive: true,
        config: { path: ['token'], equals: token },
      },
      select: { id: true },
    });
  },

  async recordHeartbeat(monitorId: string) {
    return prisma.monitor.update({
      where: { id: monitorId },
      data: { lastHeartbeatAt: new Date() },
    });
  },
};

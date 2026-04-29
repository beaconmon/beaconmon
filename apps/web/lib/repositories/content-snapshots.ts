import { prisma } from '@beaconmon/db';

export interface SnapshotSummary {
  id: string;
  capturedAt: Date;
  bytes: number;
}

export interface SnapshotFull {
  id: string;
  monitorId: string;
  content: string;
  capturedAt: Date;
}

export const contentSnapshotRepository = {
  /**
   * Verify the monitor belongs to this team and is a content monitor.
   * Returns true if the caller is allowed to view snapshots for it.
   */
  async assertContentMonitor(teamId: string, monitorId: string): Promise<boolean> {
    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId, teamId, deletedAt: null, type: 'content' },
      select: { id: true },
    });
    return !!monitor;
  },

  async list(teamId: string, monitorId: string, limit: number): Promise<SnapshotSummary[]> {
    const rows = await prisma.contentSnapshot.findMany({
      where: { monitorId, teamId },
      select: { id: true, capturedAt: true, content: true },
      orderBy: { capturedAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      capturedAt: r.capturedAt,
      bytes: Buffer.byteLength(r.content, 'utf8'),
    }));
  },

  async getById(teamId: string, monitorId: string, id: string): Promise<SnapshotFull | null> {
    const row = await prisma.contentSnapshot.findFirst({
      where: { id, monitorId, teamId },
      select: { id: true, monitorId: true, content: true, capturedAt: true },
    });
    return row;
  },
};

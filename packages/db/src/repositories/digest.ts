import { prisma } from '../index.js';

export interface DigestTeam {
  id: string;
  plan: string;
  trialEndsAt: Date | null;
  digestPrefs: unknown;
  subscription: { status: string } | null;
}

export interface DigestIncident {
  id: string;
  monitorName: string;
  monitorUrl: string;
  startedAt: Date;
  resolvedAt: Date | null;
}

export interface DigestExpiryAlert {
  id: string;
  type: string;
  daysRemaining: number;
  threshold: number;
  sentAt: Date;
  monitorName: string;
  monitorUrl: string;
}

export interface DigestSmartAlert {
  id: string;
  monitorName: string;
  monitorUrl: string;
  checkedAt: Date;
  responseTimeMs: number;
  zScore: number;
}

export interface DigestOwnContentSnapshot {
  snapshotId: string;
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  capturedAt: Date;
  diffSummary: string | null;
  classification: string | null;
}

export const digestRepository = {
  async getTeamForDigest(teamId: string): Promise<DigestTeam | null> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        plan: true,
        trialEndsAt: true,
        digestPrefs: true,
        subscription: { select: { status: true } },
      },
    });
    return team;
  },

  async findOwnContentSnapshots(
    teamId: string,
    windowStart: Date,
    windowEnd: Date
  ): Promise<DigestOwnContentSnapshot[]> {
    const rows = await prisma.contentSnapshot.findMany({
      where: {
        teamId,
        capturedAt: { gte: windowStart, lte: windowEnd },
        monitor: { isCompetitor: false, isActive: true, deletedAt: null },
        NOT: { classification: 'noise' },
      },
      select: {
        id: true,
        monitorId: true,
        capturedAt: true,
        diffSummary: true,
        classification: true,
        monitor: { select: { name: true, url: true } },
      },
      orderBy: { capturedAt: 'asc' },
    });

    return rows.map((r) => ({
      snapshotId: r.id,
      monitorId: r.monitorId,
      monitorName: r.monitor.name,
      monitorUrl: r.monitor.url,
      capturedAt: r.capturedAt,
      diffSummary: r.diffSummary,
      classification: r.classification,
    }));
  },

  async findIncidentsInWindow(
    teamId: string,
    windowStart: Date,
    windowEnd: Date
  ): Promise<DigestIncident[]> {
    const rows = await prisma.incident.findMany({
      where: {
        teamId,
        OR: [
          { startedAt: { gte: windowStart, lte: windowEnd } },
          { resolvedAt: { gte: windowStart, lte: windowEnd } },
        ],
      },
      select: {
        id: true,
        startedAt: true,
        resolvedAt: true,
        monitor: { select: { name: true, url: true } },
      },
      orderBy: { startedAt: 'desc' },
    });

    return rows.map((r) => ({
      id: r.id,
      monitorName: r.monitor.name,
      monitorUrl: r.monitor.url,
      startedAt: r.startedAt,
      resolvedAt: r.resolvedAt,
    }));
  },

  async findExpiryAlertsInWindow(
    teamId: string,
    windowStart: Date,
    windowEnd: Date
  ): Promise<DigestExpiryAlert[]> {
    const rows = await prisma.expiryAlert.findMany({
      where: {
        teamId,
        sentAt: { gte: windowStart, lte: windowEnd },
      },
      select: {
        id: true,
        type: true,
        daysRemaining: true,
        threshold: true,
        sentAt: true,
        monitor: { select: { name: true, url: true } },
      },
      orderBy: { sentAt: 'desc' },
    });

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      daysRemaining: r.daysRemaining,
      threshold: r.threshold,
      sentAt: r.sentAt,
      monitorName: r.monitor.name,
      monitorUrl: r.monitor.url,
    }));
  },

  async findSmartAlertsInWindow(
    teamId: string,
    windowStart: Date,
    windowEnd: Date
  ): Promise<DigestSmartAlert[]> {
    const rows = await prisma.performanceAlert.findMany({
      where: {
        teamId,
        checkedAt: { gte: windowStart, lte: windowEnd },
        notifiedAt: { not: null },
      },
      select: {
        id: true,
        checkedAt: true,
        responseTimeMs: true,
        zScore: true,
        monitor: { select: { name: true, url: true } },
      },
      orderBy: { checkedAt: 'desc' },
    });

    return rows.map((r) => ({
      id: r.id,
      monitorName: r.monitor.name,
      monitorUrl: r.monitor.url,
      checkedAt: r.checkedAt,
      responseTimeMs: r.responseTimeMs,
      zScore: r.zScore,
    }));
  },
};

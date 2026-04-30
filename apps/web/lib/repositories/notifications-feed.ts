import { prisma } from '@beaconmon/db';

export type FeedItemKind =
  | 'incident.opened'
  | 'incident.resolved'
  | 'expiry.warning'
  | 'deploy.started'
  | 'snapshot.changed';

export interface FeedItem {
  id: string;
  kind: FeedItemKind;
  title: string;
  subtitle: string;
  href: string | null;
  occurredAt: string;
  monitorName: string | null;
}

export interface NotificationsFeed {
  items: FeedItem[];
  lastSeenAt: string | null;
  unreadCount: number;
}

const DEFAULT_WINDOW_DAYS = 30;
const ITEM_LIMIT = 50;

/**
 * Aggregates the last 30 days of team-scoped events from existing tables —
 * no new feed table. Per-user read-state lives in NotificationReadState.
 */
export const notificationsFeedRepository = {
  async getFeed(teamId: string, userId: string): Promise<NotificationsFeed> {
    const since = new Date(Date.now() - DEFAULT_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const [incidents, expiryAlerts, deployEvents, snapshots, readState] = await Promise.all([
      prisma.incident.findMany({
        where: { teamId, startedAt: { gte: since } },
        select: {
          id: true,
          startedAt: true,
          resolvedAt: true,
          monitor: { select: { id: true, name: true } },
        },
        orderBy: { startedAt: 'desc' },
        take: ITEM_LIMIT,
      }),
      prisma.expiryAlert.findMany({
        where: { teamId, sentAt: { gte: since } },
        select: {
          id: true,
          sentAt: true,
          type: true,
          daysRemaining: true,
          threshold: true,
          monitor: { select: { id: true, name: true } },
        },
        orderBy: { sentAt: 'desc' },
        take: ITEM_LIMIT,
      }),
      prisma.deployEvent.findMany({
        where: { teamId, startedAt: { gte: since } },
        select: {
          id: true,
          startedAt: true,
          description: true,
          commitSha: true,
          monitor: { select: { id: true, name: true } },
        },
        orderBy: { startedAt: 'desc' },
        take: ITEM_LIMIT,
      }),
      prisma.contentSnapshot.findMany({
        where: { teamId, capturedAt: { gte: since } },
        select: {
          id: true,
          capturedAt: true,
          monitor: { select: { id: true, name: true } },
        },
        orderBy: { capturedAt: 'desc' },
        take: ITEM_LIMIT,
      }),
      prisma.notificationReadState.findUnique({
        where: { teamId_userId: { teamId, userId } },
        select: { lastSeenAt: true },
      }),
    ]);

    const items: FeedItem[] = [];

    for (const inc of incidents) {
      const monitorName = inc.monitor?.name ?? 'Monitor';
      items.push({
        id: `incident-open:${inc.id}`,
        kind: 'incident.opened',
        title: `Incident opened — ${monitorName}`,
        subtitle: 'Monitor is down',
        href: `/incidents`,
        occurredAt: inc.startedAt.toISOString(),
        monitorName,
      });
      if (inc.resolvedAt) {
        items.push({
          id: `incident-resolved:${inc.id}`,
          kind: 'incident.resolved',
          title: `Incident resolved — ${monitorName}`,
          subtitle: 'Monitor recovered',
          href: `/incidents`,
          occurredAt: inc.resolvedAt.toISOString(),
          monitorName,
        });
      }
    }

    for (const ea of expiryAlerts) {
      const monitorName = ea.monitor?.name ?? 'Monitor';
      const label = ea.type === 'ssl' ? 'SSL certificate' : 'Domain';
      items.push({
        id: `expiry:${ea.id}`,
        kind: 'expiry.warning',
        title: `${label} expiring — ${monitorName}`,
        subtitle: `${ea.daysRemaining} days remaining (threshold: ${ea.threshold}d)`,
        href: ea.monitor ? `/monitors/${ea.monitor.id}` : null,
        occurredAt: ea.sentAt.toISOString(),
        monitorName,
      });
    }

    for (const de of deployEvents) {
      const monitorName = de.monitor?.name ?? 'Monitor';
      items.push({
        id: `deploy:${de.id}`,
        kind: 'deploy.started',
        title: `Deploy event — ${monitorName}`,
        subtitle:
          de.description ??
          (de.commitSha ? `Commit ${de.commitSha.slice(0, 7)}` : 'Deploy started'),
        href: de.monitor ? `/monitors/${de.monitor.id}` : null,
        occurredAt: de.startedAt.toISOString(),
        monitorName,
      });
    }

    for (const cs of snapshots) {
      const monitorName = cs.monitor?.name ?? 'Monitor';
      items.push({
        id: `snapshot:${cs.id}`,
        kind: 'snapshot.changed',
        title: `Content changed — ${monitorName}`,
        subtitle: 'New snapshot captured',
        href: cs.monitor ? `/monitors/${cs.monitor.id}` : null,
        occurredAt: cs.capturedAt.toISOString(),
        monitorName,
      });
    }

    items.sort((a, b) => {
      if (a.occurredAt < b.occurredAt) return 1;
      if (a.occurredAt > b.occurredAt) return -1;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
    const trimmed = items.slice(0, ITEM_LIMIT);

    const lastSeenAt = readState?.lastSeenAt ?? null;
    const unreadCount = lastSeenAt
      ? trimmed.filter((it) => it.occurredAt > lastSeenAt.toISOString()).length
      : trimmed.length;

    return {
      items: trimmed,
      lastSeenAt: lastSeenAt ? lastSeenAt.toISOString() : null,
      unreadCount,
    };
  },

  async markAllRead(teamId: string, userId: string): Promise<void> {
    const now = new Date();
    await prisma.notificationReadState.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: { teamId, userId, lastSeenAt: now },
      update: { lastSeenAt: now },
    });
  },
};

import { prisma } from '../index.js';

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const RECENT_INCIDENTS_LIMIT = 5;

/**
 * Returns all distinct monitor IDs referenced by any status page.
 * Used by the scheduler for uptime pre-computation.
 */
async function findAllMonitorIdsOnStatusPages(): Promise<string[]> {
  const rows = await prisma.statusPageMonitor.findMany({
    select: { monitorId: true },
    distinct: ['monitorId'],
  });
  return rows.map((r) => r.monitorId);
}

/**
 * Returns the slugs of all public status pages that include this monitor.
 * Used by the check worker to know which pages to warm after a status transition.
 */
async function findStatusPageSlugsForMonitor(monitorId: string): Promise<string[]> {
  const rows = await prisma.statusPageMonitor.findMany({
    where: {
      monitorId,
      statusPage: { isPublic: true },
    },
    select: {
      statusPage: { select: { slug: true } },
    },
  });
  return rows.map((r) => r.statusPage.slug);
}

/**
 * Full data query for cache warming — returns status page + ordered monitors
 * with current status and last 5 incidents within 90 days.
 * Only returns public pages. Does NOT include uptime % (comes from Redis).
 */
async function findStatusPageDataBySlug(slug: string) {
  const cutoff = new Date(Date.now() - NINETY_DAYS_MS);

  return prisma.statusPage.findFirst({
    where: { slug, isPublic: true },
    select: {
      slug: true,
      name: true,
      team: { select: { plan: true } },
      monitors: {
        orderBy: { displayOrder: 'asc' },
        select: {
          monitorId: true,
          displayOrder: true,
          monitor: {
            select: {
              id: true,
              name: true,
              type: true,
              currentStatus: true,
              incidents: {
                where: { startedAt: { gte: cutoff } },
                orderBy: { startedAt: 'desc' },
                take: RECENT_INCIDENTS_LIMIT,
                select: {
                  id: true,
                  startedAt: true,
                  resolvedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export const statusPageWorkerRepository = {
  findAllMonitorIdsOnStatusPages,
  findStatusPageSlugsForMonitor,
  findStatusPageDataBySlug,
};

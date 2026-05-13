import { prisma } from '@beaconmon/db';
import type { CreateStatusPageInput } from '@/lib/validations/status-pages';
import type { StatusPageDbData } from '@beaconmon/types';

export interface StatusPageRow {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusPageDetail extends StatusPageRow {
  customDomainVerified: boolean;
  detectedDnsProvider: string | null;
  cloudflareHostnameId: string | null;
  monitors: { monitorId: string; displayOrder: number }[];
}

interface BatchResult {
  count: number;
}

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const RECENT_INCIDENTS_LIMIT = 5;

const detailSelect = {
  id: true,
  name: true,
  slug: true,
  customDomain: true,
  customDomainVerified: true,
  detectedDnsProvider: true,
  cloudflareHostnameId: true,
  isPublic: true,
  createdAt: true,
  updatedAt: true,
  monitors: {
    select: { monitorId: true, displayOrder: true },
    orderBy: { displayOrder: 'asc' as const },
  },
} as const;

/**
 * Public query — no teamId scoping by design.
 * Status pages are intentionally public; isPublic:true is the access gate.
 * Only called from the cache layer for status page rendering.
 */
export async function findBySlugPublic(slug: string): Promise<StatusPageDbData | null> {
  const cutoff = new Date(Date.now() - NINETY_DAYS_MS);

  const result = await prisma.statusPage.findFirst({
    where: { slug, isPublic: true },
    select: {
      slug: true,
      name: true,
      customDomain: true,
      customDomainVerified: true,
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

  if (!result) return null;

  // Only expose customDomain to public callers when verification is confirmed
  const { customDomainVerified, ...rest } = result as typeof result & { customDomainVerified: boolean };
  return {
    ...rest,
    customDomain: customDomainVerified ? rest.customDomain : null,
  } as StatusPageDbData;
}

export const statusPageRepository: {
  findAll(teamId: string): Promise<StatusPageRow[]>;
  create(teamId: string, data: CreateStatusPageInput): Promise<StatusPageRow>;
  countByTeam(teamId: string): Promise<number>;
  slugExists(slug: string): Promise<boolean>;
  findById(teamId: string, id: string): Promise<StatusPageDetail | null>;
  verifyCustomDomain(teamId: string, id: string, verified: boolean, cloudflareHostnameId?: string | null): Promise<BatchResult>;
  update(
    teamId: string,
    id: string,
    data: { name?: string; customDomain?: string | null; customDomainVerified?: boolean; detectedDnsProvider?: string | null; cloudflareHostnameId?: string | null; isPublic?: boolean },
    monitorIds?: string[]
  ): Promise<StatusPageDetail | null>;
} = {
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

  async findById(teamId: string, id: string) {
    return prisma.statusPage.findFirst({
      where: { id, teamId },
      select: detailSelect,
    });
  },

  async verifyCustomDomain(teamId: string, id: string, verified: boolean, cloudflareHostnameId?: string | null) {
    return prisma.statusPage.updateMany({
      where: { id, teamId },
      data: {
        customDomainVerified: verified,
        ...(cloudflareHostnameId !== undefined && { cloudflareHostnameId }),
      },
    });
  },

  async update(
    teamId: string,
    id: string,
    data: { name?: string; customDomain?: string | null; customDomainVerified?: boolean; detectedDnsProvider?: string | null; cloudflareHostnameId?: string | null; isPublic?: boolean },
    monitorIds?: string[]
  ) {
    return prisma.$transaction(async (tx) => {
      if (monitorIds !== undefined && monitorIds.length > 0) {
        const validMonitors = await tx.monitor.findMany({
          where: { id: { in: monitorIds }, teamId },
          select: { id: true },
        });
        const validIds = new Set(validMonitors.map((m) => m.id));
        const invalidIds = monitorIds.filter((mid) => !validIds.has(mid));
        if (invalidIds.length > 0) {
          throw new Error('INVALID_MONITOR_IDS');
        }
      }

      await tx.statusPage.updateMany({
        where: { id, teamId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.customDomain !== undefined && { customDomain: data.customDomain }),
          ...(data.customDomainVerified !== undefined && { customDomainVerified: data.customDomainVerified }),
          ...(data.detectedDnsProvider !== undefined && { detectedDnsProvider: data.detectedDnsProvider }),
          ...(data.cloudflareHostnameId !== undefined && { cloudflareHostnameId: data.cloudflareHostnameId }),
          ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        },
      });

      if (monitorIds !== undefined) {
        await tx.statusPageMonitor.deleteMany({ where: { statusPageId: id } });
        if (monitorIds.length > 0) {
          await tx.statusPageMonitor.createMany({
            data: monitorIds.map((monitorId, idx) => ({
              statusPageId: id,
              monitorId,
              displayOrder: idx,
            })),
          });
        }
      }

      return tx.statusPage.findFirst({
        where: { id, teamId },
        select: detailSelect,
      });
    });
  },
};

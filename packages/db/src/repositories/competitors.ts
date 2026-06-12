import { prisma } from '../index.js';

export interface DiscoveryStatePatch {
  discoveryState: 'pending' | 'syncing' | 'ready' | 'failed' | 'not_applicable';
  discoverySyncedAt?: Date | null;
  discoveryError?: string | null;
}

export async function updateCompetitorDiscoveryState(
  competitorId: string,
  patch: DiscoveryStatePatch
): Promise<void> {
  await prisma.competitor.update({
    where: { id: competitorId },
    data: patch,
  });
}

export async function countCompetitorProducts(competitorId: string): Promise<number> {
  return prisma.competitorProduct.count({ where: { competitorId } });
}

export type CompetitorDataTier = 'full_catalog' | 'selected_products' | 'limited';

export interface CompetitorSyncInfo {
  id: string;
  teamId: string;
  domain: string;
  platform: string;
  dataTier: CompetitorDataTier;
  sitemapUrl: string | null;
  trackedProductUrls: string[];
  discoverySyncedAt: Date | null;
}

export async function getCompetitorSyncInfo(competitorId: string): Promise<CompetitorSyncInfo | null> {
  const row = await prisma.competitor.findUnique({
    where: { id: competitorId },
    select: {
      id: true,
      teamId: true,
      domain: true,
      platform: true,
      dataTier: true,
      sitemapUrl: true,
      trackedProductUrls: true,
      discoverySyncedAt: true,
    },
  });
  if (!row) return null;
  const urls = Array.isArray(row.trackedProductUrls)
    ? (row.trackedProductUrls as unknown[]).filter((u): u is string => typeof u === 'string')
    : [];
  return { ...row, dataTier: row.dataTier as CompetitorDataTier, trackedProductUrls: urls };
}

export async function updateCompetitorTier(
  competitorId: string,
  patch: { dataTier?: CompetitorDataTier; sitemapUrl?: string | null; trackedProductUrls?: string[] }
): Promise<void> {
  await prisma.competitor.update({
    where: { id: competitorId },
    data: patch,
  });
}

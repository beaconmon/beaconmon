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

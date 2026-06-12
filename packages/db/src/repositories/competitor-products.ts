import { Prisma, prisma } from '../index.js';

export type ProductSource = 'shopify_feed' | 'jsonld' | 'html';

export interface CompetitorProductRow {
  id: string;
  externalId: string;
  source: string;
  sourceUrl: string | null;
  title: string;
  handle: string;
  isAvailable: boolean;
  variants: unknown;
  currentPrice: Prisma.Decimal | null;
  compareAtPrice: Prisma.Decimal | null;
  currency: string;
  lastSeenAt: Date;
}

export interface UpsertProductData {
  competitorId: string;
  teamId: string;
  externalId: string;
  source: ProductSource;
  sourceUrl?: string | null;
  title: string;
  handle: string;
  vendor?: string;
  productType?: string;
  sku?: string;
  isAvailable: boolean;
  variants: unknown;
  currentPrice: string;
  compareAtPrice?: string | null;
  currency: string;
  lastSeenAt: Date;
}

export const competitorProductRepository = {
  async findByCompetitorId(competitorId: string, source?: ProductSource): Promise<CompetitorProductRow[]> {
    return prisma.competitorProduct.findMany({
      where: { competitorId, ...(source ? { source } : {}) },
      select: {
        id: true,
        externalId: true,
        source: true,
        sourceUrl: true,
        title: true,
        handle: true,
        isAvailable: true,
        variants: true,
        currentPrice: true,
        compareAtPrice: true,
        currency: true,
        lastSeenAt: true,
      },
    });
  },

  async upsertProduct(data: UpsertProductData): Promise<string> {
    const row = await prisma.competitorProduct.upsert({
      where: {
        competitorId_source_externalId: {
          competitorId: data.competitorId,
          source: data.source,
          externalId: data.externalId,
        },
      },
      create: {
        competitorId: data.competitorId,
        teamId: data.teamId,
        externalId: data.externalId,
        source: data.source,
        sourceUrl: data.sourceUrl ?? null,
        title: data.title,
        handle: data.handle,
        vendor: data.vendor,
        productType: data.productType,
        sku: data.sku,
        isAvailable: data.isAvailable,
        variants: data.variants as Prisma.InputJsonValue,
        currentPrice: data.currentPrice,
        compareAtPrice: data.compareAtPrice ?? null,
        currency: data.currency,
        lastSeenAt: data.lastSeenAt,
      },
      update: {
        sourceUrl: data.sourceUrl ?? null,
        title: data.title,
        handle: data.handle,
        vendor: data.vendor,
        productType: data.productType,
        sku: data.sku,
        isAvailable: data.isAvailable,
        variants: data.variants as Prisma.InputJsonValue,
        currentPrice: data.currentPrice,
        compareAtPrice: data.compareAtPrice ?? null,
        currency: data.currency,
        lastSeenAt: data.lastSeenAt,
      },
      select: { id: true },
    });
    return row.id;
  },

  async markUnavailable(competitorId: string, source: ProductSource, externalId: string): Promise<void> {
    await prisma.competitorProduct.update({
      where: {
        competitorId_source_externalId: { competitorId, source, externalId },
      },
      data: { isAvailable: false },
    });
  },
};

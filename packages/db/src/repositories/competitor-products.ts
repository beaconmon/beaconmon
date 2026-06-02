import { Prisma, prisma } from '../index.js';

export interface CompetitorProductRow {
  id: string;
  shopifyProductId: string;
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
  shopifyProductId: string;
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
  async findByCompetitorId(competitorId: string): Promise<CompetitorProductRow[]> {
    return prisma.competitorProduct.findMany({
      where: { competitorId },
      select: {
        id: true,
        shopifyProductId: true,
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
        competitorId_shopifyProductId: {
          competitorId: data.competitorId,
          shopifyProductId: data.shopifyProductId,
        },
      },
      create: {
        competitorId: data.competitorId,
        teamId: data.teamId,
        shopifyProductId: data.shopifyProductId,
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

  async markUnavailable(competitorId: string, shopifyProductId: string): Promise<void> {
    await prisma.competitorProduct.update({
      where: {
        competitorId_shopifyProductId: { competitorId, shopifyProductId },
      },
      data: { isAvailable: false },
    });
  },
};

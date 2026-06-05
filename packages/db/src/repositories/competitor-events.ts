import { Prisma, prisma } from '../index.js';

export interface CreateEventData {
  teamId: string;
  competitorId: string;
  productId?: string;
  pageId?: string;
  type: 'product_added' | 'product_removed' | 'price_changed' | 'stock_changed' | 'site_changed' | 'promo_detected' | 'sale_started' | 'sale_ended';
  payload: Record<string, unknown>;
  detectedAt: Date;
}

export const competitorEventRepository = {
  async createEvent(data: CreateEventData): Promise<{ id: string }> {
    return prisma.competitorEvent.create({
      data: {
        teamId: data.teamId,
        competitorId: data.competitorId,
        productId: data.productId ?? null,
        pageId: data.pageId ?? null,
        type: data.type,
        payload: data.payload as Prisma.InputJsonValue,
        detectedAt: data.detectedAt,
      },
      select: { id: true },
    });
  },
};

import { describe, it, expect, vi } from 'vitest';

vi.mock('@beaconmon/db', () => ({ prisma: {}, digestRepository: {} }));
vi.mock('./lib/env.js', () => ({ env: { APP_URL: 'https://beaconmon.com', RESEND_API_KEY: undefined, ALERT_DRY_RUN: true } }));
vi.mock('./lib/logger.js', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { priorityWeightForCompetitorEvent } from './process-intelligence-digest-job.js';

describe('priorityWeightForCompetitorEvent', () => {
  it('returns 0 for out_of_stock', () => {
    expect(priorityWeightForCompetitorEvent('out_of_stock')).toBe(0);
  });

  it('returns 0 for back_in_stock', () => {
    expect(priorityWeightForCompetitorEvent('back_in_stock')).toBe(0);
  });

  it('returns 0 for sale_started', () => {
    expect(priorityWeightForCompetitorEvent('sale_started')).toBe(0);
  });

  it('returns 1 for price_changed', () => {
    expect(priorityWeightForCompetitorEvent('price_changed')).toBe(1);
  });

  it('returns 1 for product_added', () => {
    expect(priorityWeightForCompetitorEvent('product_added')).toBe(1);
  });

  it('returns 1 for stock_changed', () => {
    expect(priorityWeightForCompetitorEvent('stock_changed')).toBe(1);
  });

  it('sorts out_of_stock before price_changed', () => {
    const events = [
      { classification: 'price_changed', capturedAt: new Date(2000) },
      { classification: 'out_of_stock', capturedAt: new Date(1000) },
    ];
    const sorted = [...events].sort((a, b) => {
      const ap = priorityWeightForCompetitorEvent(a.classification);
      const bp = priorityWeightForCompetitorEvent(b.classification);
      if (ap !== bp) return ap - bp;
      return b.capturedAt.getTime() - a.capturedAt.getTime();
    });
    expect(sorted[0]!.classification).toBe('out_of_stock');
    expect(sorted[1]!.classification).toBe('price_changed');
  });

  it('preserves detectedAt desc ordering within the same priority tier', () => {
    const events = [
      { classification: 'price_changed', capturedAt: new Date(1000) },
      { classification: 'price_changed', capturedAt: new Date(3000) },
      { classification: 'price_changed', capturedAt: new Date(2000) },
    ];
    const sorted = [...events].sort((a, b) => {
      const ap = priorityWeightForCompetitorEvent(a.classification);
      const bp = priorityWeightForCompetitorEvent(b.classification);
      if (ap !== bp) return ap - bp;
      return b.capturedAt.getTime() - a.capturedAt.getTime();
    });
    expect(sorted[0]!.capturedAt.getTime()).toBe(3000);
    expect(sorted[1]!.capturedAt.getTime()).toBe(2000);
    expect(sorted[2]!.capturedAt.getTime()).toBe(1000);
  });
});

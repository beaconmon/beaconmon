import { describe, it, expect, vi } from 'vitest';

vi.mock('@beaconmon/db', () => ({ prisma: {}, digestRepository: {} }));
vi.mock('./lib/env.js', () => ({ env: { APP_URL: 'https://beaconmon.com', RESEND_API_KEY: undefined, ALERT_DRY_RUN: true } }));
vi.mock('./lib/logger.js', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { significanceWeight, hasAnySignal } from './process-intelligence-digest-job.js';

describe('hasAnySignal', () => {
  it('returns false when all buckets are empty or absent', () => {
    expect(hasAnySignal({})).toBe(false);
    expect(hasAnySignal({ incidents: [], competitors: [], smartAlerts: [], expiry: [], ownContent: [] })).toBe(false);
  });

  it('returns true when incidents has items', () => {
    expect(hasAnySignal({ incidents: [{}] })).toBe(true);
  });

  it('returns true when competitors has items', () => {
    expect(hasAnySignal({ competitors: [{}] })).toBe(true);
  });

  it('returns true when ownContent has items', () => {
    expect(hasAnySignal({ ownContent: [{}] })).toBe(true);
  });

  it('returns true when smartAlerts has items', () => {
    expect(hasAnySignal({ smartAlerts: [{}] })).toBe(true);
  });

  it('returns true when expiry has items', () => {
    expect(hasAnySignal({ expiry: [{}] })).toBe(true);
  });

  it('returns true when only one non-empty bucket among many empty ones', () => {
    expect(hasAnySignal({ incidents: [], competitors: [{}], smartAlerts: [] })).toBe(true);
  });
});

describe('significanceWeight', () => {
  it('high → 0', () => {
    expect(significanceWeight('high')).toBe(0);
  });

  it('medium → 1', () => {
    expect(significanceWeight('medium')).toBe(1);
  });

  it('null → 1 (treated as medium)', () => {
    expect(significanceWeight(null)).toBe(1);
  });

  it('low → 2', () => {
    expect(significanceWeight('low')).toBe(2);
  });

  it('sorts high before medium', () => {
    const events = [
      { significance: 'medium' as string | null, detectedAt: new Date(2000) },
      { significance: 'high' as string | null, detectedAt: new Date(1000) },
    ];
    const sorted = [...events].sort((a, b) => {
      const aw = significanceWeight(a.significance);
      const bw = significanceWeight(b.significance);
      if (aw !== bw) return aw - bw;
      return b.detectedAt.getTime() - a.detectedAt.getTime();
    });
    expect(sorted[0]!.significance).toBe('high');
    expect(sorted[1]!.significance).toBe('medium');
  });

  it('treats null significance as medium in sort', () => {
    const events = [
      { significance: null as string | null, detectedAt: new Date(2000) },
      { significance: 'high' as string | null, detectedAt: new Date(1000) },
    ];
    const sorted = [...events].sort((a, b) => {
      const aw = significanceWeight(a.significance);
      const bw = significanceWeight(b.significance);
      if (aw !== bw) return aw - bw;
      return b.detectedAt.getTime() - a.detectedAt.getTime();
    });
    expect(sorted[0]!.significance).toBe('high');
    expect(sorted[1]!.significance).toBeNull();
  });

  it('preserves detectedAt desc ordering within same tier', () => {
    const events = [
      { significance: 'medium' as string | null, detectedAt: new Date(1000) },
      { significance: 'medium' as string | null, detectedAt: new Date(3000) },
      { significance: 'medium' as string | null, detectedAt: new Date(2000) },
    ];
    const sorted = [...events].sort((a, b) => {
      const aw = significanceWeight(a.significance);
      const bw = significanceWeight(b.significance);
      if (aw !== bw) return aw - bw;
      return b.detectedAt.getTime() - a.detectedAt.getTime();
    });
    expect(sorted[0]!.detectedAt.getTime()).toBe(3000);
    expect(sorted[1]!.detectedAt.getTime()).toBe(2000);
    expect(sorted[2]!.detectedAt.getTime()).toBe(1000);
  });
});

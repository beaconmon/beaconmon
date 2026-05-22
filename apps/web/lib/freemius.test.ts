import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock env validation so tests don't require real env vars.
vi.mock('zod', async (importOriginal) => {
  const actual = await importOriginal<typeof import('zod')>();
  return actual;
});

// Override process.env before module load.
const mockEnv = {
  FREEMIUS_API_KEY: 'test-api-key',
  FREEMIUS_WEBHOOK_SECRET: 'test-webhook-secret',
  FREEMIUS_PRODUCT_ID: '999',
  FREEMIUS_STARTER_PLAN_ID: '100',
  FREEMIUS_GROWTH_PLAN_ID: '200',
  FREEMIUS_SCALE_PLAN_ID: '300',
};

beforeEach(() => {
  Object.assign(process.env, mockEnv);
  vi.resetModules();
});

describe('planFromFreemiusPlanId', () => {
  it('returns free for null', async () => {
    const { planFromFreemiusPlanId } = await import('./freemius');
    expect(planFromFreemiusPlanId(null)).toBe('free');
  });

  it('returns free for undefined', async () => {
    const { planFromFreemiusPlanId } = await import('./freemius');
    expect(planFromFreemiusPlanId(undefined)).toBe('free');
  });

  it('returns free for unknown plan id', async () => {
    const { planFromFreemiusPlanId } = await import('./freemius');
    expect(planFromFreemiusPlanId('999999')).toBe('free');
  });

  it('maps starter plan id to starter', async () => {
    const { planFromFreemiusPlanId } = await import('./freemius');
    expect(planFromFreemiusPlanId('100')).toBe('starter');
  });

  it('maps growth plan id to growth', async () => {
    const { planFromFreemiusPlanId } = await import('./freemius');
    expect(planFromFreemiusPlanId('200')).toBe('growth');
  });

  it('maps scale plan id to scale', async () => {
    const { planFromFreemiusPlanId } = await import('./freemius');
    expect(planFromFreemiusPlanId('300')).toBe('scale');
  });
});

describe('billingPeriodFromFreemiusCycle', () => {
  it('returns monthly for null', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle(null)).toBe('monthly');
  });

  it('returns monthly for undefined', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle(undefined)).toBe('monthly');
  });

  it('returns monthly for cycle 1', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle(1)).toBe('monthly');
  });

  it('returns annual for cycle 12', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle(12)).toBe('annual');
  });

  it('returns annual for cycle > 12', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle(24)).toBe('annual');
  });

  it('returns annual for string "12"', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle('12')).toBe('annual');
  });

  it('returns annual for string "annual"', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle('annual')).toBe('annual');
  });

  it('returns annual for string "yearly"', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle('yearly')).toBe('annual');
  });

  it('returns monthly for string "month"', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle('month')).toBe('monthly');
  });

  it('returns monthly for string "1"', async () => {
    const { billingPeriodFromFreemiusCycle } = await import('./freemius');
    expect(billingPeriodFromFreemiusCycle('1')).toBe('monthly');
  });
});

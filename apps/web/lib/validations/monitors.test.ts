import { describe, it, expect } from 'vitest';
import {
  createMonitorSchema,
  updateMonitorSchema,
  checkResultsQuerySchema,
} from './monitors';

describe('createMonitorSchema', () => {
  const valid = {
    name: 'My API',
    url: 'https://example.com',
    type: 'http',
    intervalSeconds: 60,
  };

  it('accepts a valid minimal payload', () => {
    const result = createMonitorSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts all optional fields', () => {
    const result = createMonitorSchema.safeParse({
      ...valid,
      timeoutMs: 5000,
      responseTimeThresholdMs: 1000,
      keyword: 'OK',
      keywordCondition: 'present',
      config: { port: 443 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing name', () => {
    const { name: _n, ...rest } = valid;
    expect(createMonitorSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects an empty name', () => {
    expect(createMonitorSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    expect(createMonitorSchema.safeParse({ ...valid, name: 'x'.repeat(101) }).success).toBe(false);
  });

  it('rejects an invalid URL', () => {
    expect(createMonitorSchema.safeParse({ ...valid, url: 'not-a-url' }).success).toBe(false);
  });

  it('rejects an invalid type', () => {
    expect(createMonitorSchema.safeParse({ ...valid, type: 'ping' }).success).toBe(false);
  });

  it('rejects a missing intervalSeconds', () => {
    const { intervalSeconds: _i, ...rest } = valid;
    expect(createMonitorSchema.safeParse(rest).success).toBe(false);
  });

  it('accepts all valid monitor types', () => {
    const types = ['http', 'ssl', 'domain', 'tcp', 'keyword', 'content'];
    for (const type of types) {
      expect(createMonitorSchema.safeParse({ ...valid, type }).success).toBe(true);
    }
  });
});

describe('updateMonitorSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(updateMonitorSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a partial update with only name', () => {
    expect(updateMonitorSchema.safeParse({ name: 'Updated' }).success).toBe(true);
  });

  it('rejects an invalid url even in partial update', () => {
    expect(updateMonitorSchema.safeParse({ url: 'bad' }).success).toBe(false);
  });
});

describe('checkResultsQuerySchema', () => {
  const from = '2026-01-01T00:00:00.000Z';
  const to = '2026-01-08T00:00:00.000Z';

  it('accepts a valid range', () => {
    const result = checkResultsQuerySchema.safeParse({ from, to });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50); // default
    }
  });

  it('accepts an explicit limit', () => {
    const result = checkResultsQuerySchema.safeParse({ from, to, limit: '200' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(200);
    }
  });

  it('rejects limit > 500', () => {
    expect(checkResultsQuerySchema.safeParse({ from, to, limit: '501' }).success).toBe(false);
  });

  it('rejects missing from', () => {
    expect(checkResultsQuerySchema.safeParse({ to }).success).toBe(false);
  });

  it('rejects missing to', () => {
    expect(checkResultsQuerySchema.safeParse({ from }).success).toBe(false);
  });

  it('rejects invalid datetime strings', () => {
    expect(checkResultsQuerySchema.safeParse({ from: 'yesterday', to }).success).toBe(false);
  });
});

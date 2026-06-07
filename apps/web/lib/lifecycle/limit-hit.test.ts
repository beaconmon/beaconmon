import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSet = vi.fn();
const mockAdd = vi.fn();

vi.mock('@beaconmon/db', () => ({
  prisma: {
    teamMember: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/queue', () => ({
  getQueueRedis: () => ({ set: mockSet }),
  getLifecycleEmailQueue: () => ({ add: mockAdd }),
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

// Import after mocks are declared
import { enqueueLimitHitEmail } from './limit-hit.js';
import { prisma } from '@beaconmon/db';

const mockPrisma = prisma as unknown as { teamMember: { findFirst: ReturnType<typeof vi.fn> } };

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.teamMember.findFirst.mockResolvedValue({ user: { email: 'owner@example.com' } });
  mockAdd.mockResolvedValue(undefined);
});

describe('enqueueLimitHitEmail', () => {
  it('enqueues a lifecycle email job on first limit hit', async () => {
    mockSet.mockResolvedValue('OK'); // Redis NX acquired

    await enqueueLimitHitEmail({
      teamId: 'team-1',
      limitType: 'competitor',
      currentCount: 1,
      planLimit: 1,
      planTier: 'free',
    });

    expect(mockAdd).toHaveBeenCalledOnce();
    const [, jobData, opts] = mockAdd.mock.calls[0];
    expect(jobData.emailType).toBe('limit_hit');
    expect(jobData.teamId).toBe('team-1');
    expect(jobData.payload).toMatchObject({ limitType: 'competitor', currentCount: 1, planLimit: 1 });
    expect(jobData.ownerEmail).toBe('owner@example.com');
    expect(opts.jobId).toBe('lc_limit:hit:team-1');
  });

  it('skips enqueue when dedup key already exists in Redis', async () => {
    mockSet.mockResolvedValue(null); // NX failed — key already set

    await enqueueLimitHitEmail({
      teamId: 'team-1',
      limitType: 'monitor',
      currentCount: 10,
      planLimit: 10,
      planTier: 'free',
    });

    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('skips enqueue when owner email is not found', async () => {
    mockSet.mockResolvedValue('OK');
    mockPrisma.teamMember.findFirst.mockResolvedValue(null);

    await enqueueLimitHitEmail({
      teamId: 'team-1',
      limitType: 'competitor',
      currentCount: 1,
      planLimit: 1,
      planTier: 'free',
    });

    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('uses correct dedup key format', async () => {
    mockSet.mockResolvedValue('OK');

    await enqueueLimitHitEmail({
      teamId: 'team-abc',
      limitType: 'monitor',
      currentCount: 10,
      planLimit: 10,
      planTier: 'starter',
    });

    const [key, , , , mode] = mockSet.mock.calls[0];
    expect(key).toBe('lifecycle:dedup:limit:hit:team-abc');
    expect(mode).toBe('NX');
  });

  it('sets dedup TTL to 7 days', async () => {
    mockSet.mockResolvedValue('OK');

    await enqueueLimitHitEmail({
      teamId: 'team-1',
      limitType: 'competitor',
      currentCount: 1,
      planLimit: 1,
      planTier: 'free',
    });

    const [, , ttlMode, ttlValue] = mockSet.mock.calls[0];
    expect(ttlMode).toBe('EX');
    expect(ttlValue).toBe(7 * 24 * 60 * 60);
  });

  it('fails open when Redis throws', async () => {
    mockSet.mockRejectedValue(new Error('Redis connection refused'));

    await expect(
      enqueueLimitHitEmail({
        teamId: 'team-1',
        limitType: 'competitor',
        currentCount: 1,
        planLimit: 1,
        planTier: 'free',
      })
    ).resolves.toBeUndefined();

    expect(mockAdd).not.toHaveBeenCalled();
  });

  it('fails open when queue throws', async () => {
    mockSet.mockResolvedValue('OK');
    mockAdd.mockRejectedValue(new Error('Queue unavailable'));

    await expect(
      enqueueLimitHitEmail({
        teamId: 'team-1',
        limitType: 'competitor',
        currentCount: 1,
        planLimit: 1,
        planTier: 'free',
      })
    ).resolves.toBeUndefined();
  });
});

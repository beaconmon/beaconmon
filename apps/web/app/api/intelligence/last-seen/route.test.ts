import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@beaconmon/db', () => ({
  prisma: {
    teamMember: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

vi.mock('@/lib/api/with-auth', () => ({
  withAuth: (handler: unknown) => handler,
}));

import { GET, POST } from './route';

interface AuthCtx {
  userId: string;
  teamId: string;
  plan: 'free';
  role: 'owner';
}

const ctx: AuthCtx = { userId: 'user-1', teamId: 'team-1', plan: 'free', role: 'owner' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/intelligence/last-seen', () => {
  it('returns current lastSeenAt', async () => {
    const ts = new Date('2026-06-01T10:00:00Z');
    mockFindUnique.mockResolvedValue({ intelligenceLastSeenAt: ts });

    const res = await (GET as unknown as (req: Request, c: AuthCtx) => Promise<Response>)(
      new Request('http://test/api/intelligence/last-seen'),
      ctx
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.lastSeenAt).toBe(ts.toISOString());
  });

  it('returns null when no row exists', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await (GET as unknown as (req: Request, c: AuthCtx) => Promise<Response>)(
      new Request('http://test/api/intelligence/last-seen'),
      ctx
    );

    const body = await res.json();
    expect(body.lastSeenAt).toBeNull();
  });
});

describe('POST /api/intelligence/last-seen', () => {
  it('returns previous timestamp and bumps to now', async () => {
    const previous = new Date('2026-06-01T10:00:00Z');
    mockFindUnique.mockResolvedValue({ intelligenceLastSeenAt: previous });
    mockUpdate.mockResolvedValue({});

    const res = await (POST as unknown as (req: Request, c: AuthCtx) => Promise<Response>)(
      new Request('http://test/api/intelligence/last-seen', { method: 'POST' }),
      ctx
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.previousLastSeenAt).toBe(previous.toISOString());
    expect(new Date(body.lastSeenAt).getTime()).toBeGreaterThan(previous.getTime());

    expect(mockUpdate).toHaveBeenCalledOnce();
    const [updateArg] = mockUpdate.mock.calls[0] as [{ where: unknown; data: { intelligenceLastSeenAt: Date } }];
    expect(updateArg.where).toEqual({ teamId_userId: { teamId: 'team-1', userId: 'user-1' } });
    expect(updateArg.data.intelligenceLastSeenAt).toBeInstanceOf(Date);
  });

  it('returns null previousLastSeenAt on first visit', async () => {
    mockFindUnique.mockResolvedValue({ intelligenceLastSeenAt: null });
    mockUpdate.mockResolvedValue({});

    const res = await (POST as unknown as (req: Request, c: AuthCtx) => Promise<Response>)(
      new Request('http://test/api/intelligence/last-seen', { method: 'POST' }),
      ctx
    );

    const body = await res.json();
    expect(body.previousLastSeenAt).toBeNull();
    expect(body.lastSeenAt).toBeTruthy();
    expect(mockUpdate).toHaveBeenCalledOnce();
  });

  it('handles missing team member row', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockUpdate.mockResolvedValue({});

    const res = await (POST as unknown as (req: Request, c: AuthCtx) => Promise<Response>)(
      new Request('http://test/api/intelligence/last-seen', { method: 'POST' }),
      ctx
    );

    const body = await res.json();
    expect(body.previousLastSeenAt).toBeNull();
    expect(body.lastSeenAt).toBeTruthy();
  });
});

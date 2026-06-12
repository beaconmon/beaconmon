import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Redis } from 'ioredis';

vi.mock('@beaconmon/db', () => ({
  prisma: {
    competitorEvent: { findUnique: vi.fn() },
    competitorNotificationChannel: { findMany: vi.fn() },
  },
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ error: null }) },
  })),
}));

vi.mock('@react-email/render', () => ({ render: vi.fn().mockResolvedValue('<html/>') }));
vi.mock('./emails/content-change-alert.js', () => ({ ContentChangeAlert: vi.fn() }));
vi.mock('./lib/env.js', () => ({
  env: {
    APP_URL: 'https://beaconmon.com',
    RESEND_API_KEY: 'test-key',
    EMAIL_FROM: 'alerts@beaconmon.com',
    ALERT_DRY_RUN: false,
  },
}));
vi.mock('./lib/logger.js', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() } }));

const makeRedis = (): Partial<Redis> => ({
  set: vi.fn().mockResolvedValue('OK'),
  del: vi.fn(),
});

const emailChannel = {
  channel: { id: 'ch-1', type: 'email', config: { recipients: ['user@example.com'] }, name: 'Email' },
};

describe('processCompetitorNotifyJob — new event types', () => {
  beforeEach(() => vi.clearAllMocks());

  async function runNotify(eventType: string, payload: Record<string, unknown>) {
    const db = await import('@beaconmon/db');
    (db.prisma.competitorEvent.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'ev-1',
      type: eventType,
      payload,
      detectedAt: new Date(),
      competitor: { id: 'comp-1', name: 'Nike', domain: 'nike.com' },
    });
    (db.prisma.competitorNotificationChannel.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([emailChannel]);

    const { Resend } = await import('resend');
    const sendSpy = vi.fn().mockResolvedValue({ error: null });
    (Resend as ReturnType<typeof vi.fn>).mockImplementation(() => ({ emails: { send: sendSpy } }));

    const { processCompetitorNotifyJob } = await import('./process-competitor-notify-job.js');
    await processCompetitorNotifyJob(
      { competitorEventId: 'ev-1', teamId: 'team-1', competitorId: 'comp-1' },
      makeRedis() as Redis
    );

    return sendSpy;
  }

  it('sends "Stockout alert" subject for out_of_stock', async () => {
    const sendSpy = await runNotify('out_of_stock', {
      productHandle: 'air-max-2024',
      oldAvailable: true,
      newAvailable: false,
    });
    expect(sendSpy).toHaveBeenCalledOnce();
    const { subject } = sendSpy.mock.calls[0]![0] as { subject: string };
    expect(subject).toBe('Stockout alert: Nike');
  });

  it('sends "Back in stock" subject for back_in_stock', async () => {
    const sendSpy = await runNotify('back_in_stock', {
      productHandle: 'air-max-2024',
      oldAvailable: false,
      newAvailable: true,
    });
    expect(sendSpy).toHaveBeenCalledOnce();
    const { subject } = sendSpy.mock.calls[0]![0] as { subject: string };
    expect(subject).toBe('Back in stock: Nike');
  });

  it('uses generic subject for price_changed', async () => {
    const sendSpy = await runNotify('price_changed', {
      oldPrice: '90.00',
      newPrice: '80.00',
    });
    expect(sendSpy).toHaveBeenCalledOnce();
    const { subject } = sendSpy.mock.calls[0]![0] as { subject: string };
    expect(subject).toBe("Competitor change detected on 'Nike'");
  });

  it('throws and releases the channel idempotency key when a send fails', async () => {
    const db = await import('@beaconmon/db');
    (db.prisma.competitorEvent.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'ev-1',
      type: 'price_changed',
      payload: { oldPrice: '90.00', newPrice: '80.00' },
      detectedAt: new Date(),
      competitor: { id: 'comp-1', name: 'Nike', domain: 'nike.com' },
    });
    (db.prisma.competitorNotificationChannel.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([emailChannel]);

    const { Resend } = await import('resend');
    (Resend as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      emails: { send: vi.fn().mockResolvedValue({ error: { message: 'rate limited' } }) },
    }));

    const redis = makeRedis();
    (redis.del as ReturnType<typeof vi.fn>).mockResolvedValue(1);

    const { processCompetitorNotifyJob } = await import('./process-competitor-notify-job.js');
    await expect(
      processCompetitorNotifyJob(
        { competitorEventId: 'ev-1', teamId: 'team-1', competitorId: 'comp-1' },
        redis as Redis
      )
    ).rejects.toThrow('failed for 1 channel(s)');

    expect(redis.del).toHaveBeenCalledWith('competitor:notify:sent:ev-1:ch-1');
  });
});

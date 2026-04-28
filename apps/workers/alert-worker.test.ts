/**
 * Unit tests for processAlertJob idempotency logic.
 *
 * All external dependencies (repositories, channel senders) are mocked.
 * No database or Redis connection required.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AlertJob } from '@beaconmon/queue';

// ─── Mock modules before importing the function under test ───────────────────

vi.mock('@beaconmon/db', () => ({
  prisma: {
    incident: {
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
  monitorRepository: {
    findById: vi.fn(),
  },
  alertChannelRepository: {
    findActiveByTeamId: vi.fn(),
  },
  notificationRepository: {
    existsRecent: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('./lib/channels/index.js', () => ({
  getChannelSender: vi.fn(),
}));

vi.mock('./lib/env.js', () => ({
  env: {
    REDIS_URL: 'redis://localhost:6379',
    ALERT_DRY_RUN: false,
    RESEND_API_KEY: undefined,
    EMAIL_FROM: undefined,
    FEATURE_SMS_ALERTS: false,
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
  },
}));

// Silence logger output in tests
vi.mock('./lib/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { processAlertJob } from './process-alert-job.js';
import { prisma, monitorRepository, alertChannelRepository, notificationRepository } from '@beaconmon/db';
import { getChannelSender } from './lib/channels/index.js';

// ─── Test fixtures ────────────────────────────────────────────────────────────

const mockMonitor = {
  id: 'monitor-1',
  teamId: 'team-1',
  name: 'Test Monitor',
  url: 'https://example.com',
  type: 'http' as const,
  intervalSeconds: 60,
  timeoutMs: 10000,
  currentStatus: 'down' as const,
  consecutiveFailures: 2,
  config: {},
  contentSnapshot: null,
  keyword: null,
  keywordCondition: null,
  escalationPolicyId: null,
  anomalyDetectionEnabled: false,
};

const mockIncident = {
  id: 'incident-1',
  startedAt: new Date('2024-01-01T10:00:00Z'),
};

const mockChannel = {
  id: 'channel-1',
  teamId: 'team-1',
  name: 'Email Alerts',
  type: 'email',
  config: { recipients: ['ops@example.com'] },
  isActive: true,
};

const alertJob: AlertJob = {
  incidentId: 'incident-1',
  monitorId: 'monitor-1',
  teamId: 'team-1',
  type: 'down',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('processAlertJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(monitorRepository.findById).mockResolvedValue(mockMonitor);
    vi.mocked(prisma.incident.findUnique).mockResolvedValue(mockIncident as never);
    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([mockChannel]);
    vi.mocked(notificationRepository.existsRecent).mockResolvedValue(false);
    vi.mocked(notificationRepository.create).mockResolvedValue();

    const mockSender = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getChannelSender).mockReturnValue(mockSender);
  });

  it('sends alert and logs notification on first call', async () => {
    await processAlertJob(alertJob);

    const sender = vi.mocked(getChannelSender).mock.results[0]?.value;
    expect(sender).toHaveBeenCalledOnce();
    expect(notificationRepository.create).toHaveBeenCalledOnce();
    expect(notificationRepository.create).toHaveBeenCalledWith({
      teamId: 'team-1',
      incidentId: 'incident-1',
      channelId: 'channel-1',
    });
  });

  it('skips send when notification already exists within window (idempotency)', async () => {
    vi.mocked(notificationRepository.existsRecent).mockResolvedValue(true);

    // Call twice — both should be no-ops since existsRecent returns true
    await processAlertJob(alertJob);
    await processAlertJob(alertJob);

    // sender should never be called
    expect(getChannelSender).not.toHaveBeenCalled();
    // no new notification records
    expect(notificationRepository.create).not.toHaveBeenCalled();
  });

  it('only sends once when called twice and first call creates the notification', async () => {
    // First call: not sent yet
    vi.mocked(notificationRepository.existsRecent).mockResolvedValueOnce(false);
    const mockSender = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getChannelSender).mockReturnValue(mockSender);

    await processAlertJob(alertJob);
    expect(mockSender).toHaveBeenCalledOnce();
    expect(notificationRepository.create).toHaveBeenCalledOnce();

    // Second call: notification now exists
    vi.mocked(notificationRepository.existsRecent).mockResolvedValueOnce(true);
    vi.clearAllMocks();
    vi.mocked(monitorRepository.findById).mockResolvedValue(mockMonitor);
    vi.mocked(prisma.incident.findUnique).mockResolvedValue(mockIncident as never);
    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([mockChannel]);
    vi.mocked(notificationRepository.existsRecent).mockResolvedValue(true);
    vi.mocked(getChannelSender).mockReturnValue(mockSender);

    await processAlertJob(alertJob);
    expect(mockSender).not.toHaveBeenCalled();
    expect(notificationRepository.create).not.toHaveBeenCalled();
  });

  it('continues to next channel when one channel fails (partial failure)', async () => {
    const failingChannel = { ...mockChannel, id: 'channel-fail', name: 'Failing Channel' };
    const successChannel = { ...mockChannel, id: 'channel-ok', name: 'Success Channel' };

    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([
      failingChannel,
      successChannel,
    ]);
    vi.mocked(notificationRepository.existsRecent).mockResolvedValue(false);

    const failingSender = vi.fn().mockRejectedValue(new Error('Send failed'));
    const successSender = vi.fn().mockResolvedValue(undefined);

    vi.mocked(getChannelSender)
      .mockReturnValueOnce(failingSender)
      .mockReturnValueOnce(successSender);

    // Should not throw — partial success is OK
    await expect(processAlertJob(alertJob)).resolves.not.toThrow();

    expect(failingSender).toHaveBeenCalledOnce();
    expect(successSender).toHaveBeenCalledOnce();
    // Only successful channel gets a notification record
    expect(notificationRepository.create).toHaveBeenCalledOnce();
    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ channelId: 'channel-ok' })
    );
  });

  it('throws when ALL channels fail (triggers BullMQ retry)', async () => {
    const channel2 = { ...mockChannel, id: 'channel-2', name: 'Channel 2' };
    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([
      mockChannel,
      channel2,
    ]);
    vi.mocked(notificationRepository.existsRecent).mockResolvedValue(false);

    const failingSender = vi.fn().mockRejectedValue(new Error('Send failed'));
    vi.mocked(getChannelSender).mockReturnValue(failingSender);

    await expect(processAlertJob(alertJob)).rejects.toThrow('All 2 alert channel(s) failed');
    expect(notificationRepository.create).not.toHaveBeenCalled();
  });

  it('returns early without sending when no active channels', async () => {
    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([]);

    await processAlertJob(alertJob);

    expect(getChannelSender).not.toHaveBeenCalled();
    expect(notificationRepository.create).not.toHaveBeenCalled();
  });

  it('throws when monitor is not found', async () => {
    vi.mocked(monitorRepository.findById).mockResolvedValue(null);

    await expect(processAlertJob(alertJob)).rejects.toThrow('Monitor monitor-1 not found');
  });

  it('throws when incident is not found', async () => {
    vi.mocked(prisma.incident.findUnique).mockResolvedValue(null);

    await expect(processAlertJob(alertJob)).rejects.toThrow('Incident incident-1 not found');
  });
});

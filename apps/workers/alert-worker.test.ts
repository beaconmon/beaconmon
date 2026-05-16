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
    tryClaim: vi.fn(),
    markSent: vi.fn(),
    releaseClaim: vi.fn(),
  },
  deployEventRepository: {
    hasActiveDeployWithSuppression: vi.fn(),
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
import {
  prisma,
  monitorRepository,
  alertChannelRepository,
  notificationRepository,
  deployEventRepository,
} from '@beaconmon/db';
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
  isCompetitor: false,
  instantAlerts: false,
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

const mockClaim = { id: 'notif-1', bucket: new Date('2024-01-01T10:00:00Z') };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('processAlertJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(monitorRepository.findById).mockResolvedValue(mockMonitor);
    vi.mocked(prisma.incident.findUnique).mockResolvedValue(mockIncident as never);
    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([mockChannel]);
    vi.mocked(notificationRepository.existsRecent).mockResolvedValue(false);
    vi.mocked(notificationRepository.tryClaim).mockResolvedValue(mockClaim);
    vi.mocked(notificationRepository.markSent).mockResolvedValue();
    vi.mocked(notificationRepository.releaseClaim).mockResolvedValue();
    vi.mocked(deployEventRepository.hasActiveDeployWithSuppression).mockResolvedValue(false);

    const mockSender = vi.fn().mockResolvedValue(undefined);
    vi.mocked(getChannelSender).mockReturnValue(mockSender);
  });

  it('claims, sends, and marks notification on first call', async () => {
    await processAlertJob(alertJob);

    const sender = vi.mocked(getChannelSender).mock.results[0]?.value;
    expect(sender).toHaveBeenCalledOnce();
    expect(notificationRepository.tryClaim).toHaveBeenCalledWith({
      teamId: 'team-1',
      incidentId: 'incident-1',
      channelId: 'channel-1',
      kind: 'down',
    });
    expect(notificationRepository.markSent).toHaveBeenCalledWith(mockClaim.id);
    expect(notificationRepository.releaseClaim).not.toHaveBeenCalled();
  });

  it('skips send when notification already exists in window (fast path)', async () => {
    vi.mocked(notificationRepository.existsRecent).mockResolvedValue(true);

    await processAlertJob(alertJob);
    await processAlertJob(alertJob);

    expect(getChannelSender).not.toHaveBeenCalled();
    expect(notificationRepository.tryClaim).not.toHaveBeenCalled();
    expect(notificationRepository.markSent).not.toHaveBeenCalled();
  });

  it('skips send when claim is lost to a concurrent worker (race protection)', async () => {
    vi.mocked(notificationRepository.tryClaim).mockResolvedValue(null);

    await processAlertJob(alertJob);

    expect(getChannelSender).not.toHaveBeenCalled();
    expect(notificationRepository.markSent).not.toHaveBeenCalled();
    expect(notificationRepository.releaseClaim).not.toHaveBeenCalled();
  });

  it('releases claim and continues to next channel when one channel fails', async () => {
    const failingChannel = { ...mockChannel, id: 'channel-fail', name: 'Failing Channel' };
    const successChannel = { ...mockChannel, id: 'channel-ok', name: 'Success Channel' };

    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([
      failingChannel,
      successChannel,
    ]);
    vi.mocked(notificationRepository.tryClaim)
      .mockResolvedValueOnce({ id: 'claim-fail', bucket: new Date() })
      .mockResolvedValueOnce({ id: 'claim-ok', bucket: new Date() });

    const failingSender = vi.fn().mockRejectedValue(new Error('Send failed'));
    const successSender = vi.fn().mockResolvedValue(undefined);

    vi.mocked(getChannelSender)
      .mockReturnValueOnce(failingSender)
      .mockReturnValueOnce(successSender);

    await expect(processAlertJob(alertJob)).resolves.not.toThrow();

    expect(failingSender).toHaveBeenCalledOnce();
    expect(successSender).toHaveBeenCalledOnce();
    // Failed channel: claim released, never marked sent
    expect(notificationRepository.releaseClaim).toHaveBeenCalledWith('claim-fail');
    // Successful channel: marked sent
    expect(notificationRepository.markSent).toHaveBeenCalledWith('claim-ok');
  });

  it('throws when ALL channels fail (triggers BullMQ retry)', async () => {
    const channel2 = { ...mockChannel, id: 'channel-2', name: 'Channel 2' };
    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([
      mockChannel,
      channel2,
    ]);
    vi.mocked(notificationRepository.tryClaim)
      .mockResolvedValueOnce({ id: 'claim-1', bucket: new Date() })
      .mockResolvedValueOnce({ id: 'claim-2', bucket: new Date() });

    const failingSender = vi.fn().mockRejectedValue(new Error('Send failed'));
    vi.mocked(getChannelSender).mockReturnValue(failingSender);

    await expect(processAlertJob(alertJob)).rejects.toThrow('All 2 alert channel(s) failed');
    expect(notificationRepository.markSent).not.toHaveBeenCalled();
    expect(notificationRepository.releaseClaim).toHaveBeenCalledTimes(2);
  });

  it('returns early without sending when no active channels', async () => {
    vi.mocked(alertChannelRepository.findActiveByTeamId).mockResolvedValue([]);

    await processAlertJob(alertJob);

    expect(getChannelSender).not.toHaveBeenCalled();
    expect(notificationRepository.tryClaim).not.toHaveBeenCalled();
  });

  it('throws when monitor is not found', async () => {
    vi.mocked(monitorRepository.findById).mockResolvedValue(null);

    await expect(processAlertJob(alertJob)).rejects.toThrow('Monitor monitor-1 not found');
  });

  it('throws when incident is not found', async () => {
    vi.mocked(prisma.incident.findUnique).mockResolvedValue(null);

    await expect(processAlertJob(alertJob)).rejects.toThrow('Incident incident-1 not found');
  });

  it('passes kind=up for recovery alerts so it does not collide with the down claim', async () => {
    await processAlertJob({ ...alertJob, type: 'up', durationMs: 12345 });

    expect(notificationRepository.tryClaim).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'up' })
    );
  });
});

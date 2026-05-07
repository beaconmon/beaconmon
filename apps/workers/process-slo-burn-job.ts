import { monitorRepository, alertChannelRepository } from '@beaconmon/db';
import { getChannelSender } from './lib/channels/index.js';
import type { AlertPayload } from './lib/channels/types.js';
import { logger } from './lib/logger.js';
import { Sentry } from './lib/sentry.js';
import type { SloBurnAlertJob } from '@beaconmon/queue';

export async function processSloBurnJob(data: SloBurnAlertJob): Promise<void> {
  try {
    const { monitorId, teamId, burnRate, severity, uptimePercent, errorBudgetRemainingMinutes, windowDays } = data;

    const monitor = await monitorRepository.findById(monitorId);
    if (!monitor) {
      throw new Error(`Monitor ${monitorId} not found — cannot send SLO burn alert`);
    }

    const channels = await alertChannelRepository.findActiveByTeamId(teamId);
    if (channels.length === 0) {
      logger.info(
        { service: 'alert-worker', teamId, monitorId },
        'No active alert channels — SLO burn alert not sent'
      );
      return;
    }

    // Use a synthetic "incident" ID for the alert payload (SLO burns don't create incidents)
    const syntheticId = `slo-burn:${monitorId}:${severity}:${Date.now()}`;

    const payload: AlertPayload = {
      monitor: {
        id: monitor.id,
        name: monitor.name,
        url: monitor.url,
      },
      incident: {
        id: syntheticId,
        startedAt: new Date(),
      },
      type: severity === 'fast' ? 'down' : 'slow',
      durationMs: undefined,
    };

    let successCount = 0;
    let failureCount = 0;

    for (const channel of channels) {
      try {
        const sender = getChannelSender(channel.type);
        await sender(channel.config, payload);

        logger.info(
          { service: 'alert-worker', monitorId, channelId: channel.id, channelType: channel.type, severity },
          'SLO burn alert sent'
        );
        successCount++;
      } catch (err) {
        logger.error(
          { service: 'alert-worker', monitorId, channelId: channel.id, channelType: channel.type, err },
          'SLO burn alert send failed'
        );
        failureCount++;
      }
    }

    if (failureCount > 0 && successCount === 0) {
      throw new Error(
        `All ${failureCount} alert channel(s) failed for SLO burn alert on monitor ${monitorId}`
      );
    }

    if (failureCount > 0) {
      logger.warn(
        { service: 'alert-worker', monitorId, successCount, failureCount, severity },
        'Some SLO burn alert channels failed (partial success — not retrying)'
      );
    }

    logger.info(
      {
        service: 'alert-worker',
        monitorId,
        severity,
        burnRate: burnRate.toFixed(2),
        uptimePercent: uptimePercent.toFixed(4),
        errorBudgetRemainingMinutes: errorBudgetRemainingMinutes.toFixed(1),
        windowDays,
      },
      'SLO burn alert processed'
    );
  } catch (err) {
    Sentry.captureException(err);
    throw err;
  }
}

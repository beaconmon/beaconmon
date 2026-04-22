import { prisma, monitorRepository, alertChannelRepository, notificationRepository } from '@beaconmon/db';
import { getChannelSender } from './lib/channels/index.js';
import type { AlertPayload } from './lib/channels/types.js';
import { logger } from './lib/logger.js';
import type { AlertJob } from '@beaconmon/queue';

const IDEMPOTENCY_WINDOW_MINUTES = 5;

export async function processAlertJob(data: AlertJob): Promise<void> {
  const { incidentId, monitorId, teamId, type, durationMs } = data;

  // 1. Load monitor
  const monitor = await monitorRepository.findById(monitorId);
  if (!monitor) {
    throw new Error(`Monitor ${monitorId} not found — cannot send alert`);
  }

  // 2. Load incident startedAt from DB
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { id: true, startedAt: true },
  });
  if (!incident) {
    throw new Error(`Incident ${incidentId} not found — cannot send alert`);
  }

  // 3. Load active alert channels for this team
  const channels = await alertChannelRepository.findActiveByTeamId(teamId);

  if (channels.length === 0) {
    logger.info(
      { service: 'alert-worker', teamId, incidentId },
      'No active alert channels — nothing to send'
    );
    return;
  }

  const payload: AlertPayload = {
    monitor: {
      id: monitor.id,
      name: monitor.name,
      url: monitor.url,
    },
    incident: {
      id: incident.id,
      startedAt: incident.startedAt,
    },
    type,
    durationMs,
  };

  // 4. Send to each channel with per-channel idempotency and error isolation
  let successCount = 0;
  let failureCount = 0;

  for (const channel of channels) {
    // 4a. Idempotency check (architecture rule #5)
    const alreadySent = await notificationRepository.existsRecent(
      incidentId,
      channel.id,
      IDEMPOTENCY_WINDOW_MINUTES
    );

    if (alreadySent) {
      logger.debug(
        { service: 'alert-worker', incidentId, channelId: channel.id, channelType: channel.type },
        'Notification already sent within window — skipping'
      );
      successCount++; // counts as "handled"
      continue;
    }

    // 4b. Get sender and dispatch
    try {
      const sender = getChannelSender(channel.type);
      await sender(channel.config, payload);

      // 4c. Insert notification record AFTER successful send
      await notificationRepository.create({ teamId, incidentId, channelId: channel.id });

      logger.info(
        { service: 'alert-worker', incidentId, channelId: channel.id, channelType: channel.type },
        'Alert sent and notification logged'
      );

      successCount++;
    } catch (err) {
      logger.error(
        { service: 'alert-worker', incidentId, channelId: channel.id, channelType: channel.type, err },
        'Alert send failed for channel'
      );
      failureCount++;
    }
  }

  // 5. If ALL channels failed, throw so BullMQ retries the job
  if (failureCount > 0 && successCount === 0) {
    throw new Error(
      `All ${failureCount} alert channel(s) failed for incident ${incidentId}`
    );
  }

  if (failureCount > 0) {
    logger.warn(
      { service: 'alert-worker', incidentId, successCount, failureCount },
      'Some alert channels failed (partial success — not retrying)'
    );
  }
}

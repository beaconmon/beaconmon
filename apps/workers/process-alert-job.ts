import { prisma, monitorRepository, alertChannelRepository, notificationRepository, deployEventRepository } from '@beaconmon/db';
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

  // 3. Check for active deploy with alert suppression
  if (type === 'down') {
    const suppressed = await deployEventRepository.hasActiveDeployWithSuppression(monitorId);
    if (suppressed) {
      logger.info(
        { service: 'alert-worker', monitorId, incidentId },
        'Alert suppressed — active deploy in progress'
      );
      return;
    }
  }

  // 4. Load active alert channels for this team
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

  // 5. Send to each channel with per-channel idempotency and error isolation.
  //
  //    Race protection (architecture rule #5): we use a claim-then-send pattern
  //    backed by the unique index on (incident_id, channel_id, kind, sent_window_bucket).
  //    Two concurrent retries can't both pass `tryClaim` for the same bucket.
  let successCount = 0;
  let failureCount = 0;

  for (const channel of channels) {
    // 5a. Fast path: skip if a delivered notification already exists in the
    //     rolling window (handles spread-out retries after a long backoff).
    const alreadySent = await notificationRepository.existsRecent(
      teamId,
      incidentId,
      channel.id,
      IDEMPOTENCY_WINDOW_MINUTES
    );

    if (alreadySent) {
      logger.debug(
        { service: 'alert-worker', incidentId, channelId: channel.id, channelType: channel.type },
        'Notification already sent within window — skipping'
      );
      successCount++;
      continue;
    }

    // 5b. Atomically reserve this (incident, channel, kind, bucket) slot.
    //     If another worker beat us to it, skip — they'll do the send.
    const claim = await notificationRepository.tryClaim({
      teamId,
      incidentId,
      channelId: channel.id,
      kind: type,
    });

    if (!claim) {
      logger.debug(
        { service: 'alert-worker', incidentId, channelId: channel.id, channelType: channel.type },
        'Notification claim lost to concurrent worker — skipping'
      );
      successCount++;
      continue;
    }

    // 5c. Send and finalize. Release the claim on send failure so the next
    //     BullMQ retry can re-claim and retry the send.
    try {
      const sender = getChannelSender(channel.type);
      await sender(channel.config, payload);
      await notificationRepository.markSent(claim.id);

      logger.info(
        { service: 'alert-worker', incidentId, channelId: channel.id, channelType: channel.type },
        'Alert sent and notification logged'
      );

      successCount++;
    } catch (err) {
      await notificationRepository.releaseClaim(claim.id).catch((releaseErr) => {
        logger.error(
          { service: 'alert-worker', incidentId, channelId: channel.id, err: releaseErr },
          'Failed to release notification claim after send failure'
        );
      });
      logger.error(
        { service: 'alert-worker', incidentId, channelId: channel.id, channelType: channel.type, err },
        'Alert send failed for channel'
      );
      failureCount++;
    }
  }

  // 6. If ALL channels failed, throw so BullMQ retries the job
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

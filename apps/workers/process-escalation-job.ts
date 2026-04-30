import { prisma, alertChannelRepository, notificationRepository } from '@beaconmon/db';
import { getChannelSender } from './lib/channels/index.js';
import type { AlertPayload } from './lib/channels/types.js';
import { logger } from './lib/logger.js';
import type { EscalationStepJob } from '@beaconmon/queue';

export async function processEscalationJob(data: EscalationStepJob): Promise<void> {
  const { incidentId, monitorId, policyId, teamId, stepIndex } = data;
  const service = 'escalation-worker';

  // 1. Load incident — skip if already acknowledged or resolved
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { id: true, startedAt: true, acknowledgedAt: true, resolvedAt: true },
  });

  if (!incident) {
    logger.warn({ service, incidentId }, 'Incident not found — skipping escalation step');
    return;
  }

  if (incident.acknowledgedAt) {
    logger.info({ service, incidentId, stepIndex }, 'Incident acknowledged — skipping escalation step');
    return;
  }

  if (incident.resolvedAt) {
    logger.info({ service, incidentId, stepIndex }, 'Incident resolved — skipping escalation step');
    return;
  }

  // 2. Load the specific escalation step
  const step = await prisma.escalationStep.findFirst({
    where: { policyId, stepOrder: stepIndex },
    select: { id: true, channelId: true },
  });

  if (!step) {
    logger.warn({ service, incidentId, policyId, stepIndex }, 'Escalation step not found');
    return;
  }

  // 3. Load the alert channel — skip if user-disabled OR system-disabled (plan downgrade)
  const channel = await prisma.alertChannel.findFirst({
    where: { id: step.channelId, isActive: true, disabledAt: null },
    select: { id: true, type: true, config: true },
  });

  if (!channel) {
    logger.warn({ service, incidentId, channelId: step.channelId }, 'Alert channel not found, inactive, or system-disabled');
    return;
  }

  // 4. Idempotency fast path — already-delivered alert in the rolling window
  const alreadySent = await notificationRepository.existsRecent(
    teamId,
    incidentId,
    channel.id,
    5
  );

  if (alreadySent) {
    logger.debug(
      { service, incidentId, channelId: channel.id, stepIndex },
      'Notification already sent within window — skipping escalation step'
    );
    return;
  }

  // 5. Atomically reserve the (incident, channel, kind, bucket) slot. The
  //    unique index in notifications enforces this across concurrent workers.
  const claim = await notificationRepository.tryClaim({
    teamId,
    incidentId,
    channelId: channel.id,
    kind: 'down',
  });

  if (!claim) {
    logger.debug(
      { service, incidentId, channelId: channel.id, stepIndex },
      'Notification claim lost to concurrent worker — skipping escalation step'
    );
    return;
  }

  // 6. Load monitor for the alert payload
  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    select: { id: true, name: true, url: true },
  });

  if (!monitor) {
    await notificationRepository.releaseClaim(claim.id).catch((releaseErr) => {
      logger.error(
        { service, incidentId, channelId: channel.id, err: releaseErr },
        'Failed to release notification claim after missing monitor'
      );
    });
    logger.warn({ service, monitorId }, 'Monitor not found — cannot send escalation alert');
    return;
  }

  const payload: AlertPayload = {
    monitor: { id: monitor.id, name: monitor.name, url: monitor.url },
    incident: { id: incident.id, startedAt: incident.startedAt },
    type: 'down',
  };

  // 7. Send via the channel sender; release claim on failure so retries work.
  try {
    const sender = getChannelSender(channel.type);
    await sender(channel.config as Record<string, unknown>, payload);
    await notificationRepository.markSent(claim.id);

    logger.info(
      { service, incidentId, channelId: channel.id, channelType: channel.type, stepIndex },
      'Escalation step alert sent'
    );
  } catch (err) {
    await notificationRepository.releaseClaim(claim.id).catch((releaseErr) => {
      logger.error(
        { service, incidentId, channelId: channel.id, err: releaseErr },
        'Failed to release notification claim after escalation send failure'
      );
    });
    logger.error(
      { service, incidentId, channelId: channel.id, stepIndex, err },
      'Escalation step alert send failed'
    );
    throw err; // let BullMQ retry
  }
}

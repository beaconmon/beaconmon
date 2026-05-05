import {
  prisma,
  notificationRepository,
  escalationRecipientResolver,
  type ResolvedEscalationRecipient,
} from '@beaconmon/db';
import { getChannelSender } from './lib/channels/index.js';
import type { AlertPayload } from './lib/channels/types.js';
import { logger } from './lib/logger.js';
import type { EscalationStepJob } from '@beaconmon/queue';

async function sendToRecipient(
  recipient: ResolvedEscalationRecipient,
  teamId: string,
  incidentId: string,
  payload: AlertPayload,
  service: string,
  stepIndex: number
): Promise<void> {
  const alreadySent = await notificationRepository.existsRecent(
    teamId,
    incidentId,
    recipient.channelId,
    5
  );
  if (alreadySent) {
    logger.debug(
      { service, incidentId, channelId: recipient.channelId, stepIndex },
      'Notification already sent within window — skipping recipient'
    );
    return;
  }

  const claim = await notificationRepository.tryClaim({
    teamId,
    incidentId,
    channelId: recipient.channelId,
    kind: 'down',
  });
  if (!claim) {
    logger.debug(
      { service, incidentId, channelId: recipient.channelId, stepIndex },
      'Notification claim lost to concurrent worker — skipping recipient'
    );
    return;
  }

  try {
    const sender = getChannelSender(recipient.channelType);
    await sender(recipient.channelConfig as Record<string, unknown>, payload);
    await notificationRepository.markSent(claim.id);
    logger.info(
      {
        service,
        incidentId,
        channelId: recipient.channelId,
        channelType: recipient.channelType,
        stepIndex,
        viaUser: recipient.viaUser,
        userId: recipient.userId,
      },
      'Escalation step alert sent'
    );
  } catch (err) {
    await notificationRepository.releaseClaim(claim.id).catch((releaseErr) => {
      logger.error(
        { service, incidentId, channelId: recipient.channelId, err: releaseErr },
        'Failed to release notification claim after escalation send failure'
      );
    });
    throw err; // surface to Promise.allSettled so the job can retry
  }
}

export async function processEscalationJob(data: EscalationStepJob): Promise<void> {
  const { incidentId, monitorId, policyId, teamId, stepIndex } = data;
  const service = 'escalation-worker';

  // 1. Load incident — skip if already acknowledged or resolved.
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { id: true, startedAt: true, acknowledgedAt: true, resolvedAt: true },
  });

  if (!incident) {
    logger.warn({ service, incidentId }, 'Incident not found — skipping escalation step');
    return;
  }
  if (incident.acknowledgedAt) {
    logger.info(
      { service, incidentId, stepIndex },
      'Incident acknowledged — skipping escalation step'
    );
    return;
  }
  if (incident.resolvedAt) {
    logger.info(
      { service, incidentId, stepIndex },
      'Incident resolved — skipping escalation step'
    );
    return;
  }

  // 2. Resolve recipients for this step (channels + users → channels).
  const resolution = await escalationRecipientResolver.resolveStep(policyId, stepIndex);
  if (!resolution) {
    logger.warn(
      { service, incidentId, policyId, stepIndex },
      'Escalation step not found'
    );
    return;
  }

  if (resolution.skipped.length > 0) {
    logger.info(
      { service, incidentId, stepIndex, skipped: resolution.skipped },
      'Skipped recipients on escalation step'
    );
  }

  if (resolution.resolved.length === 0) {
    logger.warn(
      { service, incidentId, stepIndex },
      'No deliverable recipients on escalation step — nothing to send'
    );
    return;
  }

  // 3. Load monitor for the alert payload.
  const monitor = await prisma.monitor.findUnique({
    where: { id: monitorId },
    select: { id: true, name: true, url: true },
  });
  if (!monitor) {
    logger.warn({ service, monitorId }, 'Monitor not found — cannot send escalation alert');
    return;
  }

  const payload: AlertPayload = {
    monitor: { id: monitor.id, name: monitor.name, url: monitor.url },
    incident: { id: incident.id, startedAt: incident.startedAt },
    type: 'down',
  };

  // 4. Fan out to all recipients in parallel. Each gets its own claim+send so
  //    one failure does not block siblings; idempotency dedupes already-sent
  //    recipients on retry.
  const results = await Promise.allSettled(
    resolution.resolved.map((recipient) =>
      sendToRecipient(recipient, teamId, incidentId, payload, service, stepIndex)
    )
  );

  const failures = results
    .map((r, i) => ({ r, recipient: resolution.resolved[i]! }))
    .filter((x) => x.r.status === 'rejected');

  if (failures.length > 0) {
    for (const f of failures) {
      logger.error(
        {
          service,
          incidentId,
          channelId: f.recipient.channelId,
          channelType: f.recipient.channelType,
          stepIndex,
          err: (f.r as PromiseRejectedResult).reason,
        },
        'Escalation step alert send failed'
      );
    }
    // At least one recipient failed — let BullMQ retry. Already-delivered
    // recipients will be skipped by the existsRecent check on the next attempt.
    throw new Error(
      `Escalation step ${stepIndex} for incident ${incidentId}: ${failures.length}/${resolution.resolved.length} recipient sends failed`
    );
  }
}

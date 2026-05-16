import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { z } from 'zod';
import { contentSnapshotWorkerRepository, alertChannelRepository } from '@beaconmon/db';
import type { CompetitorDigestJob } from '@beaconmon/queue';
import { CompetitorDigestEmail } from './emails/competitor-digest.js';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';

const EmailChannelConfig = z.object({
  recipients: z.array(z.string().email()),
});

const service = 'alert-worker';

export async function processCompetitorDigestJob(data: CompetitorDigestJob): Promise<void> {
  const { teamId, windowStart, windowEnd } = data;

  const snapshots = await contentSnapshotWorkerRepository.findSnapshotsForDigest(
    teamId,
    new Date(windowStart),
    new Date(windowEnd)
  );

  if (snapshots.length === 0) {
    logger.info({ service, teamId }, 'Competitor digest: no changes in window, skipping send');
    return;
  }

  const dashboardUrl = env.APP_URL ? `${env.APP_URL}/competitors` : 'https://beaconmon.com/competitors';

  const changes = snapshots.map((s) => ({
    monitorName: s.monitorName,
    monitorUrl: s.monitorUrl,
    changedAt: s.capturedAt,
    dashboardUrl: `${dashboardUrl}/${s.monitorId}`,
  }));

  const channels = await alertChannelRepository.findActiveByTeamId(teamId);
  const emailChannels = channels.filter((c) => c.type === 'email');

  if (emailChannels.length === 0) {
    logger.info({ service, teamId }, 'Competitor digest: no email channels configured, skipping');
    return;
  }

  // Collect unique recipients across all email channels
  const recipientSet = new Set<string>();
  for (const channel of emailChannels) {
    const parsed = EmailChannelConfig.safeParse(channel.config);
    if (parsed.success) {
      for (const r of parsed.data.recipients) recipientSet.add(r);
    }
  }

  const recipients = Array.from(recipientSet);
  if (recipients.length === 0) return;

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service, teamId, recipients, changeCount: changes.length },
      'ALERT_DRY_RUN — skipping competitor digest email'
    );
    return;
  }

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY or EMAIL_FROM not set');
  }

  const html = await render(
    React.createElement(CompetitorDigestEmail, {
      changes,
      dashboardUrl,
      windowStart: new Date(windowStart),
      windowEnd: new Date(windowEnd),
    })
  );

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: recipients,
    subject: `Competitor Intelligence Digest — ${changes.length} change${changes.length !== 1 ? 's' : ''} detected`,
    html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  logger.info(
    { service, teamId, changeCount: changes.length, recipientCount: recipients.length },
    'Competitor digest sent'
  );
}

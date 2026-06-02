import * as React from 'react';
import { z } from 'zod';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { prisma } from '@beaconmon/db';
import type { CompetitorNotifyJob } from '@beaconmon/queue';
import type { Redis } from 'ioredis';
import { ContentChangeAlert } from './emails/content-change-alert.js';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';

const EmailChannelConfig = z.object({
  recipients: z.array(z.string().email()),
});

const SlackChannelConfig = z.object({
  webhookUrl: z.string().url(),
});

const service = 'competitor-notify-worker';

export async function processCompetitorNotifyJob(data: CompetitorNotifyJob, redis: Redis): Promise<void> {
  const { competitorEventId, teamId: _teamId, competitorId } = data;

  // 1. Idempotency guard — prevent double-notify on BullMQ retries
  const idempotencyKey = `competitor:notify:sent:${competitorEventId}`;
  const claimed = await redis.set(idempotencyKey, '1', 'EX', 300, 'NX');
  if (!claimed) {
    logger.info({ service, competitorEventId }, 'Notification already sent — skipping');
    return;
  }

  try {
    // 2. Load event with competitor name
    const event = await prisma.competitorEvent.findUnique({
      where: { id: competitorEventId },
      include: { competitor: true },
    });
    if (!event) {
      logger.warn({ service, competitorEventId }, 'CompetitorEvent not found');
      return;
    }

    // 3. Load linked notification channels
    const channelLinks = await prisma.competitorNotificationChannel.findMany({
      where: { competitorId },
      include: { channel: true },
    });

    // 4. No channels configured
    if (channelLinks.length === 0) {
      logger.info({ service, competitorId }, 'No notification channels configured');
      return;
    }

    // 5. Build competitor detail URL
    const diffUrl = env.APP_URL ? `${env.APP_URL}/competitors/${competitorId}` : undefined;

    // 6. Extract payload fields
    const payload = event.payload as {
      pageUrl?: string;
      diffSummary?: string | null;
      classification?: string | null;
    };

    const monitorName = event.competitor.name;
    const monitorUrl = payload.pageUrl ?? '';
    const changedAt = event.detectedAt;
    const summary = payload.diffSummary ?? undefined;
    const classification = payload.classification ?? undefined;

    for (const link of channelLinks) {
      const channel = link.channel;
      try {
        switch (channel.type) {
          case 'email':
            await sendEmailNotification(channel.config, monitorName, monitorUrl, changedAt, summary, classification, diffUrl);
            break;
          case 'slack':
            await sendSlackNotification(channel.config, monitorName, monitorUrl, changedAt, summary, classification, diffUrl);
            break;
          default:
            logger.debug({ service, channelType: channel.type }, 'Unsupported channel type for competitor notification');
        }
        logger.info({ service, channelId: channel.id, channelType: channel.type }, 'Competitor change notification sent');
      } catch (err) {
        logger.error({ service, channelId: channel.id, channelType: channel.type, err }, 'Failed to send competitor change notification');
      }
    }
  } catch (err) {
    // Release the key so BullMQ retries can re-attempt delivery
    await redis.del(idempotencyKey);
    throw err;
  }
}

async function sendEmailNotification(
  rawConfig: unknown,
  monitorName: string,
  monitorUrl: string,
  changedAt: Date,
  summary?: string,
  classification?: string,
  diffUrl?: string
): Promise<void> {
  const config = EmailChannelConfig.parse(rawConfig);

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service, channel: 'email', recipients: config.recipients, summary, classification },
      'ALERT_DRY_RUN — skipping competitor change email'
    );
    return;
  }

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY or EMAIL_FROM not set');
  }

  const html = await render(
    React.createElement(ContentChangeAlert, { monitorName, monitorUrl, changedAt, summary, classification, diffUrl })
  );

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: config.recipients,
    subject: `Competitor change detected on '${monitorName}'`,
    html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}

async function sendSlackNotification(
  rawConfig: unknown,
  monitorName: string,
  monitorUrl: string,
  changedAt: Date,
  summary?: string,
  classification?: string,
  diffUrl?: string
): Promise<void> {
  const config = SlackChannelConfig.parse(rawConfig);

  const slackFields: Array<{ title: string; value: string; short: boolean }> = [
    { title: 'URL', value: monitorUrl, short: false },
    { title: 'Detected at', value: changedAt.toUTCString(), short: true },
  ];
  if (classification) {
    slackFields.unshift({ title: 'Classification', value: classification, short: true });
  }
  if (summary) {
    slackFields.unshift({ title: 'Summary', value: summary, short: false });
  }

  const slackPayload = {
    attachments: [
      {
        color: '#2563eb',
        title: `Competitor Changed: ${monitorName}`,
        title_link: diffUrl,
        text: summary,
        fields: slackFields,
        footer: 'Beaconmon',
        ts: Math.floor(changedAt.getTime() / 1000),
      },
    ],
  };

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service, channel: 'slack', webhookUrl: config.webhookUrl, slackPayload },
      'ALERT_DRY_RUN — skipping competitor change Slack notification'
    );
    return;
  }

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Slack webhook returned ${response.status}: ${body}`);
  }
}

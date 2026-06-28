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

function deriveEventSummary(type: string, payload: Record<string, unknown>): string | undefined {
  switch (type) {
    case 'out_of_stock': return `Out of stock: ${payload.productHandle ?? 'product'}`;
    case 'back_in_stock': return `Back in stock: ${payload.productHandle ?? 'product'}`;
    case 'price_changed': return `Price: $${payload.oldPrice} → $${payload.newPrice}`;
    case 'sale_started': return `Sale: $${payload.currentPrice} (was $${payload.compareAtPrice})`;
    case 'sale_ended': return `Sale ended (was $${payload.wasCompareAtPrice})`;
    case 'product_added': return `New product: ${payload.title}`;
    case 'product_removed': return `Product removed: ${payload.title}`;
    default: return (payload.diffSummary as string | undefined) ?? undefined;
  }
}

function deriveNotifySubject(type: string, monitorName: string): string {
  switch (type) {
    case 'out_of_stock': return `Stockout alert: ${monitorName}`;
    case 'back_in_stock': return `Back in stock: ${monitorName}`;
    case 'sale_started': return `Sale started: ${monitorName}`;
    default: return `Competitor change detected on '${monitorName}'`;
  }
}

export async function processCompetitorNotifyJob(data: CompetitorNotifyJob, redis: Redis): Promise<void> {
  const { competitorEventId, teamId: _teamId, competitorId } = data;

  // 1. Load event with competitor name
  const event = await prisma.competitorEvent.findUnique({
    where: { id: competitorEventId },
    include: { competitor: true },
  });
  if (!event) {
    logger.warn({ service, competitorEventId }, 'CompetitorEvent not found');
    return;
  }

  // 2. Load linked notification channels
  const channelLinks = await prisma.competitorNotificationChannel.findMany({
    where: { competitorId },
    include: { channel: true },
  });

  // 3. No channels configured
  if (channelLinks.length === 0) {
    logger.info({ service, competitorId }, 'No notification channels configured');
    return;
  }

  // 4. Build competitor detail URL
  const diffUrl = env.APP_URL ? `${env.APP_URL}/wire/competitors/${competitorId}` : undefined;

  // 5. Extract payload fields
  const payload = event.payload as Record<string, unknown>;

  const monitorName = event.competitor.name;
  const monitorUrl = (payload.pageUrl as string | undefined) ?? '';
  const changedAt = event.detectedAt;
  const summary = deriveEventSummary(event.type, payload);
  const classification = event.type;
  const subject = deriveNotifySubject(event.type, monitorName);

  let failureCount = 0;
  for (const link of channelLinks) {
    const channel = link.channel;

    // Per-channel idempotency: BullMQ retries after a partial failure re-send
    // only to the channels that failed, never double-sending the rest.
    const idempotencyKey = `competitor:notify:sent:${competitorEventId}:${channel.id}`;
    const claimed = await redis.set(idempotencyKey, '1', 'EX', 300, 'NX');
    if (!claimed) {
      logger.info({ service, competitorEventId, channelId: channel.id }, 'Notification already sent to channel, skipping');
      continue;
    }

    try {
      switch (channel.type) {
        case 'email':
          await sendEmailNotification(channel.config, monitorName, monitorUrl, changedAt, summary, classification, diffUrl, subject);
          break;
        case 'slack':
          await sendSlackNotification(channel.config, monitorName, monitorUrl, changedAt, summary, classification, diffUrl, subject);
          break;
        default:
          logger.debug({ service, channelType: channel.type }, 'Unsupported channel type for competitor notification');
      }
      logger.info({ service, channelId: channel.id, channelType: channel.type }, 'Competitor change notification sent');
    } catch (err) {
      logger.error({ service, channelId: channel.id, channelType: channel.type, err }, 'Failed to send competitor change notification');
      failureCount++;
      // Release the channel key so the retry can re-attempt this channel
      await redis.del(idempotencyKey).catch(() => null);
    }
  }

  if (failureCount > 0) {
    throw new Error(`Competitor notification failed for ${failureCount} channel(s), triggering retry`);
  }
}

async function sendEmailNotification(
  rawConfig: unknown,
  monitorName: string,
  monitorUrl: string,
  changedAt: Date,
  summary?: string,
  classification?: string,
  diffUrl?: string,
  subject?: string
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
    subject: subject ?? `Competitor change detected on '${monitorName}'`,
    html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }
}

function escapeSlackMrkdwn(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

type SlackBlock =
  | { type: 'section'; text: { type: 'mrkdwn' | 'plain_text'; text: string } }
  | { type: 'context'; elements: Array<{ type: 'mrkdwn'; text: string }> }
  | { type: 'actions'; elements: Array<{ type: 'button'; text: { type: 'plain_text'; text: string }; url: string }> };

async function sendSlackNotification(
  rawConfig: unknown,
  monitorName: string,
  monitorUrl: string,
  changedAt: Date,
  summary?: string,
  classification?: string,
  diffUrl?: string,
  _subject?: string
): Promise<void> {
  const config = SlackChannelConfig.parse(rawConfig);

  const hostname = new URL(monitorUrl).hostname;
  const time = changedAt.toUTCString();

  const blocks: SlackBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${escapeSlackMrkdwn(monitorName)}* — ${summary ?? 'Competitor change detected'}`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `<${escapeSlackMrkdwn(monitorUrl)}|${escapeSlackMrkdwn(hostname)}> · ${time}`,
        },
      ],
    },
  ];

  if (diffUrl) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Review change' },
          url: diffUrl,
        },
      ],
    });
  }

  const slackPayload = { blocks };

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

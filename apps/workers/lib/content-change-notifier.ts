import * as React from 'react';
import { z } from 'zod';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { alertChannelRepository } from '@beaconmon/db';
import { ContentChangeAlert } from '../emails/content-change-alert.js';
import { logger } from './logger.js';
import { env } from './env.js';

const EmailChannelConfig = z.object({
  recipients: z.array(z.string().email()),
});

const SlackChannelConfig = z.object({
  webhookUrl: z.string().url(),
});

const WebhookChannelConfig = z.object({
  url: z.string().url(),
  secret: z.string().optional(),
});

const service = 'content-worker';

export async function notifyContentChange(
  teamId: string,
  monitorName: string,
  monitorUrl: string,
  monitorId: string,
  changedAt: Date,
  summary?: string,
  classification?: string,
  appUrl?: string
): Promise<void> {
  const channels = await alertChannelRepository.findActiveByTeamId(teamId);

  if (channels.length === 0) {
    logger.info({ service, teamId }, 'No active alert channels — nothing to notify');
    return;
  }

  const diffUrl = appUrl ? `${appUrl}/monitors/${monitorId}?tab=snapshots` : undefined;

  for (const channel of channels) {
    try {
      switch (channel.type) {
        case 'email':
          await sendEmailNotification(channel.config, monitorName, monitorUrl, changedAt, summary, classification, diffUrl);
          break;
        case 'slack':
          await sendSlackNotification(channel.config, monitorName, monitorUrl, changedAt, summary, classification, diffUrl);
          break;
        case 'webhook':
          await sendWebhookNotification(channel.config, monitorName, monitorUrl, changedAt, summary, classification, diffUrl);
          break;
        default:
          logger.debug({ service, channelType: channel.type }, 'Unsupported channel type for content notification, skipping');
      }
      logger.info({ service, channelId: channel.id, channelType: channel.type }, 'Content change notification sent');
    } catch (err) {
      logger.error({ service, channelId: channel.id, channelType: channel.type, err }, 'Failed to send content change notification');
    }
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
      'ALERT_DRY_RUN — skipping content change email'
    );
    return;
  }

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY or EMAIL_FROM not set — cannot send email notification');
  }

  const html = await render(
    React.createElement(ContentChangeAlert, { monitorName, monitorUrl, changedAt, summary, classification, diffUrl })
  );

  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: config.recipients,
    subject: `Content change detected on '${monitorName}'`,
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
        title: `Content Changed: ${monitorName}`,
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
      'ALERT_DRY_RUN — skipping content change Slack notification'
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

async function sendWebhookNotification(
  rawConfig: unknown,
  monitorName: string,
  monitorUrl: string,
  changedAt: Date,
  summary?: string,
  classification?: string,
  diffUrl?: string
): Promise<void> {
  const config = WebhookChannelConfig.parse(rawConfig);

  const webhookPayload = {
    event: 'monitor.content_changed',
    monitorName,
    url: monitorUrl,
    timestamp: changedAt.toISOString(),
    ...(summary ? { summary } : {}),
    ...(classification ? { classification } : {}),
    ...(diffUrl ? { diffUrl } : {}),
  };

  const body = JSON.stringify(webhookPayload);

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service, channel: 'webhook', targetUrl: config.url, webhookPayload },
      'ALERT_DRY_RUN — skipping content change webhook'
    );
    return;
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '');
    throw new Error(`Webhook returned ${response.status}: ${responseBody}`);
  }
}

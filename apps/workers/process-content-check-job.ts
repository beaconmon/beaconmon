import * as React from 'react';
import { z } from 'zod';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import {
  monitorRepository,
  checkResultRepository,
  alertChannelRepository,
  contentSnapshotWorkerRepository,
} from '@beaconmon/db';
import { runContentCheck } from '@beaconmon/checker';
import type { ContentCheckJob } from '@beaconmon/queue';
import { ContentChangeAlert } from './emails/content-change-alert.js';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';

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

const TIMEOUT_MS = 30_000;
const service = 'content-worker';

export async function processContentCheckJob(data: ContentCheckJob): Promise<void> {
  const { monitorId, url, selector, isCompetitor: _isCompetitor = false, instantAlerts: _instantAlerts = false } = data;

  // 1. Load monitor — bail if missing
  const monitor = await monitorRepository.findById(monitorId);
  if (!monitor) {
    logger.warn({ service, monitorId }, 'Monitor not found, skipping content check');
    return;
  }

  // 2. Fetch and parse
  const result = await runContentCheck({ monitorId, url, selector, timeoutMs: TIMEOUT_MS });

  // 3. Persist check result — abort if this fails (no audit trail)
  try {
    await checkResultRepository.create({
      monitorId,
      checkedAt: result.checkedAt,
      success: result.success,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
      errorType: result.errorType,
      errorMessage: result.errorMessage,
      type: 'content',
    });
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to persist check result, aborting');
    return;
  }

  // 4. Fetch failed — log and done (no content to compare)
  if (!result.success || result.content === null) {
    logger.warn({ service, monitorId, errorType: result.errorType }, 'Content check failed, skipping diff');
    return;
  }

  const { content, checkedAt } = result;

  // 5. First run — initialize snapshot (also write the first history row)
  if (monitor.contentSnapshot === null) {
    try {
      await contentSnapshotWorkerRepository.recordChange(monitorId, monitor.teamId, content, checkedAt);
      logger.info({ service, monitorId }, 'Content snapshot initialized');
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Failed to initialize content snapshot');
    }
    return;
  }

  // 6. No change
  if (content === monitor.contentSnapshot) {
    logger.info({ service, monitorId }, 'Content unchanged');
    return;
  }

  // 7. Content changed
  logger.info({ service, monitorId }, 'Content change detected');

  // 7a. Persist new snapshot (history row + hot column) — abort before notifying
  // so retries see no diff and don't double-notify.
  try {
    await contentSnapshotWorkerRepository.recordChange(monitorId, monitor.teamId, content, checkedAt);
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to update content snapshot, skipping notification');
    return;
  }

  // 7b. Notify all active channels.
  // Competitor monitors skip per-change notifications unless instant alerts is enabled —
  // changes are batched into the daily digest instead. Use live DB values (not job payload)
  // so a mid-flight toggle is respected.
  if (monitor.isCompetitor && !monitor.instantAlerts) {
    logger.info({ service, monitorId }, 'Competitor change recorded — skipping per-change alert (digest mode)');
    return;
  }

  await notifyContentChange(monitor.teamId, monitor.name, url, checkedAt);
}

async function notifyContentChange(
  teamId: string,
  monitorName: string,
  monitorUrl: string,
  changedAt: Date
): Promise<void> {
  const channels = await alertChannelRepository.findActiveByTeamId(teamId);

  if (channels.length === 0) {
    logger.info({ service, teamId }, 'No active alert channels — nothing to notify');
    return;
  }

  for (const channel of channels) {
    try {
      switch (channel.type) {
        case 'email':
          await sendEmailNotification(channel.config, monitorName, monitorUrl, changedAt);
          break;
        case 'slack':
          await sendSlackNotification(channel.config, monitorName, monitorUrl, changedAt);
          break;
        case 'webhook':
          await sendWebhookNotification(channel.config, monitorName, monitorUrl, changedAt);
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
  changedAt: Date
): Promise<void> {
  const config = EmailChannelConfig.parse(rawConfig);

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service, channel: 'email', recipients: config.recipients },
      'ALERT_DRY_RUN — skipping content change email'
    );
    return;
  }

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error('RESEND_API_KEY or EMAIL_FROM not set — cannot send email notification');
  }

  const html = await render(
    React.createElement(ContentChangeAlert, { monitorName, monitorUrl, changedAt })
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
  changedAt: Date
): Promise<void> {
  const config = SlackChannelConfig.parse(rawConfig);

  const slackPayload = {
    attachments: [
      {
        color: '#2563eb',
        title: `Content Changed: ${monitorName}`,
        fields: [
          { title: 'URL', value: monitorUrl, short: false },
          { title: 'Detected at', value: changedAt.toUTCString(), short: true },
        ],
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
  changedAt: Date
): Promise<void> {
  const config = WebhookChannelConfig.parse(rawConfig);

  const webhookPayload = {
    event: 'monitor.content_changed',
    monitorName,
    url: monitorUrl,
    timestamp: changedAt.toISOString(),
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

import { createHmac } from 'node:crypto';
import type { AlertPayload, ChannelSender } from './types.js';
import { webhookChannelConfigSchema } from '@beaconmon/types';
import { logger } from '../logger.js';
import { env } from '../env.js';

async function postWebhook(url: string, body: string, secret?: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (secret) {
    const signature = createHmac('sha256', secret).update(body).digest('hex');
    headers['X-Beaconmon-Signature'] = `sha256=${signature}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseBody = await response.text().catch(() => '');
      throw new Error(`Webhook returned ${response.status}: ${responseBody}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export const webhookSender: ChannelSender = async (rawConfig, payload) => {
  const config = webhookChannelConfigSchema.parse(rawConfig);
  const { monitor, incident, type, durationMs } = payload;

  const webhookPayload = {
    event: type === 'down' ? 'monitor.down' : 'monitor.up',
    monitorId: monitor.id,
    monitorName: monitor.name,
    url: monitor.url,
    timestamp: new Date().toISOString(),
    incidentId: incident.id,
    ...(durationMs !== undefined ? { durationMs } : {}),
  };

  const body = JSON.stringify(webhookPayload);

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service: 'alert-worker', channel: 'webhook', targetUrl: config.url, webhookPayload },
      'ALERT_DRY_RUN — skipping webhook send'
    );
    return;
  }

  try {
    await postWebhook(config.url, body, config.secret);
  } catch (firstErr) {
    logger.warn(
      { service: 'alert-worker', channel: 'webhook', targetUrl: config.url, err: firstErr },
      'Webhook send failed, retrying once'
    );
    await postWebhook(config.url, body, config.secret);
  }

  logger.info(
    { service: 'alert-worker', channel: 'webhook', targetUrl: config.url, monitorId: monitor.id },
    'Webhook alert sent'
  );
};

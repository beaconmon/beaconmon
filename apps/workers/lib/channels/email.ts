import * as React from 'react';
import { z } from 'zod';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { DowntimeAlert } from '../../emails/downtime-alert.js';

const EmailChannelConfig = z.object({
  recipients: z.array(z.string().email()),
});
import { RecoveryAlert } from '../../emails/recovery-alert.js';
import type { AlertPayload, ChannelSender } from './types.js';
import { logger } from '../logger.js';
import { env } from '../env.js';

export const emailSender: ChannelSender = async (rawConfig, payload) => {
  const config = EmailChannelConfig.parse(rawConfig);
  const { monitor, incident, type, durationMs } = payload;

  const subject =
    type === 'down'
      ? `Monitor '${monitor.name}' is down`
      : `Monitor '${monitor.name}' has recovered`;

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service: 'alert-worker', channel: 'email', recipients: config.recipients, subject },
      'ALERT_DRY_RUN — skipping email send'
    );
    return;
  }

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn(
      { service: 'alert-worker', channel: 'email' },
      'RESEND_API_KEY or EMAIL_FROM not set — skipping email send'
    );
    return;
  }

  const html =
    type === 'down'
      ? await render(
          React.createElement(DowntimeAlert, {
            monitorName: monitor.name,
            monitorUrl: monitor.url,
            incidentStartedAt: incident.startedAt,
            incidentId: incident.id,
          })
        )
      : await render(
          React.createElement(RecoveryAlert, {
            monitorName: monitor.name,
            monitorUrl: monitor.url,
            incidentId: incident.id,
            durationMs: durationMs ?? 0,
          })
        );

  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: config.recipients,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  logger.info(
    { service: 'alert-worker', channel: 'email', recipients: config.recipients, subject },
    'Email alert sent'
  );
};

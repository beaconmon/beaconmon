import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { DowntimeAlert } from '../../emails/downtime-alert.js';
import { emailChannelConfigSchema } from '@beaconmon/types';
import { RecoveryAlert } from '../../emails/recovery-alert.js';
import type { ChannelSender } from './types.js';
import { logger } from '../logger.js';
import { env } from '../env.js';

export const emailSender: ChannelSender = async (rawConfig, payload) => {
  const config = emailChannelConfigSchema.parse(rawConfig);
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
    throw new Error('RESEND_API_KEY or EMAIL_FROM not set — cannot send email alert');
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

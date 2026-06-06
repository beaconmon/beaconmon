import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import type { Redis } from 'ioredis';
import { prisma } from '@beaconmon/db';
import type { LifecycleEmailJob } from '@beaconmon/queue';
import { signUnsubscribeToken } from '@beaconmon/queue';
import { lifecycleEmailRegistry } from './lib/lifecycle/registry.js';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';

const service = 'lifecycle-email-worker';

export async function processLifecycleEmailJob(data: LifecycleEmailJob, redis?: Redis): Promise<void> {
  const { teamId, emailType, payload, dedupKey, ownerEmail } = data;

  const config = lifecycleEmailRegistry.get(emailType);
  if (!config) {
    logger.warn({ service, teamId, emailType }, 'Unknown lifecycle email type, skipping');
    return;
  }

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    logger.warn({ service, teamId, emailType }, 'Email not configured, skipping');
    return;
  }

  // DB dedup (defense layer 2): attempt to create the send record first.
  // On unique conflict, only skip if a prior attempt succeeded or is still in-flight.
  // A failed attempt is retryable.
  try {
    await prisma.lifecycleEmailSend.create({
      data: { teamId, emailType, dedupKey, status: 'pending' },
    });
  } catch (err: unknown) {
    if (!isPrismaUniqueViolation(err)) throw err;
    const existing = await prisma.lifecycleEmailSend.findUnique({ where: { dedupKey } });
    if (existing?.status !== 'failed') {
      logger.info({ service, teamId, emailType, dedupKey }, 'Lifecycle email already sent or in-flight, skipping (DB dedup)');
      return;
    }
    // Previous attempt failed — reset so this retry can proceed
    await prisma.lifecycleEmailSend.update({
      where: { dedupKey },
      data: { status: 'pending', error: null },
    });
  }

  const appUrl = env.APP_URL ?? process.env['BETTER_AUTH_URL'] ?? 'https://beaconmon.com';

  let unsubscribeUrl: string | undefined;
  if (env.LIFECYCLE_EMAIL_SECRET) {
    const token = signUnsubscribeToken(teamId, config.category, env.LIFECYCLE_EMAIL_SECRET);
    unsubscribeUrl = `${appUrl}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
  }

  const templateProps = { ...payload, appUrl, unsubscribeUrl };

  let html: string;
  try {
    html = await render(React.createElement(config.template, templateProps));
  } catch (err) {
    await markFailed(dedupKey, String(err));
    throw err;
  }

  const subject = config.subject(payload);
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: ownerEmail,
    subject,
    html,
  });

  if (error) {
    await markFailed(dedupKey, error.message);
    throw new Error(`Resend error: ${error.message}`);
  }

  await prisma.lifecycleEmailSend.update({
    where: { dedupKey },
    data: { status: 'sent' },
  });

  // Set Redis dedup key so the scheduler skips re-enqueueing (14-day TTL)
  await redis?.set(`lifecycle:dedup:${dedupKey}`, '1', 'EX', 60 * 60 * 24 * 14).catch(() => null);

  logger.info({ service, teamId, emailType, ownerEmail }, 'Lifecycle email sent');
}

async function markFailed(dedupKey: string, error: string): Promise<void> {
  await prisma.lifecycleEmailSend
    .update({ where: { dedupKey }, data: { status: 'failed', error } })
    .catch(() => null);
}

function isPrismaUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  );
}

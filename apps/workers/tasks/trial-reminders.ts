import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { connection } from '../lib/redis.js';
import { env } from '../lib/env.js';
import { TrialReminder } from '../emails/trial-reminder.js';
import type { SchedulerTask } from './types.js';

const TRIAL_REMINDER_REDIS_KEY = 'scheduler:trial_reminder:last_run';

export const trialRemindersTask: SchedulerTask = {
  name: 'trial-reminders',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    const resendApiKey = env.RESEND_API_KEY;
    const emailFrom = process.env['EMAIL_FROM'];
    const appUrl = process.env['BETTER_AUTH_URL'] ?? '';

    if (!resendApiKey || !emailFrom) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const lastRun = await connection.get(TRIAL_REMINDER_REDIS_KEY);
    if (lastRun === todayKey) return;

    try {
      const now = new Date();
      const dayStart = (offsetDays: number): Date => {
        const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offsetDays));
        return d;
      };
      const window7Start = dayStart(7);
      const window7End = dayStart(8);
      const window1Start = dayStart(1);
      const window1End = dayStart(2);

      const teams = await prisma.team.findMany({
        where: {
          plan: 'free',
          trialEndsAt: {
            gte: window1Start,
            lt: window7End,
          },
          subscription: null,
        },
        select: {
          id: true,
          trialEndsAt: true,
          members: {
            where: { role: 'owner' },
            select: { user: { select: { email: true } } },
            take: 1,
          },
        },
      });

      const resend = new Resend(resendApiKey);
      let sent = 0;

      for (const team of teams) {
        if (!team.trialEndsAt) continue;
        const ownerEmail = team.members[0]?.user.email;
        if (!ownerEmail) continue;

        const trialEnds = team.trialEndsAt.getTime();
        let daysLeft: number | null = null;
        let dedupKey: string | null = null;

        if (trialEnds >= window7Start.getTime() && trialEnds < window7End.getTime()) {
          daysLeft = 7;
          dedupKey = `trial:reminder:7d:${team.id}`;
        } else if (trialEnds >= window1Start.getTime() && trialEnds < window1End.getTime()) {
          daysLeft = 1;
          dedupKey = `trial:reminder:1d:${team.id}`;
        }

        if (!daysLeft || !dedupKey) continue;

        const alreadySent = await connection.get(dedupKey);
        if (alreadySent) continue;

        const html = await render(React.createElement(TrialReminder, { daysLeft, appUrl }));
        const { error } = await resend.emails.send({
          from: emailFrom,
          to: ownerEmail,
          subject:
            daysLeft <= 1
              ? 'Your Beaconmon trial ends tomorrow'
              : `${daysLeft} days left in your Beaconmon trial`,
          html,
        });

        if (error) {
          logger.error({ service: 'scheduler', teamId: team.id, err: error }, 'Trial reminder email failed');
          continue;
        }

        await connection.set(dedupKey, '1', 'EX', 60 * 60 * 24 * 10);
        sent++;
      }

      await connection.set(TRIAL_REMINDER_REDIS_KEY, todayKey, 'EX', 60 * 60 * 48);
      if (sent > 0) {
        logger.info({ service: 'scheduler', sent }, 'Trial reminder emails sent');
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Trial reminder email job failed');
      Sentry.captureException(err);
    }
  },
};

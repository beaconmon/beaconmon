import { prisma, Prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { connection, intelligenceDigestQueue } from '../lib/redis.js';
import { digestPrefsSchema } from '@beaconmon/types';
import { getEffectivePlan } from '@beaconmon/billing';
import type { SchedulerTask } from './types.js';

const DAILY_DIGEST_HOUR_UTC = 7;
const DAILY_DIGEST_REDIS_KEY = 'scheduler:intelligence_digest:daily_last_run';
const WEEKLY_DIGEST_REDIS_KEY = 'scheduler:intelligence_digest:weekly_last_run';

function getIsoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export const intelligenceDigestTask: SchedulerTask = {
  name: 'intelligence-digest',
  runIntervalMs: 60 * 1000,
  runOnStartup: false,
  async run(): Promise<void> {
    const now = new Date();
    if (now.getUTCHours() < DAILY_DIGEST_HOUR_UTC) return;

    const todayKey = now.toISOString().slice(0, 10);
    const weekKey = getIsoWeekKey(now);
    const isMonday = now.getUTCDay() === 1;

    const dailyDone = await connection.get(DAILY_DIGEST_REDIS_KEY);
    const weeklyDone = isMonday ? await connection.get(WEEKLY_DIGEST_REDIS_KEY) : weekKey;
    const runDaily = dailyDone !== todayKey;
    const runWeekly = isMonday && weeklyDone !== weekKey;

    if (!runDaily && !runWeekly) return;

    try {
      const teams = await prisma.team.findMany({
        where: { digestPrefs: { not: Prisma.DbNull } },
        select: {
          id: true,
          plan: true,
          trialEndsAt: true,
          digestPrefs: true,
          subscription: { select: { status: true } },
        },
      });

      if (teams.length === 0) {
        if (runDaily) await connection.set(DAILY_DIGEST_REDIS_KEY, todayKey, 'EX', 60 * 60 * 48);
        if (runWeekly) await connection.set(WEEKLY_DIGEST_REDIS_KEY, weekKey, 'EX', 60 * 60 * 24 * 8);
        return;
      }

      const windowEnd = now.toISOString();
      let dailyEnqueued = 0;
      let weeklyEnqueued = 0;

      for (const team of teams) {
        const effectivePlan = getEffectivePlan(team);

        const prefs = digestPrefsSchema.safeParse(team.digestPrefs ?? {});
        if (!prefs.success || !prefs.data.frequency) continue;
        const freq = prefs.data.frequency;

        if (runDaily && effectivePlan !== 'free' && effectivePlan !== 'starter' && (freq === 'daily' || freq === 'both')) {
          const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          const jobId = `digest:daily:${team.id}:${todayKey}`;
          await intelligenceDigestQueue.add(
            jobId,
            { teamId: team.id, frequency: 'daily', windowStart, windowEnd },
            { jobId }
          );
          dailyEnqueued++;
        }

        if (runWeekly && (freq === 'weekly' || freq === 'both')) {
          const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          const jobId = `digest:weekly:${team.id}:${weekKey}`;
          await intelligenceDigestQueue.add(
            jobId,
            { teamId: team.id, frequency: 'weekly', windowStart, windowEnd },
            { jobId }
          );
          weeklyEnqueued++;
        }
      }

      if (runDaily) await connection.set(DAILY_DIGEST_REDIS_KEY, todayKey, 'EX', 60 * 60 * 48);
      if (runWeekly) await connection.set(WEEKLY_DIGEST_REDIS_KEY, weekKey, 'EX', 60 * 60 * 24 * 8);
      logger.info({ service: 'scheduler', dailyEnqueued, weeklyEnqueued }, 'Intelligence digest jobs enqueued');
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Failed to enqueue intelligence digest jobs');
      Sentry.captureException(err);
    }
  },
};

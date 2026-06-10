import { prisma, Prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { connection, intelligenceDigestQueue } from '../lib/redis.js';
import { digestPrefsSchema } from '@beaconmon/types';
import { getEffectivePlan } from '@beaconmon/billing';
import { DAILY_DIGEST_LOCAL_HOUR, getLocalSendState } from './digest-schedule.js';
import type { SchedulerTask } from './types.js';

// Per-team last-run markers. Values are team-local date keys, so a marker
// written for one local day never suppresses the next day's send.
const DAILY_KEY_PREFIX = 'scheduler:intelligence_digest:daily:';
const WEEKLY_KEY_PREFIX = 'scheduler:intelligence_digest:weekly:';
const DAILY_KEY_TTL_SECONDS = 60 * 60 * 48;
const WEEKLY_KEY_TTL_SECONDS = 60 * 60 * 24 * 8;

interface DueDigest {
  teamId: string;
  frequency: 'daily' | 'weekly';
  /** Team-local date key (daily) or ISO week key (weekly) used for dedupe */
  periodKey: string;
  markerKey: string;
}

export const intelligenceDigestTask: SchedulerTask = {
  name: 'intelligence-digest',
  runIntervalMs: 60 * 1000,
  runOnStartup: false,
  async run(): Promise<void> {
    const now = new Date();

    try {
      // All teams are queried on every tick so per-team local hours can be checked below.
      const teams = await prisma.team.findMany({
        where: { digestPrefs: { not: Prisma.DbNull } },
        select: {
          id: true,
          plan: true,
          trialEndsAt: true,
          digestPrefs: true,
          timezone: true,
          subscription: { select: { status: true } },
        },
      });
      if (teams.length === 0) return;

      const candidates: DueDigest[] = [];

      for (const team of teams) {
        const prefs = digestPrefsSchema.safeParse(team.digestPrefs ?? {});
        if (!prefs.success || !prefs.data.frequency) continue;
        const freq = prefs.data.frequency;

        const local = getLocalSendState(now, team.timezone);
        if (local.hour < DAILY_DIGEST_LOCAL_HOUR) continue;

        const effectivePlan = getEffectivePlan(team);

        if (effectivePlan !== 'free' && effectivePlan !== 'starter' && (freq === 'daily' || freq === 'both')) {
          candidates.push({
            teamId: team.id,
            frequency: 'daily',
            periodKey: local.dateKey,
            markerKey: `${DAILY_KEY_PREFIX}${team.id}`,
          });
        }
        if (local.isMonday && (freq === 'weekly' || freq === 'both')) {
          candidates.push({
            teamId: team.id,
            frequency: 'weekly',
            periodKey: local.weekKey,
            markerKey: `${WEEKLY_KEY_PREFIX}${team.id}`,
          });
        }
      }

      if (candidates.length === 0) return;

      const lastRuns = await connection.mget(candidates.map((c) => c.markerKey));

      const windowEnd = now.toISOString();
      let dailyEnqueued = 0;
      let weeklyEnqueued = 0;

      for (const [i, due] of candidates.entries()) {
        if (lastRuns[i] === due.periodKey) continue;

        const windowHours = due.frequency === 'daily' ? 24 : 7 * 24;
        const windowStart = new Date(now.getTime() - windowHours * 60 * 60 * 1000).toISOString();
        const jobId = `digest:${due.frequency}:${due.teamId}:${due.periodKey}`;
        await intelligenceDigestQueue.add(
          jobId,
          { teamId: due.teamId, frequency: due.frequency, windowStart, windowEnd },
          { jobId }
        );

        const ttl = due.frequency === 'daily' ? DAILY_KEY_TTL_SECONDS : WEEKLY_KEY_TTL_SECONDS;
        await connection.set(due.markerKey, due.periodKey, 'EX', ttl);
        if (due.frequency === 'daily') dailyEnqueued++;
        else weeklyEnqueued++;
      }

      if (dailyEnqueued > 0 || weeklyEnqueued > 0) {
        logger.info({ service: 'scheduler', dailyEnqueued, weeklyEnqueued }, 'Intelligence digest jobs enqueued');
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Failed to enqueue intelligence digest jobs');
      Sentry.captureException(err);
    }
  },
};

import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import type { SchedulerTask } from './types.js';

// Competitors are set to discovery_state 'syncing' at the start of a catalog
// sync/probe and reset on success or via markLimited. If the worker process is
// killed mid-sync (deploy, OOM, restart) the row is orphaned in 'syncing'
// forever and never re-scheduled.
//
// The catalog sync Redis lock has a 900s TTL (LOCK_TTL_SECONDS in
// process-catalog-sync-job.ts), so any row still in 'syncing' with an
// updated_at older than that TTL can no longer have an active worker holding
// the lock and is safe to reset. We use 30 minutes as the staleness threshold,
// comfortably beyond the 900s lock TTL, to avoid racing a sync that is simply
// running slowly.
//
// We reset to 'pending' rather than 'failed' because the sync was interrupted,
// not genuinely failed. 'pending' lets the scheduler re-enqueue a fresh
// sync/probe so the interrupted work is retried.
const STALE_THRESHOLD_MS = 30 * 60 * 1000;

export const staleSyncWatchdogTask: SchedulerTask = {
  name: 'stale-sync-watchdog',
  runIntervalMs: 10 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    const cutoff = new Date(Date.now() - STALE_THRESHOLD_MS);
    try {
      const { count } = await prisma.competitor.updateMany({
        where: {
          discoveryState: 'syncing',
          updatedAt: { lt: cutoff },
        },
        data: {
          // The sync was interrupted, not genuinely failed, so clear any stale
          // error rather than leaving a message that surfaces in the discovery
          // API as if this now-pending competitor is broken.
          discoveryState: 'pending',
          discoveryError: null,
        },
      });

      if (count > 0) {
        logger.info({ service: 'scheduler', count }, 'Reset stale syncing competitors');
      } else {
        logger.debug({ service: 'scheduler' }, 'No stale syncing competitors to reset');
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Stale sync watchdog failed');
      Sentry.captureException(err);
    }
  },
};

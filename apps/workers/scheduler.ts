import './lib/env.js'; // validates env at startup
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';
import { Redis } from 'ioredis';
import { prisma } from '@beaconmon/db';
import { createCheckQueue, createContentCheckQueue } from '@beaconmon/queue';

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const checkQueue = createCheckQueue(connection);
const contentQueue = createContentCheckQueue(connection);

let running = true;
let schedulerInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Enqueue check jobs for all active monitors whose next_check_at <= now.
 */
async function scheduleChecks(): Promise<void> {
  const now = new Date();

  try {
    const dueMonitors = await prisma.monitor.findMany({
      where: {
        isActive: true,
        nextCheckAt: { lte: now },
      },
      select: {
        id: true,
        url: true,
        type: true,
        intervalSeconds: true,
        timeoutMs: true,
        config: true,
      },
    });

    for (const monitor of dueMonitors) {
      const nextCheckAt = new Date(now.getTime() + monitor.intervalSeconds * 1000);

      // Update next_check_at first (optimistic lock pattern — prevents double-enqueue)
      await prisma.monitor.update({
        where: { id: monitor.id },
        data: { nextCheckAt },
      });

      if (monitor.type === 'content') {
        await contentQueue.add(
          `content:${monitor.id}`,
          {
            monitorId: monitor.id,
            url: monitor.url,
            intervalSeconds: monitor.intervalSeconds,
            selector: (monitor.config as Record<string, unknown>)['selector'] as string | undefined,
          },
          { jobId: `content:${monitor.id}:${now.getTime()}` }
        );
      } else {
        await checkQueue.add(
          `check:${monitor.id}`,
          {
            monitorId: monitor.id,
            url: monitor.url,
            type: monitor.type as 'http' | 'ssl' | 'domain' | 'tcp' | 'keyword',
            intervalSeconds: monitor.intervalSeconds,
            timeoutMs: monitor.timeoutMs,
          },
          { jobId: `check:${monitor.id}:${now.getTime()}` }
        );
      }
    }

    if (dueMonitors.length > 0) {
      logger.info(
        { service: 'scheduler', count: dueMonitors.length },
        'Enqueued check jobs'
      );
    }
  } catch (err) {
    logger.error({ service: 'scheduler', err }, 'Failed to schedule checks');
  }
}

/**
 * Drop check_results partitions older than 365 days.
 * Runs once per day (scheduler calls this on startup and then daily).
 */
async function purgeOldPartitions(): Promise<void> {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  const year = cutoff.getFullYear();
  const month = String(cutoff.getMonth() + 1).padStart(2, '0');
  const partitionName = `check_results_${year}_${month}`;

  try {
    await prisma.$executeRawUnsafe(
      `DROP TABLE IF EXISTS "${partitionName}"`
    );
    logger.info({ service: 'scheduler', partitionName }, 'Purged old partition');
  } catch (err) {
    logger.error({ service: 'scheduler', partitionName, err }, 'Failed to purge partition');
  }
}

// ─── Main loop ────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  logger.info({ service: 'scheduler' }, 'Scheduler started');

  // Run partition purge once on startup
  await purgeOldPartitions();

  // Poll every 10 seconds — fine-grained enough for 30s monitors
  schedulerInterval = setInterval(() => {
    if (running) {
      void scheduleChecks();
    }
  }, 10_000);

  // Run immediately
  await scheduleChecks();
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, stopping scheduler');
  running = false;

  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  await checkQueue.close();
  await contentQueue.close();
  await prisma.$disconnect();
  await connection.quit();

  logger.info('Scheduler shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

void main();

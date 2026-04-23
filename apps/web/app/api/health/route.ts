import { getRedis } from '@/lib/redis';
import { createCheckQueue, createAlertQueue, createContentCheckQueue } from '@beaconmon/queue';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const redis = getRedis();

  try {
    const checkQueue = createCheckQueue(redis);
    const alertQueue = createAlertQueue(redis);
    const contentQueue = createContentCheckQueue(redis);

    const [checkCounts, alertCounts, contentCounts, schedulerLastRun] = await Promise.all([
      checkQueue.getJobCounts('waiting', 'active', 'delayed'),
      alertQueue.getJobCounts('waiting', 'active', 'delayed'),
      contentQueue.getJobCounts('waiting', 'active', 'delayed'),
      redis.get('scheduler:last_run'),
    ]);

    return Response.json({
      status: 'ok',
      queues: {
        check: (checkCounts.waiting ?? 0) + (checkCounts.active ?? 0) + (checkCounts.delayed ?? 0),
        alert: (alertCounts.waiting ?? 0) + (alertCounts.active ?? 0) + (alertCounts.delayed ?? 0),
        content: (contentCounts.waiting ?? 0) + (contentCounts.active ?? 0) + (contentCounts.delayed ?? 0),
      },
      schedulerLastRun: schedulerLastRun ?? null,
    });
  } catch (err) {
    logger.error({ service: 'web', err }, 'Health check failed');
    return Response.json({ status: 'degraded', error: 'Failed to read queue state' }, { status: 503 });
  }
}

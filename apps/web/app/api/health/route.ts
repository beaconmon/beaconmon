import { getRedis } from '@/lib/redis';
import { createCheckQueue, createAlertQueue, createContentCheckQueue } from '@beaconmon/queue';
import { prisma } from '@beaconmon/db';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// A heartbeat is considered stale if it's older than this threshold.
// Workers write every 30s, so 90s gives 3 missed beats before we flag it.
const HEARTBEAT_STALE_MS = 90_000;

type WorkerName = 'check' | 'alert' | 'content' | 'scheduler';

interface WorkerStatus {
  alive: boolean;
  lastSeen: string | null;
  staleMs: number | null;
}

function parseHeartbeat(raw: string | null): WorkerStatus {
  if (!raw) return { alive: false, lastSeen: null, staleMs: null };
  const lastSeen = new Date(raw);
  const staleMs = Date.now() - lastSeen.getTime();
  return { alive: staleMs < HEARTBEAT_STALE_MS, lastSeen: raw, staleMs };
}

export async function GET() {
  const redis = getRedis();
  const errors: string[] = [];

  // ── Queue depths ─────────────────────────────────────────────────────────────
  let queues: Record<string, number> | null = null;
  let schedulerLastRun: string | null = null;
  let workers: Record<WorkerName, WorkerStatus> | null = null;

  try {
    const checkQueue = createCheckQueue(redis);
    const alertQueue = createAlertQueue(redis);
    const contentQueue = createContentCheckQueue(redis);

    const [
      checkCounts,
      alertCounts,
      contentCounts,
      schedulerRaw,
      checkHeartbeat,
      alertHeartbeat,
      contentHeartbeat,
      schedulerHeartbeat,
    ] = await Promise.all([
      checkQueue.getJobCounts('waiting', 'active', 'delayed'),
      alertQueue.getJobCounts('waiting', 'active', 'delayed'),
      contentQueue.getJobCounts('waiting', 'active', 'delayed'),
      redis.get('scheduler:last_run'),
      redis.get('worker:heartbeat:check'),
      redis.get('worker:heartbeat:alert'),
      redis.get('worker:heartbeat:content'),
      redis.get('worker:heartbeat:scheduler'),
    ]);

    queues = {
      check: (checkCounts.waiting ?? 0) + (checkCounts.active ?? 0) + (checkCounts.delayed ?? 0),
      alert: (alertCounts.waiting ?? 0) + (alertCounts.active ?? 0) + (alertCounts.delayed ?? 0),
      content: (contentCounts.waiting ?? 0) + (contentCounts.active ?? 0) + (contentCounts.delayed ?? 0),
    };
    schedulerLastRun = schedulerRaw;
    workers = {
      check: parseHeartbeat(checkHeartbeat),
      alert: parseHeartbeat(alertHeartbeat),
      content: parseHeartbeat(contentHeartbeat),
      scheduler: parseHeartbeat(schedulerHeartbeat),
    };
  } catch (err) {
    logger.error({ service: 'web', err }, 'Health check: Redis/queue read failed');
    errors.push('redis_unavailable');
  }

  // ── Database connectivity ─────────────────────────────────────────────────────
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    logger.error({ service: 'web', err }, 'Health check: DB ping failed');
    errors.push('db_unavailable');
  }

  const isHealthy = errors.length === 0;

  const body = {
    status: isHealthy ? 'ok' : 'degraded',
    ...(errors.length > 0 && { errors }),
    db: dbOk ? 'ok' : 'error',
    queues: queues ?? 'unavailable',
    schedulerLastRun: schedulerLastRun ?? null,
    workers: workers ?? 'unavailable',
  };

  return Response.json(body, { status: isHealthy ? 200 : 503 });
}

import { Worker } from 'bullmq';
import type { Processor } from 'bullmq';
import type { Redis } from 'ioredis';

const HEARTBEAT_INTERVAL_MS = 30_000;
const DEFAULT_DRAIN_TIMEOUT_MS = 10_000;

interface SimpleLogger {
  info: (obj: Record<string, unknown>, msg: string) => void;
  warn: (obj: Record<string, unknown>, msg: string) => void;
  error: (obj: Record<string, unknown>, msg: string) => void;
}

export interface ManagedWorkerOptions<T> {
  queueName: string;
  workerName: string;
  connection: Redis;
  concurrency: number;
  processor: Processor<T>;
  logger: SimpleLogger;
  onShutdown?: () => Promise<void>;
  drainTimeoutMs?: number;
  lockDuration?: number;
  maxStalledCount?: number;
}

export function createManagedWorker<T>(opts: ManagedWorkerOptions<T>): { worker: Worker<T> } {
  const {
    queueName,
    workerName,
    connection,
    concurrency,
    processor,
    logger,
    onShutdown,
    drainTimeoutMs = DEFAULT_DRAIN_TIMEOUT_MS,
    lockDuration,
    maxStalledCount,
  } = opts;

  const heartbeatKey = `worker:heartbeat:${workerName}`;
  const service = `${workerName}-worker`;

  const worker = new Worker<T>(queueName, processor, {
    connection,
    concurrency,
    ...(lockDuration !== undefined && { lockDuration }),
    ...(maxStalledCount !== undefined && { maxStalledCount }),
  });

  // Write immediate heartbeat on startup
  connection.set(heartbeatKey, new Date().toISOString(), 'EX', 120).catch(() => {});

  // Refresh heartbeat every 30s
  const heartbeatInterval = setInterval(() => {
    connection.set(heartbeatKey, new Date().toISOString(), 'EX', 120).catch((err: unknown) => {
      logger.warn({ service, err }, 'Failed to write heartbeat');
    });
  }, HEARTBEAT_INTERVAL_MS);

  let shutting = false;

  const shutdown = async (signal: string) => {
    if (shutting) return;
    shutting = true;

    logger.info({ signal }, `Received shutdown signal, draining ${service}`);

    clearInterval(heartbeatInterval);
    await worker.pause();

    let forcedShutdown = false;

    const drainTimeout = setTimeout(() => {
      logger.warn({ service }, 'Drain timeout reached, forcing shutdown');
      forcedShutdown = true;
      void forceShutdown();
    }, drainTimeoutMs);

    await worker.close();
    clearTimeout(drainTimeout);

    if (onShutdown && !forcedShutdown) {
      try {
        await onShutdown();
      } catch (err) {
        logger.error({ service, err }, 'onShutdown error');
      }
    }

    logger.info({ service }, `${service} shutdown complete`);
    process.exit(0);
  };

  const forceShutdown = async () => {
    if (onShutdown) {
      try {
        await onShutdown();
      } catch {
        // ignore errors during force shutdown
      }
    }
    process.exit(1);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  return { worker };
}

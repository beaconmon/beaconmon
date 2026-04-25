import * as Sentry from '@sentry/node';
import { env } from './env.js';

let initialized = false;

/**
 * Initialize Sentry for a worker process.
 * Call this once at the very top of each worker entry point, before any other imports.
 * No-ops when SENTRY_DSN is not set (local dev).
 */
export function initSentry(service: string): void {
  if (initialized || !env.SENTRY_DSN) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    serverName: service,
    // Low sample rate for workers — we care about errors, not traces
    tracesSampleRate: 0.05,
  });

  initialized = true;
}

export { Sentry };

import { logger } from '@/lib/logger';

export async function register() {
  if (process.env['NEXT_RUNTIME'] === 'nodejs') {
    const { init } = await import('@sentry/nextjs');
    init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.05,
      enabled: !!process.env.SENTRY_DSN,
    });

    try {
      const { seedCustomDomains } = await import('./lib/seed-custom-domains');
      await seedCustomDomains();
    } catch (err) {
      logger.error({ service: 'instrumentation', err }, 'Failed to seed custom domains');
    }
  }

  if (process.env['NEXT_RUNTIME'] === 'edge') {
    const { init } = await import('@sentry/nextjs');
    init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.05,
      enabled: !!process.env.SENTRY_DSN,
    });
  }
}

export async function onRequestError(
  err: Error & { digest?: string },
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routeType: string; routePath: string; revalidateReason: string | undefined }
) {
  const { captureRequestError } = await import('@sentry/nextjs');
  captureRequestError(err, request, context);
}

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Low sample rate — capture all errors, few traces
  tracesSampleRate: 0.05,
  // Do not emit any output if DSN is not set (local dev)
  enabled: !!process.env.SENTRY_DSN,
});

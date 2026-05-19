import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.05,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (key) {
  posthog.init(key, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-01-30',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  });
} else {
  console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set — analytics disabled');
}

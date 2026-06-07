import * as Sentry from '@sentry/nextjs';
import posthog from 'posthog-js';

// Gate Sentry to authenticated app routes where error tracking provides the most value.
// Marketing pages are high-traffic and error-free by nature; initializing Sentry there
// adds ~80KB parse cost and INP risk for no meaningful signal.
const APP_ROUTE_PREFIXES = [
  '/today', '/monitors', '/incidents', '/alert-channels', '/escalation-policies',
  '/maintenance-windows', '/status-pages', '/reports', '/settings', '/wire',
  '/onboarding', '/invite',
];
const isAppRoute = APP_ROUTE_PREFIXES.some((p) => window.location.pathname.startsWith(p));

if (isAppRoute) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.05,
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (key) {
  const initPostHog = () =>
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

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initPostHog);
  } else {
    setTimeout(initPostHog, 1);
  }
} else {
  console.warn('[PostHog] NEXT_PUBLIC_POSTHOG_KEY is not set — analytics disabled');
}

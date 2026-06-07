import path from 'path';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'launchigniter.com' },
      { protocol: 'https', hostname: 'postyourstartup.co' },
    ],
  },
  experimental: {
    // Inline above-the-fold CSS into the HTML and defer the full stylesheet as
    // non-blocking, eliminating the render-blocking critical request chain.
    optimizeCss: true,
  },
  // Expose FREEMIUS_SANDBOX to client components so the checkout overlay
  // can switch between sandbox and production without a separate NEXT_PUBLIC_ var.
  env: {
    NEXT_PUBLIC_FREEMIUS_SANDBOX: process.env.FREEMIUS_SANDBOX ?? 'false',
  },
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: '/pricing-change-alerts',
        destination: '/competitor-price-tracking',
        permanent: true,
      },
      {
        source: '/ecommerce-website-monitoring',
        destination: '/ecommerce-competitor-intelligence',
        permanent: true,
      },
      {
        source: '/for/ecommerce',
        destination: '/ecommerce-competitor-intelligence',
        permanent: true,
      },
      {
        source: '/for/solo-founders',
        destination: '/pricing',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/ingest/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js inlines bootstrap scripts; Freemius checkout overlay uses inline handlers
              "script-src 'self' 'unsafe-inline' https://checkout.freemius.com",
              // Tailwind + shadcn inject styles at runtime
              "style-src 'self' 'unsafe-inline'",
              // next/font/google serves fonts from /_next/static at build time
              "font-src 'self'",
              // OG images, favicons, user-provided URLs may be any HTTPS origin
              "img-src 'self' data: https:",
              // Sentry client SDK reports to ingest.sentry.io; PostHog is self-proxied
              "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
              // Freemius checkout is loaded in an iframe
              "frame-src https://checkout.freemius.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
      // Long-term cache for public static assets (logo, OG image, fonts)
      {
        source: '/:path*\\.(svg|png|ico|webp|jpg|jpeg|woff2|woff|ttf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
    ];
  },
  // Must point to monorepo root so Next.js traces shared packages (packages/db, etc.)
  // into the standalone output rather than trying to bundle them from app-relative paths.
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  serverExternalPackages: ['bullmq', 'ioredis', '@prisma/client', 'pg', 'pg-connection-string', 'pgpass', 'split2', 'string_decoder', 'buffer', 'redis-parser', 'redis-errors', '@anthropic-ai/sdk', 'openai'],
  transpilePackages: [
    '@beaconmon/db',
    '@beaconmon/queue',
    '@beaconmon/types',
  ],
  // Webpack is used explicitly (next dev --webpack / next build --webpack) because
  // Turbopack does not yet support extensionAlias. The Prisma v7 prisma-client
  // generator emits TypeScript source files that import sibling files with .js
  // extensions (ESM convention), and only webpack's extensionAlias can remap those
  // to .ts at resolve time. Remove this block and drop --webpack once Turbopack
  // adds extensionAlias support or @beaconmon/db is pre-compiled to JavaScript.
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress source map upload when SENTRY_AUTH_TOKEN is not set (local dev / CI without secrets)
  silent: !process.env.SENTRY_AUTH_TOKEN,
  // Only upload source maps in production builds with a valid auth token
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Disable the Sentry webpack plugin telemetry
  telemetry: false,
  // Do not auto-instrument routes — we rely on manual Sentry.captureException()
  webpack: {
    autoInstrumentServerFunctions: false,
    autoInstrumentMiddleware: false,
  },
});

import path from 'path';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
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
        ],
      },
    ];
  },
  // Must point to monorepo root so Next.js traces shared packages (packages/db, etc.)
  // into the standalone output rather than trying to bundle them from app-relative paths.
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  serverExternalPackages: ['ioredis', '@prisma/client', 'pg', 'pg-connection-string', 'pgpass', 'split2', 'string_decoder', 'buffer', 'redis-parser', 'redis-errors'],
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
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,
});

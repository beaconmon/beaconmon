import pino from 'pino';

// Next.js bundles this via webpack, so pino-pretty worker_threads transport
// cannot be used. Plain JSON output is correct for server-side API routes.
export const logger = pino({
  name: 'web',
  level: process.env['LOG_LEVEL'] ?? 'info',
});

import { PrismaClient } from '../generated/prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // Allow a single PrismaClient instance to be reused across hot-reloads in dev
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // Workers use DATABASE_URL_POOLED (PgBouncer) when available; web app falls back to DATABASE_URL
  const connectionString = process.env['DATABASE_URL_POOLED'] ?? process.env['DATABASE_URL'];
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}

export { PrismaClient } from '../generated/prisma/client/client';
export { Prisma } from '../generated/prisma/client/client';
export * from './repositories/index';

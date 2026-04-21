import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Used by migrate/studio CLI commands. Not required for `prisma generate`.
    // Must be set in the environment before running migrations.
    url: process.env['DATABASE_URL'],
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
});

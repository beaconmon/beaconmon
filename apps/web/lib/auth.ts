import { betterAuth } from 'better-auth';

// Stub: Prisma adapter will be wired in when packages/db is fully integrated.
// For now, auth is configured without a database adapter.
// See plan decision: "Better Auth — Stubbed only — Prisma adapter deferred to later session"

export const auth = betterAuth({
  secret: process.env['BETTER_AUTH_SECRET'] ?? 'dev-secret-change-me',
  baseURL: process.env['BETTER_AUTH_URL'] ?? 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
  },
  // TODO: add database adapter
  // database: prismaAdapter(prisma, { provider: 'postgresql' }),
  // TODO: add magic link
  // plugins: [magicLink({ ... })],
});

export type Session = typeof auth.$Infer.Session;

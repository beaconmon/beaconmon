import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink, customSession } from 'better-auth/plugins';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { Resend } from 'resend';
import { z } from 'zod';
import { prisma } from '@beaconmon/db';
import type { PlanTier } from '@beaconmon/types';
import { nextCookies } from "better-auth/next-js";
import { logger } from '@/lib/logger';
import { isPasswordStrongEnough } from '@/lib/validations/password';

const envSchema = z.object({
  RESEND_API_KEY: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  googleClientId: z.string().min(1).optional(),
  googleClientSecret: z.string().min(1).optional(),
  githubClientId: z.string().min(1).optional(),
  githubClientSecret: z.string().min(1).optional(),
});

const env = envSchema.parse({
  RESEND_API_KEY: process.env['RESEND_API_KEY'],
  NODE_ENV: process.env['NODE_ENV'],
  googleClientId: process.env['GOOGLE_CLIENT_ID'],
  googleClientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  githubClientId: process.env['GITHUB_CLIENT_ID'],
  githubClientSecret: process.env['GITHUB_CLIENT_SECRET'],
});

if (!env.RESEND_API_KEY && env.NODE_ENV === 'production') {
  throw new Error('RESEND_API_KEY is required in production');
}

if (!env.googleClientId && env.NODE_ENV === 'production') {
  throw new Error('GOOGLE_CLIENT_ID is required in production');
}

if (!env.googleClientSecret && env.NODE_ENV === 'production') {
  throw new Error('GOOGLE_CLIENT_SECRET is required in production');
}

if (!env.githubClientId && env.NODE_ENV === 'production') {
  throw new Error('GITHUB_CLIENT_ID is required in production');
}

if (!env.githubClientSecret && env.NODE_ENV === 'production') {
  throw new Error('GITHUB_CLIENT_SECRET is required in production');
}

const resend = new Resend(env.RESEND_API_KEY ?? 'placeholder-key-for-dev');

const options = {
  secret: process.env['BETTER_AUTH_SECRET'] ?? 'dev-secret-change-me',
  baseURL: process.env['BETTER_AUTH_URL'] ?? 'http://localhost:3000',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      try {
        const result = await resend.emails.send({
          from: process.env['EMAIL_FROM'] ?? 'noreply@beaconmon.com',
          to: user.email,
          subject: 'Reset your Beaconmon password',
          html: `<p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${url}">${url}</a></p>`,
        });
        logger.info({ service: 'web', messageId: result.data?.id }, 'Password reset email sent');
      } catch (err) {
        logger.error({ service: 'web', err }, 'Failed to send password reset email');
      }
    },
  },
  socialProviders: {
    google: {
      clientId: env.googleClientId as string,
      clientSecret: env.googleClientSecret as string,
    },
    github: {
      clientId: env.githubClientId as string,
      clientSecret: env.githubClientSecret as string,
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Enforce password strength on email/password sign-up. Mirrors the
      // client-side check in the sign-up form so direct API hits can't bypass it.
      if (ctx.path !== '/sign-up/email') return;
      const password = (ctx.body as { password?: unknown } | undefined)?.password;
      if (typeof password !== 'string' || !isPasswordStrongEnough(password)) {
        throw new APIError('BAD_REQUEST', {
          message:
            'Password is too weak. Use at least 8 characters with a mix of uppercase, numbers, or symbols.',
        });
      }
    }),
  },
  plugins: [
    magicLink({
      expiresIn: 600, // 10 minutes
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: process.env['EMAIL_FROM'] ?? 'noreply@beaconmon.com',
          to: email,
          subject: 'Sign in to Beaconmon',
          html: `<p>Click the link below to sign in. It expires in 10 minutes.</p><p><a href="${url}">${url}</a></p>`,
        });
      },
    }),
    nextCookies()
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user: { id: string; name: string }) => {
          // Auto-create a personal team + 14-day Pro trial on first signup
          const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          await prisma.$transaction(async (tx) => {
            const team = await tx.team.create({
              data: {
                name: `${user.name}'s Workspace`,
                plan: 'pro',
                trialEndsAt,
              },
            });
            await tx.teamMember.create({
              data: {
                teamId: team.id,
                userId: user.id,
                role: 'owner',
              },
            });
          });
        },
      },
    },
  },
} satisfies Parameters<typeof betterAuth>[0];

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(
      async ({ user, session }) => {
        // Embed the user's most recent team membership into every session.
        // "Most recent membership wins" — sufficient for the solo-founder MVP
        // and ensures an invited user lands on the team they just joined,
        // not the personal team auto-created at signup.
        const membership = await prisma.teamMember.findFirst({
          where: { userId: user.id },
          include: {
            team: {
              select: {
                id: true,
                plan: true,
                trialEndsAt: true,
                subscription: { select: { status: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        // Resolve effective plan — downgrade to free if trial expired with no active subscription.
        let effectivePlan: PlanTier = (membership?.team.plan ?? 'free') as PlanTier;
        if (effectivePlan !== 'free' && membership?.team.trialEndsAt) {
          const subStatus = membership.team.subscription?.status;
          const trialExpired = membership.team.trialEndsAt < new Date();
          const hasActiveSub = subStatus === 'active' || subStatus === 'past_due';
          if (trialExpired && !hasActiveSub) {
            effectivePlan = 'free';
          }
        }

        return {
          session,
          user: {
            ...user,
            teamId: membership?.team.id ?? null,
            plan: effectivePlan,
          },
        };
      },
      options, // required so customSession can infer plugin-added fields
    ),
  ],
});

export type Session = typeof auth.$Infer.Session;

// Augment the session user type so route handlers get full type-safety
// without casting: session.user.teamId, session.user.plan
declare module 'better-auth' {
  interface UserWithFields {
    teamId: string | null;
    plan: PlanTier;
  }
}

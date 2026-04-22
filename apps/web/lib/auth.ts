import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink, customSession } from 'better-auth/plugins';
import { Resend } from 'resend';
import { prisma } from '@beaconmon/db';
import type { PlanTier } from '@beaconmon/types';

const resend = new Resend(process.env['RESEND_API_KEY']);

const options = {
  secret: process.env['BETTER_AUTH_SECRET'] ?? 'dev-secret-change-me',
  baseURL: process.env['BETTER_AUTH_URL'] ?? 'http://localhost:3000',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
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
        // Embed the user's first team into every session response.
        // "First team wins" — sufficient for the solo-founder MVP.
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
          orderBy: { createdAt: 'asc' },
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

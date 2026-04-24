import { EventName, type EventEntity } from '@paddle/paddle-node-sdk';
import { prisma } from '@beaconmon/db';
import { logger } from '@/lib/logger';
import type { PlanTier } from '@beaconmon/types';

type OurSubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

// Map Paddle price IDs to plan tiers
function resolvePlan(priceId: string | null | undefined): PlanTier {
  if (priceId === process.env['PADDLE_PRO_PRICE_ID']) return 'pro';
  if (priceId === process.env['PADDLE_BUSINESS_PRICE_ID']) return 'business';
  return 'free';
}

// Map Paddle subscription status to our SubscriptionStatus enum
function resolveStatus(paddleStatus: string): OurSubscriptionStatus {
  switch (paddleStatus) {
    case 'active':   return 'active';
    case 'past_due': return 'past_due';
    case 'canceled': return 'canceled';
    case 'trialing': return 'trialing';
    default:         return 'incomplete';
  }
}

export async function handlePaddleEvent(event: EventEntity): Promise<void> {
  switch (event.eventType) {
    case EventName.SubscriptionCreated: {
      const sub = event.data;
      const teamId = (sub.customData as Record<string, unknown> | null)?.['teamId'] as string | undefined;
      const paddleCustomerId = sub.customerId;
      const paddleSubscriptionId = sub.id;
      const priceId = sub.items[0]?.price?.id ?? null;
      const plan = resolvePlan(priceId);
      const status = resolveStatus(sub.status);
      const currentPeriodEnd = sub.currentBillingPeriod?.endsAt
        ? new Date(sub.currentBillingPeriod.endsAt)
        : null;

      if (!teamId) {
        logger.warn(
          { service: 'web', eventType: event.eventType, subscriptionId: paddleSubscriptionId },
          'Missing teamId in customData — skipping'
        );
        return;
      }

      await prisma.$transaction(async (tx) => {
        await tx.subscription.upsert({
          where: { teamId },
          create: {
            teamId,
            paddleCustomerId,
            paddleSubscriptionId,
            plan,
            status,
            currentPeriodEnd,
          },
          update: {
            paddleCustomerId,
            paddleSubscriptionId,
            plan,
            status,
            currentPeriodEnd,
          },
        });
        await tx.team.update({
          where: { id: teamId },
          data: { plan },
        });
      });

      logger.info({ service: 'web', teamId, plan, status }, 'Subscription created');
      break;
    }

    case EventName.SubscriptionUpdated: {
      const sub = event.data;
      const paddleCustomerId = sub.customerId;
      const priceId = sub.items[0]?.price?.id ?? null;
      const plan = resolvePlan(priceId);
      const status = resolveStatus(sub.status);
      const currentPeriodEnd = sub.currentBillingPeriod?.endsAt
        ? new Date(sub.currentBillingPeriod.endsAt)
        : null;

      const teamPlan: PlanTier = sub.status === 'canceled' ? 'free' : plan;

      let capturedTeamId: string | undefined;

      await prisma.$transaction(async (tx) => {
        const existing = await tx.subscription.findUnique({
          where: { paddleCustomerId },
          select: { teamId: true },
        });

        if (!existing) {
          logger.warn(
            { service: 'web', paddleCustomerId, eventType: event.eventType },
            'No subscription record found — skipping'
          );
          return;
        }

        capturedTeamId = existing.teamId;

        await tx.subscription.update({
          where: { teamId: existing.teamId },
          data: {
            plan: teamPlan,
            status,
            currentPeriodEnd,
            paddleSubscriptionId: sub.id,
          },
        });
        await tx.team.update({
          where: { id: existing.teamId },
          data: { plan: teamPlan },
        });
      });

      if (capturedTeamId) {
        logger.info({ service: 'web', teamId: capturedTeamId, plan: teamPlan, status }, 'Subscription updated');
      }
      break;
    }

    case EventName.SubscriptionCanceled: {
      const sub = event.data;
      const paddleCustomerId = sub.customerId;

      let capturedTeamId: string | undefined;

      await prisma.$transaction(async (tx) => {
        const existing = await tx.subscription.findUnique({
          where: { paddleCustomerId },
          select: { teamId: true },
        });

        if (!existing) {
          logger.warn(
            { service: 'web', paddleCustomerId, eventType: event.eventType },
            'No subscription record found — skipping'
          );
          return;
        }

        capturedTeamId = existing.teamId;

        await tx.subscription.update({
          where: { teamId: existing.teamId },
          data: { status: 'canceled', plan: 'free' },
        });
        await tx.team.update({
          where: { id: existing.teamId },
          data: { plan: 'free' },
        });
      });

      if (capturedTeamId) {
        logger.info({ service: 'web', teamId: capturedTeamId }, 'Subscription canceled — downgraded to free');
      }
      break;
    }

    default:
      logger.info({ service: 'web', eventType: event.eventType }, 'Unhandled Paddle event — ignored');
  }
}

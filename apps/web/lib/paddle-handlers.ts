import { EventName, type EventEntity } from '@paddle/paddle-node-sdk';
import { alertChannelRepository } from '@beaconmon/db';
import { logger } from '@/lib/logger';
import type { PlanTier } from '@beaconmon/types';
import { planFromPaddlePriceId, billingPeriodFromPaddlePriceId } from '@/lib/paddle';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';

type OurSubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

const resolvePlan = (priceId: string | null | undefined): PlanTier =>
  planFromPaddlePriceId(priceId);

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
      const priceId = sub.items[0]?.price?.id ?? null;

      if (!teamId) {
        logger.warn(
          { service: 'web', eventType: event.eventType, subscriptionId: sub.id },
          'Missing teamId in customData — skipping'
        );
        return;
      }

      await subscriptionRepository.createFromPaddleEvent(teamId, {
        paddleCustomerId: sub.customerId,
        paddleSubscriptionId: sub.id,
        plan: resolvePlan(priceId),
        billingPeriod: billingPeriodFromPaddlePriceId(priceId),
        status: resolveStatus(sub.status),
        currentPeriodEnd: sub.currentBillingPeriod?.endsAt
          ? new Date(sub.currentBillingPeriod.endsAt)
          : null,
      });

      logger.info({ service: 'web', teamId, plan: resolvePlan(priceId), status: resolveStatus(sub.status) }, 'Subscription created');
      break;
    }

    case EventName.SubscriptionUpdated: {
      const sub = event.data;
      const priceId = sub.items[0]?.price?.id ?? null;
      const plan = resolvePlan(priceId);
      const status = resolveStatus(sub.status);
      const teamPlan: PlanTier = sub.status === 'canceled' ? 'free' : plan;

      const result = await subscriptionRepository.updateFromPaddleEvent(sub.customerId, {
        plan: teamPlan,
        billingPeriod: billingPeriodFromPaddlePriceId(priceId),
        status,
        currentPeriodEnd: sub.currentBillingPeriod?.endsAt
          ? new Date(sub.currentBillingPeriod.endsAt)
          : null,
        paddleSubscriptionId: sub.id,
      });

      if (!result) {
        logger.warn(
          { service: 'web', paddleCustomerId: sub.customerId, eventType: event.eventType },
          'No subscription record found — skipping'
        );
        return;
      }

      logger.info({ service: 'web', teamId: result.teamId, plan: teamPlan, status }, 'Subscription updated');

      const disabled = await alertChannelRepository.disableSurplusForPlan(result.teamId, teamPlan);
      if (disabled.length > 0) {
        logger.info(
          { service: 'web', teamId: result.teamId, plan: teamPlan, disabledCount: disabled.length, disabledIds: disabled.map((c) => c.id) },
          'Disabled surplus alert channels after plan change'
        );
      }
      break;
    }

    case EventName.SubscriptionCanceled: {
      const sub = event.data;

      const result = await subscriptionRepository.cancelFromPaddleEvent(sub.customerId);

      if (!result) {
        logger.warn(
          { service: 'web', paddleCustomerId: sub.customerId, eventType: event.eventType },
          'No subscription record found — skipping'
        );
        return;
      }

      logger.info({ service: 'web', teamId: result.teamId }, 'Subscription canceled — downgraded to free');

      const disabled = await alertChannelRepository.disableSurplusForPlan(result.teamId, 'free');
      if (disabled.length > 0) {
        logger.info(
          { service: 'web', teamId: result.teamId, disabledCount: disabled.length, disabledIds: disabled.map((c) => c.id) },
          'Disabled surplus alert channels after subscription cancel'
        );
      }
      break;
    }

    default:
      logger.info({ service: 'web', eventType: event.eventType }, 'Unhandled Paddle event — ignored');
  }
}

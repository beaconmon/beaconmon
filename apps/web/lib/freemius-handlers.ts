import crypto from 'node:crypto';
import { alertChannelRepository } from '@beaconmon/db';
import { logger } from '@/lib/logger';

function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email).digest('hex').slice(0, 8);
}
import {
  planFromFreemiusPlanId,
  billingPeriodFromFreemiusCycle,
  freemiusSubscriptionDataSchema,
  type FreemiusWebhookEvent,
  type FreemiusSubscriptionData,
} from '@/lib/freemius';
import { subscriptionRepository } from '@/lib/repositories/subscriptions';
import { getPostHogClient } from '@/lib/posthog-server';

function parseNextPayment(value: string | null | undefined): Date | null {
  if (!value) return null;
  const ts = Date.parse(value);
  return Number.isNaN(ts) ? null : new Date(ts);
}

function parseSubscriptionData(event: FreemiusWebhookEvent): FreemiusSubscriptionData | null {
  const parsed = freemiusSubscriptionDataSchema.safeParse(event.data);
  if (!parsed.success) {
    logger.warn(
      { service: 'web', eventType: event.type, err: parsed.error.message },
      'Freemius event data did not match subscription shape — skipping'
    );
    return null;
  }
  return parsed.data;
}

export async function handleFreemiusEvent(event: FreemiusWebhookEvent): Promise<void> {
  switch (event.type) {
    case 'subscription.created': {
      const sub = parseSubscriptionData(event);
      if (!sub) return;

      const plan = planFromFreemiusPlanId(sub.plan_id);
      const billingPeriod = billingPeriodFromFreemiusCycle(sub.billing_cycle);
      const currentPeriodEnd = parseNextPayment(sub.next_payment);

      // Prefer teamId from checkout user_dictionary metadata; fall back to email lookup.
      // user_dictionary is passed at checkout open() and stored on the subscription by Freemius.
      const rawData = event.data as Record<string, unknown>;
      const userDict = rawData['user_dictionary'] as Record<string, unknown> | undefined;
      const userDictTeamId = typeof userDict?.['teamId'] === 'string' ? userDict['teamId'] : undefined;

      let teamId: string | null = null;

      if (userDictTeamId) {
        teamId = userDictTeamId;
        logger.info(
          { service: 'web', eventType: event.type, subscriptionId: sub.id, teamId },
          'Matched subscription to team via user_dictionary'
        );
      } else {
        const email = sub.user?.email;
        if (!email) {
          logger.warn(
            { service: 'web', eventType: event.type, subscriptionId: sub.id },
            'Freemius subscription.created missing buyer email and no user_dictionary — cannot map to team'
          );
          return;
        }
        const emailHash = hashEmail(email);
        const emailDomain = email.split('@')[1];
        teamId = await subscriptionRepository.findTeamIdByOwnerEmail(email);
        if (!teamId) {
          logger.warn(
            { service: 'web', eventType: event.type, subscriptionId: sub.id, emailHash, emailDomain },
            'No team found for Freemius buyer email — skipping (consider adding user_dictionary at checkout)'
          );
          return;
        }
        logger.warn(
          { service: 'web', eventType: event.type, subscriptionId: sub.id, emailHash, emailDomain },
          'Matched subscription to team via buyer email fallback — risk of mismatch if checkout email differs'
        );
      }

      await subscriptionRepository.createFromFreemiusEvent(teamId, {
        freemiusUserId: sub.user_id,
        freemiusSubscriptionId: sub.id,
        plan,
        billingPeriod,
        status: 'active',
        currentPeriodEnd,
      });

      logger.info(
        { service: 'web', teamId, plan, billingPeriod },
        'Subscription created'
      );

      try {
        getPostHogClient().capture({
          distinctId: teamId,
          event: 'subscription_created',
          properties: { plan, billing_period: billingPeriod, status: 'active' },
        });
      } catch (err) {
        logger.error({ service: 'web', err, teamId }, 'PostHog capture failed for subscription_created');
      }
      break;
    }

    case 'subscription.updated': {
      const sub = parseSubscriptionData(event);
      if (!sub) return;

      const plan = planFromFreemiusPlanId(sub.plan_id);
      const billingPeriod = billingPeriodFromFreemiusCycle(sub.billing_cycle);
      const currentPeriodEnd = parseNextPayment(sub.next_payment);

      const result = await subscriptionRepository.updateFromFreemiusEvent(sub.user_id, {
        plan,
        billingPeriod,
        status: 'active',
        currentPeriodEnd,
        freemiusSubscriptionId: sub.id,
      });

      if (!result) {
        logger.warn(
          { service: 'web', freemiusUserId: sub.user_id, eventType: event.type },
          'No subscription record found — skipping'
        );
        return;
      }

      logger.info({ service: 'web', teamId: result.teamId, plan, billingPeriod }, 'Subscription updated');

      try {
        getPostHogClient().capture({
          distinctId: result.teamId,
          event: 'subscription_updated',
          properties: { plan, billing_period: billingPeriod, status: 'active' },
        });
      } catch (err) {
        logger.error(
          { service: 'web', err, teamId: result.teamId },
          'PostHog capture failed for subscription_updated'
        );
      }

      const disabled = await alertChannelRepository.disableSurplusForPlan(result.teamId, plan);
      if (disabled.length > 0) {
        logger.info(
          {
            service: 'web',
            teamId: result.teamId,
            plan,
            disabledCount: disabled.length,
            disabledIds: disabled.map((c) => c.id),
          },
          'Disabled surplus alert channels after plan change'
        );
      }
      break;
    }

    case 'subscription.canceled':
    case 'subscription.cancelled':
    case 'subscription.expired': {
      const sub = parseSubscriptionData(event);
      if (!sub) return;

      const result = await subscriptionRepository.cancelFromFreemiusEvent(sub.user_id);

      if (!result) {
        logger.warn(
          { service: 'web', freemiusUserId: sub.user_id, eventType: event.type },
          'No subscription record found — skipping'
        );
        return;
      }

      logger.info(
        { service: 'web', teamId: result.teamId },
        'Subscription canceled — downgraded to free'
      );

      try {
        getPostHogClient().capture({
          distinctId: result.teamId,
          event: 'subscription_canceled',
          properties: { plan: 'free' },
        });
      } catch (err) {
        logger.error(
          { service: 'web', err, teamId: result.teamId },
          'PostHog capture failed for subscription_canceled'
        );
      }

      const disabled = await alertChannelRepository.disableSurplusForPlan(result.teamId, 'free');
      if (disabled.length > 0) {
        logger.info(
          {
            service: 'web',
            teamId: result.teamId,
            disabledCount: disabled.length,
            disabledIds: disabled.map((c) => c.id),
          },
          'Disabled surplus alert channels after subscription cancel'
        );
      }
      break;
    }

    case 'payment.failed':
    case 'subscription.on_hold': {
      const sub = parseSubscriptionData(event);
      if (!sub) return;

      const result = await subscriptionRepository.updateFromFreemiusEvent(sub.user_id, {
        plan: planFromFreemiusPlanId(sub.plan_id),
        billingPeriod: billingPeriodFromFreemiusCycle(sub.billing_cycle),
        status: 'past_due',
        currentPeriodEnd: parseNextPayment(sub.next_payment),
        freemiusSubscriptionId: sub.id,
      });

      if (result) {
        logger.info({ service: 'web', teamId: result.teamId, eventType: event.type }, 'Subscription marked past_due');
      }
      break;
    }

    case 'subscription.pending': {
      const sub = parseSubscriptionData(event);
      if (!sub) return;

      const result = await subscriptionRepository.updateFromFreemiusEvent(sub.user_id, {
        plan: planFromFreemiusPlanId(sub.plan_id),
        billingPeriod: billingPeriodFromFreemiusCycle(sub.billing_cycle),
        status: 'incomplete',
        currentPeriodEnd: parseNextPayment(sub.next_payment),
        freemiusSubscriptionId: sub.id,
      });

      if (result) {
        logger.info({ service: 'web', teamId: result.teamId }, 'Subscription marked incomplete (pending)');
      }
      break;
    }

    case 'subscription.trial_started':
    case 'subscription.trial_expired':
      // Trial state is managed locally via teams.trial_ends_at; no action needed.
      // Log so we can verify Freemius is emitting these and correlate with our records.
      logger.info({ service: 'web', eventType: event.type }, 'Freemius trial event received — no action taken');
      break;

    default:
      logger.info({ service: 'web', eventType: event.type }, 'Unhandled Freemius event — ignored');
  }
}

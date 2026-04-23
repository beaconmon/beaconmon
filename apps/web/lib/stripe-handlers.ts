import type Stripe from 'stripe';
import { prisma } from '@beaconmon/db';
import { logger } from '@/lib/logger';
import type { PlanTier } from '@beaconmon/types';

// Map Stripe price IDs to plan tiers.
function resolvePlan(priceId: string | null | undefined): PlanTier {
  if (priceId === process.env['STRIPE_PRO_PRICE_ID']) return 'pro';
  if (priceId === process.env['STRIPE_BUSINESS_PRICE_ID']) return 'business';
  return 'free';
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const teamId = session.client_reference_id;
      const customerId = session.customer as string | null;
      const subscriptionId = session.subscription as string | null;

      if (!teamId || !customerId) {
        logger.warn({ service: 'web', eventId: event.id, type: event.type }, 'Missing teamId or customerId — skipping');
        return;
      }

      // Determine plan from the subscription's price
      let plan: PlanTier = 'pro'; // default on checkout completion
      if (subscriptionId) {
        // Subscription details are on the expanded object — use metadata from session if available
        const rawPriceId = (session.metadata?.['priceId']) ?? null;
        plan = resolvePlan(rawPriceId);
      }

      await prisma.$transaction(async (tx) => {
        await tx.subscription.upsert({
          where: { teamId },
          create: {
            teamId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            plan,
            status: 'active',
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            plan,
            status: 'active',
          },
        });
        await tx.team.update({
          where: { id: teamId },
          data: { plan },
        });
      });

      logger.info({ service: 'web', teamId, plan }, 'Subscription activated via checkout');
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const priceId = sub.items.data[0]?.price.id ?? null;
      const plan = resolvePlan(priceId);
      const status = sub.status as string;
      const currentPeriodEnd = new Date(sub.current_period_end * 1000);

      const existing = await prisma.subscription.findUnique({
        where: { stripeCustomerId: customerId },
        select: { teamId: true },
      });

      if (!existing) {
        logger.warn({ service: 'web', customerId, type: event.type }, 'No subscription record found — skipping');
        return;
      }

      const { teamId } = existing;

      await prisma.$transaction(async (tx) => {
        await tx.subscription.update({
          where: { teamId },
          data: {
            plan,
            status: status as never,
            currentPeriodEnd,
            stripeSubscriptionId: sub.id,
          },
        });
        await tx.team.update({
          where: { id: teamId },
          data: { plan },
        });
      });

      logger.info({ service: 'web', teamId, plan, status }, 'Subscription updated');
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      const existing = await prisma.subscription.findUnique({
        where: { stripeCustomerId: customerId },
        select: { teamId: true },
      });

      if (!existing) {
        logger.warn({ service: 'web', customerId, type: event.type }, 'No subscription record found — skipping');
        return;
      }

      const { teamId } = existing;

      await prisma.$transaction(async (tx) => {
        await tx.subscription.update({
          where: { teamId },
          data: { status: 'canceled', plan: 'free' },
        });
        await tx.team.update({
          where: { id: teamId },
          data: { plan: 'free' },
        });
      });

      logger.info({ service: 'web', teamId }, 'Subscription canceled — downgraded to free');
      break;
    }

    default:
      logger.info({ service: 'web', type: event.type }, 'Unhandled Stripe event — ignored');
  }
}

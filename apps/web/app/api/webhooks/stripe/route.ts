import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not set');
    return Response.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logger.info({ type: event.type }, 'Stripe webhook received');

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // TODO: implement subscription sync
        break;
      default:
        logger.info({ type: event.type }, 'Unhandled Stripe event');
    }

    return Response.json({ received: true });
  } catch (err) {
    logger.error({ err }, 'Stripe webhook error');
    return Response.json({ error: 'Webhook error' }, { status: 400 });
  }
}

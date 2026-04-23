import { stripe } from '@/lib/stripe';
import { logger } from '@/lib/logger';
import { handleStripeEvent } from '@/lib/stripe-handlers';

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

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    logger.error({ err }, 'Stripe webhook signature verification failed');
    return Response.json({ error: 'Webhook error' }, { status: 400 });
  }

  logger.info({ type: event.type, eventId: event.id }, 'Stripe webhook received');

  try {
    await handleStripeEvent(event);
  } catch (err) {
    logger.error({ err, eventId: event.id, type: event.type }, 'Failed to handle Stripe event');
    // Return 200 so Stripe does not retry transient processing errors
    return Response.json({ received: true });
  }

  return Response.json({ received: true });
}
import { logger } from '@/lib/logger';
import { verifyWebhook } from '@/lib/paddle';
import { handlePaddleEvent } from '@/lib/paddle-handlers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('paddle-signature') ?? '';

  let event;
  try {
    event = await verifyWebhook(rawBody, signature);
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!event) {
    return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  logger.info({ service: 'web', eventType: event.eventType }, 'Paddle webhook received');

  try {
    await handlePaddleEvent(event);
  } catch (err) {
    logger.error({ service: 'web', err, eventType: event.eventType }, 'Paddle webhook handler failed');
    // Return 200 to prevent Paddle retries on our logic errors
  }

  return Response.json({ received: true });
}

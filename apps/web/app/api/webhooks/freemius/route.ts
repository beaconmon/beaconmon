import { prisma, Prisma } from '@beaconmon/db';
import { logger } from '@/lib/logger';
import { verifyWebhook } from '@/lib/freemius';
import { handleFreemiusEvent } from '@/lib/freemius-handlers';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-signature') ?? '';

  let event;
  try {
    event = await verifyWebhook(rawBody, signature);
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!event) {
    return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  logger.info({ service: 'web', eventType: event.type }, 'Freemius webhook received');

  // Dedup on event_id to guard against Freemius retries and double-fires.
  const eventId = event.id != null ? String(event.id) : null;
  if (eventId) {
    try {
      await prisma.processedWebhookEvent.create({
        data: { id: eventId, type: event.type },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        logger.info({ service: 'web', eventId, eventType: event.type }, 'Duplicate Freemius event — skipped');
        return Response.json({ received: true });
      }
      throw err;
    }
  }

  try {
    await handleFreemiusEvent(event);
  } catch (err) {
    logger.error({ service: 'web', err, eventType: event.type }, 'Freemius webhook handler failed');
    // Return 200 to prevent Freemius retries on our logic errors
  }

  return Response.json({ received: true });
}

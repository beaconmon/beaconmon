import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { z } from 'zod';

const paddleEnv = z
  .object({
    PADDLE_API_KEY: z.string().min(1),
    PADDLE_WEBHOOK_SECRET: z.string().min(1),
    PADDLE_PRO_PRICE_ID: z.string().min(1),
    PADDLE_BUSINESS_PRICE_ID: z.string().min(1),
    NODE_ENV: z.enum(['production', 'development', 'test']).optional(),
  })
  .parse(process.env);

export const paddle = new Paddle(paddleEnv.PADDLE_API_KEY, {
  environment:
    paddleEnv.NODE_ENV === 'production'
      ? Environment.production
      : Environment.sandbox,
});

// Returns priceId for the given plan — used by billing page to initialize overlay
export function getPriceId(plan: 'pro' | 'business'): string {
  const id =
    plan === 'pro'
      ? process.env['PADDLE_PRO_PRICE_ID']
      : process.env['PADDLE_BUSINESS_PRICE_ID'];
  if (!id) throw new Error(`Missing PADDLE_${plan.toUpperCase()}_PRICE_ID`);
  return id;
}

// Generates a one-time portal session URL for the customer
export async function createPortalSession(paddleCustomerId: string): Promise<string> {
  const session = await paddle.customerPortalSessions.create(paddleCustomerId, []);
  return session.urls.general.overview;
}

// Webhook verification — throws if invalid signature
export async function verifyWebhook(rawBody: string, signature: string) {
  if (!paddleEnv.PADDLE_WEBHOOK_SECRET) {
    throw new Error('PADDLE_WEBHOOK_SECRET is not configured');
  }
  return paddle.webhooks.unmarshal(
    rawBody,
    paddleEnv.PADDLE_WEBHOOK_SECRET,
    signature
  );
}

import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { z } from 'zod';

const paddleEnvSchema = z.object({
  PADDLE_API_KEY: z.string().min(1),
  PADDLE_WEBHOOK_SECRET: z.string().min(1),
  PADDLE_PRO_PRICE_ID: z.string().min(1),
  PADDLE_BUSINESS_PRICE_ID: z.string().min(1),
  PADDLE_PRO_ANNUAL_PRICE_ID: z.string().min(1),
  PADDLE_BUSINESS_ANNUAL_PRICE_ID: z.string().min(1),
  NODE_ENV: z.enum(['production', 'development', 'test']).optional(),
});

type PaddleEnv = z.infer<typeof paddleEnvSchema>;

let _paddleEnv: PaddleEnv | null = null;
let _paddleClient: Paddle | null = null;

function getPaddleEnv(): PaddleEnv {
  if (!_paddleEnv) {
    _paddleEnv = paddleEnvSchema.parse(process.env);
  }
  return _paddleEnv;
}

function getPaddleClient(): Paddle {
  if (!_paddleClient) {
    const env = getPaddleEnv();
    _paddleClient = new Paddle(env.PADDLE_API_KEY, {
      environment: env.NODE_ENV === 'production' ? Environment.production : Environment.sandbox,
    });
  }
  return _paddleClient;
}

// Keep backward-compatible export (lazy proxy)
export const paddle = new Proxy({} as Paddle, {
  get(_target, prop) {
    return (getPaddleClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function getPriceId(plan: 'pro' | 'business', period: 'monthly' | 'annual' = 'monthly'): string {
  const env = getPaddleEnv();
  if (period === 'annual') {
    return plan === 'pro' ? env.PADDLE_PRO_ANNUAL_PRICE_ID : env.PADDLE_BUSINESS_ANNUAL_PRICE_ID;
  }
  return plan === 'pro' ? env.PADDLE_PRO_PRICE_ID : env.PADDLE_BUSINESS_PRICE_ID;
}

export function planFromPaddlePriceId(priceId: string | null | undefined): 'free' | 'pro' | 'business' {
  if (!priceId) return 'free';
  const env = getPaddleEnv();
  if (priceId === env.PADDLE_PRO_PRICE_ID || priceId === env.PADDLE_PRO_ANNUAL_PRICE_ID) return 'pro';
  if (priceId === env.PADDLE_BUSINESS_PRICE_ID || priceId === env.PADDLE_BUSINESS_ANNUAL_PRICE_ID) return 'business';
  return 'free';
}

export function billingPeriodFromPaddlePriceId(priceId: string | null | undefined): 'monthly' | 'annual' {
  if (!priceId) return 'monthly';
  const env = getPaddleEnv();
  if (priceId === env.PADDLE_PRO_ANNUAL_PRICE_ID || priceId === env.PADDLE_BUSINESS_ANNUAL_PRICE_ID) return 'annual';
  return 'monthly';
}

// Generates a one-time portal session URL for the customer
export async function createPortalSession(paddleCustomerId: string): Promise<string> {
  const session = await getPaddleClient().customerPortalSessions.create(paddleCustomerId, []);
  return session.urls.general.overview;
}

// Webhook verification — throws if invalid signature
export async function verifyWebhook(rawBody: string, signature: string) {
  const env = getPaddleEnv();
  return getPaddleClient().webhooks.unmarshal(rawBody, env.PADDLE_WEBHOOK_SECRET, signature);
}

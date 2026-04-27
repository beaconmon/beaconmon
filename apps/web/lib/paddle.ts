import { Environment, Paddle } from '@paddle/paddle-node-sdk';
import { z } from 'zod';

const paddleEnvSchema = z.object({
  PADDLE_API_KEY: z.string().min(1),
  PADDLE_WEBHOOK_SECRET: z.string().min(1),
  PADDLE_PRO_PRICE_ID: z.string().min(1),
  PADDLE_BUSINESS_PRICE_ID: z.string().min(1),
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
  const session = await getPaddleClient().customerPortalSessions.create(paddleCustomerId, []);
  return session.urls.general.overview;
}

// Webhook verification — throws if invalid signature
export async function verifyWebhook(rawBody: string, signature: string) {
  const env = getPaddleEnv();
  return getPaddleClient().webhooks.unmarshal(rawBody, env.PADDLE_WEBHOOK_SECRET, signature);
}

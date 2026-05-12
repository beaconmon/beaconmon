import crypto from 'node:crypto';
import { z } from 'zod';

const freemiusEnvSchema = z.object({
  FREEMIUS_API_KEY: z.string().min(1),
  FREEMIUS_WEBHOOK_SECRET: z.string().min(1),
  FREEMIUS_PRODUCT_ID: z.string().min(1),
  FREEMIUS_PRO_PLAN_ID: z.string().min(1),
  FREEMIUS_BUSINESS_PLAN_ID: z.string().min(1),
  FREEMIUS_SANDBOX: z.string().optional(),
  NODE_ENV: z.enum(['production', 'development', 'test']).optional(),
});

type FreemiusEnv = z.infer<typeof freemiusEnvSchema>;

let _freemiusEnv: FreemiusEnv | null = null;

function getFreemiusEnv(): FreemiusEnv {
  if (!_freemiusEnv) {
    _freemiusEnv = freemiusEnvSchema.parse(process.env);
  }
  return _freemiusEnv;
}

export function getPlanId(plan: 'pro' | 'business'): string {
  const env = getFreemiusEnv();
  return plan === 'pro' ? env.FREEMIUS_PRO_PLAN_ID : env.FREEMIUS_BUSINESS_PLAN_ID;
}

export function planFromFreemiusPlanId(planId: string | null | undefined): 'free' | 'pro' | 'business' {
  if (!planId) return 'free';
  const env = getFreemiusEnv();
  if (planId === env.FREEMIUS_PRO_PLAN_ID) return 'pro';
  if (planId === env.FREEMIUS_BUSINESS_PLAN_ID) return 'business';
  return 'free';
}

// Freemius models intervals as a billing_cycle integer at checkout time:
// 1 = monthly, 12 = annual. Some payloads also use the string "month"/"annual".
export function billingPeriodFromFreemiusCycle(
  cycle: number | string | null | undefined
): 'monthly' | 'annual' {
  if (cycle === null || cycle === undefined) return 'monthly';
  if (typeof cycle === 'number') return cycle >= 12 ? 'annual' : 'monthly';
  const normalized = cycle.toLowerCase();
  if (normalized === 'annual' || normalized === 'yearly' || normalized === '12') return 'annual';
  return 'monthly';
}

// Customer portal: Freemius hosts the user dashboard at users.freemius.com.
// We deep-link with the user's email so the login flow is pre-filled — the
// user authenticates via a Freemius-issued magic link.
export async function createPortalSession(_freemiusUserId: string, email?: string): Promise<string> {
  const params = new URLSearchParams();
  if (email) params.set('email', email);
  const qs = params.toString();
  return `https://users.freemius.com/login${qs ? `?${qs}` : ''}`;
}

// Webhook signature verification. Freemius signs the raw request body with
// HMAC-SHA256 using the webhook secret. The signature arrives as a hex
// digest in the X-Signature header. Returns the parsed JSON on success,
// throws otherwise.
export async function verifyWebhook(rawBody: string, signature: string): Promise<FreemiusWebhookEvent> {
  if (!signature) {
    throw new Error('Missing Freemius signature');
  }
  const env = getFreemiusEnv();
  const expected = crypto
    .createHmac('sha256', env.FREEMIUS_WEBHOOK_SECRET)
    .update(rawBody, 'utf8')
    .digest('hex');

  const sigBuf = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Invalid Freemius signature');
  }

  const parsed = freemiusEventSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) {
    throw new Error(`Invalid Freemius webhook payload: ${parsed.error.message}`);
  }
  return parsed.data;
}

// Freemius webhook event envelope. Resource shape varies per event type;
// individual handlers parse the inner `data` payload as needed.
const freemiusEventSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.string(),
  object: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
});

export type FreemiusWebhookEvent = z.infer<typeof freemiusEventSchema>;

// Subscription data shape seen in subscription.* events. Freemius emits user
// info inline on the create event so we can map to a team without a separate
// API call.
export const freemiusSubscriptionDataSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  user_id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  plan_id: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
  billing_cycle: z.union([z.number(), z.string()]).optional(),
  next_payment: z.string().nullish(),
  user: z
    .object({
      id: z.union([z.string(), z.number()]).transform((v) => String(v)),
      email: z.string().email().optional(),
    })
    .optional(),
});

export type FreemiusSubscriptionData = z.infer<typeof freemiusSubscriptionDataSchema>;

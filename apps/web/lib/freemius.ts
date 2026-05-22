import crypto from 'node:crypto';
import { z } from 'zod';
import type { PlanTier } from '@beaconmon/types';
import { Freemius } from '@freemius/sdk';

const freemiusEnvSchema = z.object({
  FREEMIUS_API_KEY: z.string().min(1),
  FREEMIUS_WEBHOOK_SECRET: z.string().min(1),
  FREEMIUS_PRODUCT_ID: z.string().min(1),
  FREEMIUS_SECRET_KEY: z.string().min(1).optional(),
  FREEMIUS_PUBLIC_KEY: z.string().min(1).optional(),
  FREEMIUS_STARTER_PLAN_ID: z.string().optional(),
  FREEMIUS_GROWTH_PLAN_ID: z.string().optional(),
  FREEMIUS_SCALE_PLAN_ID: z.string().optional(),
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

export function getPlanId(plan: 'starter' | 'growth' | 'scale'): string {
  const env = getFreemiusEnv();
  if (plan === 'starter') {
    if (!env.FREEMIUS_STARTER_PLAN_ID) throw new Error("Missing FREEMIUS_STARTER_PLAN_ID for plan 'starter'");
    return env.FREEMIUS_STARTER_PLAN_ID;
  }
  if (plan === 'growth') {
    if (!env.FREEMIUS_GROWTH_PLAN_ID) throw new Error("Missing FREEMIUS_GROWTH_PLAN_ID for plan 'growth'");
    return env.FREEMIUS_GROWTH_PLAN_ID;
  }
  if (!env.FREEMIUS_SCALE_PLAN_ID) throw new Error("Missing FREEMIUS_SCALE_PLAN_ID for plan 'scale'");
  return env.FREEMIUS_SCALE_PLAN_ID;
}

export function planFromFreemiusPlanId(planId: string | null | undefined): PlanTier {
  if (!planId) return 'free';
  const env = getFreemiusEnv();
  if (env.FREEMIUS_STARTER_PLAN_ID && planId === env.FREEMIUS_STARTER_PLAN_ID) return 'starter';
  if (env.FREEMIUS_GROWTH_PLAN_ID && planId === env.FREEMIUS_GROWTH_PLAN_ID) return 'growth';
  if (env.FREEMIUS_SCALE_PLAN_ID && planId === env.FREEMIUS_SCALE_PLAN_ID) return 'scale';
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
// We deep-link with the user's email so the login flow is pre-filled.
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

// SDK singleton for REST API calls (resync endpoint, future use).
// Requires FREEMIUS_SECRET_KEY and FREEMIUS_PUBLIC_KEY to be set.
let _freemiusSdk: Freemius | null = null;

export function getFreemiusSdk(): Freemius {
  if (_freemiusSdk) return _freemiusSdk;
  const env = getFreemiusEnv();
  if (!env.FREEMIUS_SECRET_KEY || !env.FREEMIUS_PUBLIC_KEY) {
    throw new Error('FREEMIUS_SECRET_KEY and FREEMIUS_PUBLIC_KEY are required for SDK operations. Set them in your environment.');
  }
  _freemiusSdk = new Freemius({
    productId: env.FREEMIUS_PRODUCT_ID,
    apiKey: env.FREEMIUS_API_KEY,
    secretKey: env.FREEMIUS_SECRET_KEY,
    publicKey: env.FREEMIUS_PUBLIC_KEY,
  });
  return _freemiusSdk;
}

import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DATABASE_URL_POOLED: z.string().url('DATABASE_URL_POOLED must be a valid URL').optional(),
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  ALERT_DRY_RUN: z
    .string()
    .transform((v) => v === 'true')
    .default(false),
  SENTRY_DSN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  LIFECYCLE_EMAIL_SECRET: z.string().min(32).optional(),
  FEATURE_SMS_ALERTS: z
    .string()
    .transform((v) => v === 'true')
    .default(false),
  // Multi-region check probes (Cloudflare Workers)
  FEATURE_MULTI_LOCATION: z
    .string()
    .transform((v) => v === 'true')
    .default(false),
  REGION_PROBE_SECRET: z.string().min(32).optional(),
  CF_PROBE_URL_US_EAST: z.string().url().optional(),
  CF_PROBE_URL_US_WEST: z.string().url().optional(),
  CF_PROBE_URL_EU_WEST: z.string().url().optional(),
  CF_PROBE_URL_AP_SOUTHEAST: z.string().url().optional(),
  CF_PROBE_URL_SA_EAST: z.string().url().optional(),
  // Cloudflare R2 (report storage)
  R2_BUCKET: z.string().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  APP_URL: z.string().url().optional(), // used in report email links
  // AI content-diff summaries + noise filter
  AI_PROVIDER: z.enum(['anthropic', 'openai', 'deepseek', 'noop']).default('noop'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(), // provider defaults apply when unset
  AI_DRY_RUN: z
    .string()
    .transform((v) => v === 'true')
    .default(false),
  FEATURE_AI_CONTENT_DIFF: z
    .string()
    .transform((v) => v === 'true')
    .default(false),
});

// Validate at startup — fails fast before any worker logic runs
const result = EnvSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:');
  for (const issue of result.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const parsed = result.data;

// Fail-open: if multi-location is enabled but the shared secret is missing,
// log a warning and disable the feature rather than crashing or probing without auth.
if (parsed.FEATURE_MULTI_LOCATION && !parsed.REGION_PROBE_SECRET) {
  console.warn(
    '[env] FEATURE_MULTI_LOCATION=true but REGION_PROBE_SECRET is not set — disabling multi-location checks'
  );
  parsed.FEATURE_MULTI_LOCATION = false;
}

// Fail-open: AI is opt-in. If a real provider is selected but the API key is
// missing, force AI_PROVIDER to 'noop' rather than crashing the worker fleet.
if (parsed.AI_PROVIDER !== 'noop' && !parsed.AI_API_KEY) {
  console.warn(
    `[env] AI_PROVIDER=${parsed.AI_PROVIDER} but AI_API_KEY is not set — disabling AI analysis`
  );
  parsed.AI_PROVIDER = 'noop';
}

export const env = parsed;

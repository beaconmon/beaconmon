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
  FEATURE_SMS_ALERTS: z
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

export const env = result.data;

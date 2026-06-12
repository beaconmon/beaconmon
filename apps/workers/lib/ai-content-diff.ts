import type { Redis } from 'ioredis';
import {
  createAiProvider,
  summarizeContentDiff,
  type ContentDiffClassification,
} from '@beaconmon/ai';
import { getEffectivePlan, canUseFeature } from '@beaconmon/billing';
import { env } from './env.js';
import { logger } from './logger.js';

const service = 'content-worker';

// Runaway-cost guard: cap AI calls per monitor per day. 50 is generous
// (a 30s-interval monitor checks 2,880×/day — almost all "no change") and
// well above any legitimate change rate. Keyed by UTC date.
const PER_MONITOR_DAILY_LIMIT = 50;
const RATE_LIMIT_TTL_SECONDS = 60 * 60 * 24;

// Per-monitor circuit breaker: 3 provider failures within 60s trips the breaker.
// Prevents a flaky AI provider from hammering retries on every content change.
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_TTL_SECONDS = 60;

// Atomic INCR+EXPIRE: avoids a TTL-less key if the process crashes between commands.
const ATOMIC_INCR_EXPIRE_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return count
`;

export interface AiAnalysisInput {
  monitorId: string;
  teamPlan: string;
  trialEndsAt: Date | null;
  subscriptionStatus: string | null;
  previousContent: string;
  nextContent: string;
}

export interface AiAnalysisOutput {
  summary: string;
  classification: ContentDiffClassification;
  confidence: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Run AI analysis on a content diff if eligible. Returns null when AI is
 * skipped (feature flag off, free plan, rate limited, circuit open, or provider 'noop').
 * Never throws — AI failures are logged and swallowed so the content-change
 * pipeline keeps working.
 */
export async function runAiAnalysisIfEligible(
  redis: Redis,
  input: AiAnalysisInput
): Promise<AiAnalysisOutput | null> {
  if (!env.FEATURE_AI_CONTENT_DIFF) return null;
  if (env.AI_DRY_RUN) {
    logger.debug({ service, monitorId: input.monitorId }, 'AI_DRY_RUN — skipping AI analysis');
    return null;
  }
  if (env.AI_PROVIDER === 'noop') return null;

  const effectivePlan = getEffectivePlan({
    plan: input.teamPlan,
    trialEndsAt: input.trialEndsAt,
    subscription: input.subscriptionStatus ? { status: input.subscriptionStatus } : null,
  });
  if (!canUseFeature(effectivePlan, 'ai')) {
    logger.debug({ service, monitorId: input.monitorId, plan: effectivePlan }, 'AI skipped — plan not eligible');
    return null;
  }

  // Check circuit breaker before consuming rate limit
  const circuitClosed = await checkCircuitBreaker(redis, input.monitorId);
  if (!circuitClosed) {
    logger.warn({ service, monitorId: input.monitorId }, 'AI skipped — circuit breaker open');
    return null;
  }

  const allowed = await consumeRateLimit(redis, input.monitorId);
  if (!allowed) {
    logger.warn(
      { service, monitorId: input.monitorId, limit: PER_MONITOR_DAILY_LIMIT },
      'AI skipped — per-monitor daily limit reached'
    );
    return null;
  }

  try {
    const provider = createAiProvider({
      provider: env.AI_PROVIDER,
      apiKey: env.AI_API_KEY,
      model: env.AI_MODEL,
    });
    const result = await summarizeContentDiff(
      provider,
      input.previousContent,
      input.nextContent
    );
    return {
      summary: result.data.summary,
      classification: result.data.classification,
      confidence: result.data.confidence,
      model: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    };
  } catch (err) {
    logger.error(
      { service, monitorId: input.monitorId, err },
      'AI analysis failed — continuing without summary'
    );
    // Record failure so the circuit breaker can trip after repeated provider errors.
    await recordCircuitBreakerFailure(redis, input.monitorId);
    return null;
  }
}

/**
 * Returns true (circuit closed = healthy) if the failure count for this monitor
 * is below the threshold. Returns false (circuit open) on Redis failure so we
 * fail closed — skipping AI is safer than uncapped spend on a broken provider.
 */
async function checkCircuitBreaker(redis: Redis, monitorId: string): Promise<boolean> {
  const key = `ai:circuit:${monitorId}`;
  try {
    const count = await redis.get(key);
    return count === null || parseInt(count, 10) < CIRCUIT_BREAKER_THRESHOLD;
  } catch (err) {
    logger.warn({ service, monitorId, err }, 'AI circuit breaker check failed — failing closed');
    return false;
  }
}

async function recordCircuitBreakerFailure(redis: Redis, monitorId: string): Promise<void> {
  const key = `ai:circuit:${monitorId}`;
  try {
    await redis.eval(ATOMIC_INCR_EXPIRE_SCRIPT, 1, key, String(CIRCUIT_BREAKER_TTL_SECONDS));
  } catch {
    // Best-effort; if Redis is down the circuit breaker simply won't count this failure.
  }
}

async function consumeRateLimit(redis: Redis, monitorId: string): Promise<boolean> {
  const dayKey = new Date().toISOString().slice(0, 10);
  const key = `ai:monitor:${monitorId}:${dayKey}`;
  try {
    const count = await redis.eval(ATOMIC_INCR_EXPIRE_SCRIPT, 1, key, String(RATE_LIMIT_TTL_SECONDS)) as number;
    return count <= PER_MONITOR_DAILY_LIMIT;
  } catch (err) {
    // Fail closed: if Redis is unavailable, skip AI to prevent uncapped spend.
    logger.warn({ service, monitorId, err }, 'AI rate-limit check failed — failing closed');
    return false;
  }
}

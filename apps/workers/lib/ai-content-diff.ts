import type { Redis } from 'ioredis';
import {
  createAiProvider,
  summarizeContentDiff,
  type ContentDiffClassification,
} from '@beaconmon/ai';
import { PLAN_LIMITS } from '@beaconmon/types';
import { env } from './env.js';
import { logger } from './logger.js';

const service = 'content-worker';

// Runaway-cost guard: cap AI calls per monitor per day. 50 is generous
// (a 30s-interval monitor checks 2,880×/day — almost all "no change") and
// well above any legitimate change rate. Keyed by UTC date.
const PER_MONITOR_DAILY_LIMIT = 50;
const RATE_LIMIT_TTL_SECONDS = 60 * 60 * 24;

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
  model: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Run AI analysis on a content diff if eligible. Returns null when AI is
 * skipped (feature flag off, free plan, rate limited, or provider 'noop').
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
    subscriptionStatus: input.subscriptionStatus,
  });
  if (effectivePlan === 'free') {
    logger.debug({ service, monitorId: input.monitorId }, 'AI skipped — free plan');
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
      model: result.model,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    };
  } catch (err) {
    logger.error(
      { service, monitorId: input.monitorId, err },
      'AI analysis failed — continuing without summary'
    );
    return null;
  }
}

function getEffectivePlan(team: {
  plan: string;
  trialEndsAt: Date | null;
  subscriptionStatus: string | null;
}): keyof typeof PLAN_LIMITS {
  const plan = team.plan as keyof typeof PLAN_LIMITS;
  if (plan === 'free') return 'free';
  if (team.trialEndsAt && team.trialEndsAt < new Date()) {
    const subStatus = team.subscriptionStatus;
    const hasActiveSub = subStatus === 'active' || subStatus === 'past_due';
    if (!hasActiveSub) return 'free';
  }
  return plan;
}

async function consumeRateLimit(redis: Redis, monitorId: string): Promise<boolean> {
  const dayKey = new Date().toISOString().slice(0, 10);
  const key = `ai:monitor:${monitorId}:${dayKey}`;
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT_TTL_SECONDS);
    }
    return count <= PER_MONITOR_DAILY_LIMIT;
  } catch (err) {
    // Fail-open: if Redis is unavailable, allow the call. The provider's
    // own rate limits + the global feature flag are still in place.
    logger.warn({ service, monitorId, err }, 'AI rate-limit check failed — allowing call');
    return true;
  }
}

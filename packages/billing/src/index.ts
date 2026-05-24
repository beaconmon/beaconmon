import { PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';

export { PLAN_LIMITS } from '@beaconmon/types';
export type { PlanTier } from '@beaconmon/types';

/**
 * Resolve the team's effective billing tier, accounting for expired trials.
 * A paid plan with an expired trial and no active/past_due subscription falls
 * back to free.
 */
export function getEffectivePlan(team: {
  plan: string;
  trialEndsAt: Date | null;
  subscription: { status: string } | null;
}): PlanTier {
  const validPlans = Object.keys(PLAN_LIMITS) as PlanTier[];
  const plan = validPlans.includes(team.plan as PlanTier)
    ? (team.plan as PlanTier)
    : 'free';
  if (plan === 'free') return 'free';
  if (team.trialEndsAt && team.trialEndsAt < new Date()) {
    const subStatus = team.subscription?.status;
    const hasActiveSub = subStatus === 'active' || subStatus === 'past_due';
    if (!hasActiveSub) return 'free';
  }
  return plan;
}

export type BillingFeature =
  | 'ai'
  | 'digest_daily'
  | 'multi_location'
  | 'smart_setup'
  | 'smart_alerts';

/**
 * Returns true if the given plan tier is allowed to use the feature.
 * Call with the result of getEffectivePlan(), not the raw team.plan string.
 */
export function canUseFeature(plan: PlanTier, feature: BillingFeature): boolean {
  switch (feature) {
    case 'ai':
      return plan !== 'free';
    case 'digest_daily':
      return plan === 'growth' || plan === 'scale';
    case 'multi_location':
      return plan === 'growth' || plan === 'scale';
    case 'smart_setup':
      return plan !== 'free';
    case 'smart_alerts':
      return plan === 'growth' || plan === 'scale';
  }
}

/** Number of content snapshots retained per monitor for this plan. */
export function getSnapshotRetentionLimit(plan: PlanTier): number {
  switch (plan) {
    case 'free': return 3;
    case 'starter': return 10;
    case 'growth': return 30;
    case 'scale': return 90;
  }
}

/** Number of history days retained in check_results for this plan. */
export function getHistoryRetentionDays(plan: PlanTier): number {
  return PLAN_LIMITS[plan].historyDays;
}

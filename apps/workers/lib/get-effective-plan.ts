import { PLAN_LIMITS } from '@beaconmon/types';

export function getEffectivePlan(team: {
  plan: string;
  trialEndsAt: Date | null;
  subscription: { status: string } | null;
}): keyof typeof PLAN_LIMITS {
  const validPlans = Object.keys(PLAN_LIMITS) as Array<keyof typeof PLAN_LIMITS>;
  const plan = validPlans.includes(team.plan as keyof typeof PLAN_LIMITS)
    ? (team.plan as keyof typeof PLAN_LIMITS)
    : 'free';
  if (plan === 'free') return 'free';
  if (team.trialEndsAt && team.trialEndsAt < new Date()) {
    const subStatus = team.subscription?.status;
    const hasActiveSub = subStatus === 'active' || subStatus === 'past_due';
    if (!hasActiveSub) return 'free';
  }
  return plan;
}

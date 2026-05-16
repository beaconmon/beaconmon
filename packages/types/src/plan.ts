export type PlanTier = 'free' | 'pro' | 'business';

export const PLAN_LIMITS = {
  free: {
    monitors: 10,
    checkIntervalSeconds: 300, // 5 minutes minimum
    historyDays: 7,
    statusPages: 1,
    teamMembers: 1,
    alertChannels: 1,
    regions: 1,
    competitorMonitors: 1,
  },
  pro: {
    monitors: 25,
    checkIntervalSeconds: 60, // 1 minute minimum
    historyDays: 90,
    statusPages: 3,
    teamMembers: 5,
    alertChannels: 5,
    regions: 5,
    competitorMonitors: 10,
  },
  business: {
    monitors: -1, // unlimited
    checkIntervalSeconds: 30, // 30 seconds minimum
    historyDays: 365,
    statusPages: -1,
    teamMembers: -1,
    alertChannels: -1,
    regions: 5,
    competitorMonitors: -1,
  },
} as const satisfies Record<PlanTier, PlanLimits>;

export interface PlanLimits {
  monitors: number;
  checkIntervalSeconds: number;
  historyDays: number;
  statusPages: number;
  teamMembers: number;
  alertChannels: number;
  regions: number;
  competitorMonitors: number;
}

export function planRetentionCutoff(plan: PlanTier): Date {
  const days = PLAN_LIMITS[plan].historyDays;
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  cutoff.setUTCHours(0, 0, 0, 0);
  return cutoff;
}

export function clampToPlanRetention(from: Date, plan: PlanTier): Date {
  const cutoff = planRetentionCutoff(plan);
  return from < cutoff ? cutoff : from;
}

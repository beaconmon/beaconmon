export type PlanTier = 'free' | 'starter' | 'growth' | 'scale';

export const PLAN_LIMITS = {
  free: {
    monitors: 10,
    checkIntervalSeconds: 300,
    historyDays: 7,
    statusPages: 1,
    teamMembers: 1,
    alertChannels: 1,
    regions: 0,
    competitorMonitors: 0,
  },
  starter: {
    monitors: 25,
    checkIntervalSeconds: 60,
    historyDays: 30,
    statusPages: 3,
    teamMembers: 3,
    alertChannels: -1,
    regions: 0,
    competitorMonitors: 5,
  },
  growth: {
    monitors: 100,
    checkIntervalSeconds: 60,
    historyDays: 90,
    statusPages: 10,
    teamMembers: 10,
    alertChannels: -1,
    regions: 5,
    competitorMonitors: 25,
  },
  scale: {
    monitors: -1,
    checkIntervalSeconds: 30,
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

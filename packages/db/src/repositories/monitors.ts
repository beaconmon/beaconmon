import { prisma } from '../index.js';
import type { MonitorStatus, MonitorType } from '@beaconmon/types';

export interface MonitorForCheck {
  id: string;
  teamId: string;
  name: string;
  url: string;
  type: MonitorType;
  intervalSeconds: number;
  timeoutMs: number;
  currentStatus: MonitorStatus;
  consecutiveFailures: number;
  config: Record<string, unknown>;
  contentSnapshot: string | null;
  keyword: string | null;
  keywordCondition: 'present' | 'absent' | null;
  escalationPolicyId: string | null;
  anomalyDetectionEnabled: boolean;
  isCompetitor: boolean;
  instantAlerts: boolean;
}

/**
 * Monitor + the team's raw plan/billing state. The worker resolves the
 * effective plan (e.g. trial expiry → free) so this stays a pure data lookup.
 */
export interface MonitorWithPlan extends MonitorForCheck {
  teamPlan: string;
  teamTrialEndsAt: Date | null;
  teamSubscriptionStatus: string | null;
}

export interface UpdateAfterCheckData {
  currentStatus: MonitorStatus;
  consecutiveFailures: number;
  lastCheckedAt: Date;
}

export const monitorRepository = {
  // Worker-only: called with monitorId from trusted job payloads, not user input.
  // Web-facing repositories in apps/web/lib/repositories/ must always scope by teamId.
  async findById(monitorId: string): Promise<MonitorForCheck | null> {
    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      select: {
        id: true,
        teamId: true,
        name: true,
        url: true,
        type: true,
        intervalSeconds: true,
        timeoutMs: true,
        currentStatus: true,
        consecutiveFailures: true,
        config: true,
        contentSnapshot: true,
        keyword: true,
        keywordCondition: true,
        escalationPolicyId: true,
        anomalyDetectionEnabled: true,
        isCompetitor: true,
        instantAlerts: true,
      },
    });

    if (!monitor) return null;

    return {
      ...monitor,
      type: monitor.type as MonitorType,
      currentStatus: monitor.currentStatus as MonitorStatus,
      config: monitor.config as Record<string, unknown>,
      contentSnapshot: monitor.contentSnapshot,
      keyword: monitor.keyword,
      keywordCondition: monitor.keywordCondition as 'present' | 'absent' | null,
      escalationPolicyId: monitor.escalationPolicyId,
      anomalyDetectionEnabled: monitor.anomalyDetectionEnabled,
      isCompetitor: monitor.isCompetitor,
      instantAlerts: monitor.instantAlerts,
    };
  },

  // Worker-only: returns the monitor plus the team's plan / billing state so
  // the caller can plan-gate downstream work (e.g. AI analysis). Kept separate
  // from `findById` so existing callers don't pay the extra join.
  async findByIdWithPlan(monitorId: string): Promise<MonitorWithPlan | null> {
    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      select: {
        id: true,
        teamId: true,
        name: true,
        url: true,
        type: true,
        intervalSeconds: true,
        timeoutMs: true,
        currentStatus: true,
        consecutiveFailures: true,
        config: true,
        contentSnapshot: true,
        keyword: true,
        keywordCondition: true,
        escalationPolicyId: true,
        anomalyDetectionEnabled: true,
        isCompetitor: true,
        instantAlerts: true,
        team: {
          select: {
            plan: true,
            trialEndsAt: true,
            subscription: { select: { status: true } },
          },
        },
      },
    });

    if (!monitor) return null;

    return {
      id: monitor.id,
      teamId: monitor.teamId,
      name: monitor.name,
      url: monitor.url,
      type: monitor.type as MonitorType,
      intervalSeconds: monitor.intervalSeconds,
      timeoutMs: monitor.timeoutMs,
      currentStatus: monitor.currentStatus as MonitorStatus,
      consecutiveFailures: monitor.consecutiveFailures,
      config: monitor.config as Record<string, unknown>,
      contentSnapshot: monitor.contentSnapshot,
      keyword: monitor.keyword,
      keywordCondition: monitor.keywordCondition as 'present' | 'absent' | null,
      escalationPolicyId: monitor.escalationPolicyId,
      anomalyDetectionEnabled: monitor.anomalyDetectionEnabled,
      isCompetitor: monitor.isCompetitor,
      instantAlerts: monitor.instantAlerts,
      teamPlan: monitor.team.plan,
      teamTrialEndsAt: monitor.team.trialEndsAt,
      teamSubscriptionStatus: monitor.team.subscription?.status ?? null,
    };
  },

  async updateAfterCheck(
    monitorId: string,
    data: UpdateAfterCheckData
  ): Promise<void> {
    await prisma.monitor.update({
      where: { id: monitorId },
      data: {
        currentStatus: data.currentStatus,
        consecutiveFailures: data.consecutiveFailures,
        lastCheckedAt: data.lastCheckedAt,
      },
    });
  },

  async updateNextCheckAt(monitorId: string, nextCheckAt: Date): Promise<void> {
    await prisma.monitor.update({
      where: { id: monitorId },
      data: { nextCheckAt },
    });
  },

  async updateContentSnapshot(
    monitorId: string,
    snapshot: string,
    changedAt: Date
  ): Promise<void> {
    await prisma.monitor.update({
      where: { id: monitorId },
      data: { contentSnapshot: snapshot, contentLastChangedAt: changedAt },
    });
  },
};

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

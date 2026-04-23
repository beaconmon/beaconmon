import { prisma } from '@beaconmon/db';
import type { Prisma } from '@beaconmon/db';
import type { CreateMonitorInput, UpdateMonitorInput } from '@/lib/validations/monitors';

export interface MonitorRow {
  id: string;
  name: string;
  url: string;
  type: string;
  isActive: boolean;
  currentStatus: string;
  intervalSeconds: number;
  timeoutMs: number;
  lastCheckedAt: Date | null;
  nextCheckAt: Date | null;
  responseTimeThresholdMs: number | null;
  keyword: string | null;
  keywordCondition: string | null;
  config: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface BatchResult {
  count: number;
}

export const monitorRepository: {
  findAll(teamId: string): Promise<MonitorRow[]>;
  findById(teamId: string, monitorId: string): Promise<MonitorRow | null>;
  create(teamId: string, data: CreateMonitorInput): Promise<MonitorRow>;
  update(teamId: string, monitorId: string, data: UpdateMonitorInput): Promise<BatchResult>;
  softDelete(teamId: string, monitorId: string): Promise<BatchResult>;
  countByTeam(teamId: string): Promise<number>;
} = {
  async findAll(teamId) {
    const rows = await prisma.monitor.findMany({
      where: { teamId, deletedAt: null },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        isActive: true,
        currentStatus: true,
        intervalSeconds: true,
        timeoutMs: true,
        lastCheckedAt: true,
        nextCheckAt: true,
        responseTimeThresholdMs: true,
        keyword: true,
        keywordCondition: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows as MonitorRow[];
  },

  async findById(teamId, monitorId) {
    const row = await prisma.monitor.findFirst({
      where: { id: monitorId, teamId, deletedAt: null },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        isActive: true,
        currentStatus: true,
        intervalSeconds: true,
        timeoutMs: true,
        lastCheckedAt: true,
        nextCheckAt: true,
        responseTimeThresholdMs: true,
        keyword: true,
        keywordCondition: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row as MonitorRow | null;
  },

  async create(teamId, data) {
    const row = await prisma.monitor.create({
      data: {
        teamId,
        name: data.name,
        url: data.url,
        type: data.type,
        intervalSeconds: data.intervalSeconds,
        timeoutMs: data.timeoutMs ?? 30000,
        responseTimeThresholdMs: data.responseTimeThresholdMs ?? null,
        keyword: data.keyword ?? null,
        keywordCondition: data.keywordCondition ?? null,
        config: (data.config ?? {}) as unknown as Prisma.InputJsonValue,
        // Make immediately eligible for the scheduler to pick up
        nextCheckAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        isActive: true,
        currentStatus: true,
        intervalSeconds: true,
        timeoutMs: true,
        lastCheckedAt: true,
        nextCheckAt: true,
        responseTimeThresholdMs: true,
        keyword: true,
        keywordCondition: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row as MonitorRow;
  },

  async update(teamId, monitorId, data) {
    return prisma.monitor.updateMany({
      where: { id: monitorId, teamId, deletedAt: null },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.intervalSeconds !== undefined && { intervalSeconds: data.intervalSeconds }),
        ...(data.timeoutMs !== undefined && { timeoutMs: data.timeoutMs }),
        ...(data.responseTimeThresholdMs !== undefined && {
          responseTimeThresholdMs: data.responseTimeThresholdMs,
        }),
        ...(data.keyword !== undefined && { keyword: data.keyword }),
        ...(data.keywordCondition !== undefined && { keywordCondition: data.keywordCondition }),
        ...(data.config !== undefined && { config: data.config as unknown as Prisma.InputJsonValue }),
      },
    });
  },

  async softDelete(teamId, monitorId) {
    return prisma.monitor.updateMany({
      where: { id: monitorId, teamId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  },

  async countByTeam(teamId) {
    return prisma.monitor.count({
      where: { teamId, deletedAt: null },
    });
  },
};

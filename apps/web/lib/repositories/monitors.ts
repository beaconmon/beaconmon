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
  isCompetitor: boolean;
  instantAlerts: boolean;
  anomalyDetectionEnabled: boolean;
  tags: string[];
  lastHeartbeatAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BatchResult {
  count: number;
}

export const monitorRepository: {
  findAll(teamId: string, opts?: { tag?: string }): Promise<MonitorRow[]>;
  findById(teamId: string, monitorId: string): Promise<MonitorRow | null>;
  create(teamId: string, data: CreateMonitorInput): Promise<MonitorRow>;
  bulkCreate(teamId: string, inputs: CreateMonitorInput[]): Promise<MonitorRow[]>;
  update(teamId: string, monitorId: string, data: UpdateMonitorInput): Promise<BatchResult>;
  softDelete(teamId: string, monitorId: string): Promise<BatchResult>;
  countByTeam(teamId: string): Promise<number>;
  listTags(teamId: string): Promise<string[]>;
  bulkSetActive(teamId: string, monitorIds: string[], isActive: boolean): Promise<BatchResult>;
  bulkSoftDelete(teamId: string, monitorIds: string[]): Promise<BatchResult>;
  bulkSetInterval(teamId: string, monitorIds: string[], intervalSeconds: number): Promise<BatchResult>;
  bulkAddTag(teamId: string, monitorIds: string[], tag: string): Promise<BatchResult>;
} = {
  async findAll(teamId, opts) {
    const where: Prisma.MonitorWhereInput = { teamId, deletedAt: null };
    if (opts?.tag) where.tags = { has: opts.tag };

    const rows = await prisma.monitor.findMany({
      where,
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
        isCompetitor: true,
        instantAlerts: true,
        anomalyDetectionEnabled: true,
        tags: true,
        lastHeartbeatAt: true,
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
        isCompetitor: true,
        instantAlerts: true,
        anomalyDetectionEnabled: true,
        tags: true,
        lastHeartbeatAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row as MonitorRow | null;
  },

  async create(teamId, data) {
    // Heartbeat monitors get a secret token stored in config for the ping endpoint
    const config = data.type === 'heartbeat'
      ? { ...data.config, token: crypto.randomUUID() }
      : (data.config ?? {});

    const row = await prisma.monitor.create({
      data: {
        teamId,
        name: data.name,
        url: data.url ?? '',
        type: data.type,
        intervalSeconds: data.intervalSeconds,
        timeoutMs: data.timeoutMs ?? 30000,
        responseTimeThresholdMs: data.responseTimeThresholdMs ?? null,
        keyword: data.keyword ?? null,
        keywordCondition: data.keywordCondition ?? null,
        config: config as unknown as Prisma.InputJsonValue,
        isCompetitor: data.isCompetitor ?? false,
        tags: dedupeTags(data.tags),
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
        isCompetitor: true,
        instantAlerts: true,
        anomalyDetectionEnabled: true,
        tags: true,
        lastHeartbeatAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row as MonitorRow;
  },

  async bulkCreate(teamId, inputs) {
    if (inputs.length === 0) return [];

    const now = new Date();
    const rows = await prisma.$transaction(
      inputs.map((data) => {
        const config = data.type === 'heartbeat'
          ? { ...data.config, token: crypto.randomUUID() }
          : (data.config ?? {});
        return prisma.monitor.create({
          data: {
            teamId,
            name: data.name,
            url: data.url ?? '',
            type: data.type,
            intervalSeconds: data.intervalSeconds,
            timeoutMs: data.timeoutMs ?? 30000,
            responseTimeThresholdMs: data.responseTimeThresholdMs ?? null,
            keyword: data.keyword ?? null,
            keywordCondition: data.keywordCondition ?? null,
            config: config as unknown as Prisma.InputJsonValue,
            isCompetitor: data.isCompetitor ?? false,
            tags: dedupeTags(data.tags),
            nextCheckAt: now,
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
            isCompetitor: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      })
    );
    return rows as MonitorRow[];
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
        ...(data.isCompetitor !== undefined && { isCompetitor: data.isCompetitor }),
        ...(data.instantAlerts !== undefined && { instantAlerts: data.instantAlerts }),
        ...(data.anomalyDetectionEnabled !== undefined && { anomalyDetectionEnabled: data.anomalyDetectionEnabled }),
        ...(data.tags !== undefined && { tags: dedupeTags(data.tags) }),
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

  async listTags(teamId) {
    const rows = await prisma.monitor.findMany({
      where: { teamId, deletedAt: null },
      select: { tags: true },
    });
    const set = new Set<string>();
    for (const r of rows) {
      for (const t of r.tags) set.add(t);
    }
    return Array.from(set).sort();
  },

  async bulkSetActive(teamId, monitorIds, isActive) {
    return prisma.monitor.updateMany({
      where: { id: { in: monitorIds }, teamId, deletedAt: null },
      data: {
        isActive,
        ...(isActive ? { nextCheckAt: new Date() } : {}),
      },
    });
  },

  async bulkSoftDelete(teamId, monitorIds) {
    return prisma.monitor.updateMany({
      where: { id: { in: monitorIds }, teamId, deletedAt: null },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  },

  async bulkSetInterval(teamId, monitorIds, intervalSeconds) {
    return prisma.monitor.updateMany({
      where: { id: { in: monitorIds }, teamId, deletedAt: null },
      data: { intervalSeconds },
    });
  },

  async bulkAddTag(teamId, monitorIds, tag) {
    // No native array-append in updateMany — fetch + update in transaction
    const rows = await prisma.monitor.findMany({
      where: { id: { in: monitorIds }, teamId, deletedAt: null },
      select: { id: true, tags: true },
    });
    const toUpdate = rows.filter((r) => !r.tags.includes(tag));
    await prisma.$transaction(
      toUpdate.map((r) =>
        prisma.monitor.update({
          where: { id: r.id },
          data: { tags: dedupeTags([...r.tags, tag]) },
        })
      )
    );
    return { count: toUpdate.length };
  },
};

function dedupeTags(tags?: string[]): string[] {
  if (!tags || tags.length === 0) return [];
  return Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
}

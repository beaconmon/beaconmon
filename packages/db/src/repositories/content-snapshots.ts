import { prisma } from '../index.js';

export interface ContentSnapshotRecord {
  id: string;
  monitorId: string;
  content: string;
  capturedAt: Date;
  diffSummary: string | null;
}

export interface AttachAiAnalysisInput {
  monitorId: string;
  capturedAt: Date;
  summary: string;
  classification: string;
  model: string;
}

export interface DigestSnapshotRow {
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  snapshotId: string;
  capturedAt: Date;
  content: string;
  diffSummary: string | null;
  classification: string | null;
}

export const contentSnapshotWorkerRepository = {
  /**
   * Record a new snapshot for a content monitor and update the monitor's hot
   * snapshot column atomically. Workers call this on every detected change.
   */
  async recordChange(
    monitorId: string,
    teamId: string,
    content: string,
    capturedAt: Date
  ): Promise<ContentSnapshotRecord | null> {
    // Dedup guard: if the latest snapshot already has this content (e.g. from a
    // concurrent initialization), just sync the hot column and skip the insert.
    const latest = await prisma.contentSnapshot.findFirst({
      where: { monitorId },
      select: { content: true },
      orderBy: { capturedAt: 'desc' },
    });

    if (latest?.content === content) {
      await prisma.monitor.update({
        where: { id: monitorId },
        data: { contentSnapshot: content },
        select: { id: true },
      });
      return null;
    }

    const [snapshot] = await prisma.$transaction([
      prisma.contentSnapshot.create({
        data: { monitorId, teamId, content, capturedAt },
        select: {
          id: true,
          monitorId: true,
          content: true,
          capturedAt: true,
          diffSummary: true,
        },
      }),
      prisma.monitor.update({
        where: { id: monitorId },
        data: { contentSnapshot: content, contentLastChangedAt: capturedAt },
        select: { id: true },
      }),
    ]);

    return snapshot;
  },

  /**
   * Attach AI summary + classification to a previously-persisted snapshot.
   * Looked up by (monitorId, capturedAt) since `recordChange` writes both.
   * Idempotent: re-running with the same input is a no-op overwrite.
   * Returns the number of rows updated (0 if the snapshot was pruned in between).
   */
  async attachAiAnalysis(input: AttachAiAnalysisInput): Promise<number> {
    const result = await prisma.contentSnapshot.updateMany({
      where: { monitorId: input.monitorId, capturedAt: input.capturedAt },
      data: {
        diffSummary: input.summary,
        classification: input.classification,
        aiModel: input.model,
        aiAnalyzedAt: new Date(),
      },
    });
    return result.count;
  },

  /**
   * Delete snapshots beyond the retention limit per monitor.
   * Keeps the latest `keepCount` snapshots and drops the rest.
   * Returns the number of rows deleted.
   */
  async pruneToLimit(monitorId: string, keepCount: number): Promise<number> {
    if (keepCount < 0) return 0;

    const survivors = await prisma.contentSnapshot.findMany({
      where: { monitorId },
      select: { id: true },
      orderBy: { capturedAt: 'desc' },
      take: keepCount,
    });

    if (survivors.length === 0) {
      // No survivors == nothing to keep; only delete if there is anything at all.
      const result = await prisma.contentSnapshot.deleteMany({ where: { monitorId } });
      return result.count;
    }

    const result = await prisma.contentSnapshot.deleteMany({
      where: {
        monitorId,
        id: { notIn: survivors.map((s) => s.id) },
      },
    });
    return result.count;
  },

  /**
   * Returns all content snapshots for a team's competitor monitors within a time window.
   * Used by the daily digest worker to build the email body.
   */
  async findSnapshotsForDigest(
    teamId: string,
    windowStart: Date,
    windowEnd: Date
  ): Promise<DigestSnapshotRow[]> {
    const rows = await prisma.contentSnapshot.findMany({
      where: {
        teamId,
        capturedAt: { gte: windowStart, lte: windowEnd },
        monitor: { isCompetitor: true, isActive: true, deletedAt: null },
      },
      select: {
        id: true,
        monitorId: true,
        capturedAt: true,
        content: true,
        diffSummary: true,
        classification: true,
        monitor: { select: { name: true, url: true } },
      },
      orderBy: { capturedAt: 'asc' },
    });

    return rows.map((r) => ({
      monitorId: r.monitorId,
      monitorName: r.monitor.name,
      monitorUrl: r.monitor.url,
      snapshotId: r.id,
      capturedAt: r.capturedAt,
      content: r.content,
      diffSummary: r.diffSummary,
      classification: r.classification,
    }));
  },

  /**
   * Returns all monitors that have any content snapshots stored, paired with the
   * effective plan (free/pro/business) so the scheduler can prune per-team limits.
   * `Team` plan is returned raw — caller resolves trial expiry to an effective tier.
   */
  async findContentMonitorsWithTeamPlan(): Promise<
    Array<{
      monitorId: string;
      teamId: string;
      plan: string;
      trialEndsAt: Date | null;
      subscriptionStatus: string | null;
    }>
  > {
    const rows = await prisma.monitor.findMany({
      where: {
        type: 'content',
        deletedAt: null,
      },
      select: {
        id: true,
        teamId: true,
        team: {
          select: {
            plan: true,
            trialEndsAt: true,
            subscription: { select: { status: true } },
          },
        },
      },
    });

    return rows.map((r) => ({
      monitorId: r.id,
      teamId: r.teamId,
      plan: r.team.plan,
      trialEndsAt: r.team.trialEndsAt,
      subscriptionStatus: r.team.subscription?.status ?? null,
    }));
  },
};

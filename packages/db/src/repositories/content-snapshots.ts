import { prisma } from '../index.js';

export interface ContentSnapshotRecord {
  id: string;
  monitorId: string | null;
  content: string;
  capturedAt: Date;
  diffSummary: string | null;
}

export interface AttachAiAnalysisInput {
  monitorId: string;
  capturedAt: Date;
  summary: string;
  classification: string;
  confidence?: number;
  model: string;
}

export interface DigestSnapshotRow {
  competitorPageId: string;
  competitorName: string;
  pageUrl: string;
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
   * Returns null when a recent duplicate was detected (caller already checked
   * a Redis NX key — this path should only be hit on Redis unavailability).
   */
  async recordChange(
    monitorId: string,
    teamId: string,
    content: string,
    capturedAt: Date,
    contentHash: string
  ): Promise<ContentSnapshotRecord | null> {
    const [snapshot] = await prisma.$transaction([
      prisma.contentSnapshot.create({
        data: { monitorId, teamId, content, contentHash, capturedAt },
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
        aiConfidence: input.confidence,
        aiModel: input.model,
        aiAnalyzedAt: new Date(),
      },
    });
    return result.count;
  },

  async recordChangeForCompetitorPage(
    competitorPageId: string,
    teamId: string,
    content: string,
    capturedAt: Date,
    contentHash: string
  ): Promise<ContentSnapshotRecord> {
    return prisma.contentSnapshot.create({
      data: { competitorPageId, teamId, content, contentHash, capturedAt },
      select: {
        id: true,
        monitorId: true,
        content: true,
        capturedAt: true,
        diffSummary: true,
      },
    });
  },

  async attachAiAnalysisById(
    snapshotId: string,
    data: { summary: string; classification: string; confidence?: number; model: string }
  ): Promise<void> {
    await prisma.contentSnapshot.update({
      where: { id: snapshotId },
      data: {
        diffSummary: data.summary,
        classification: data.classification,
        aiConfidence: data.confidence,
        aiModel: data.model,
        aiAnalyzedAt: new Date(),
      },
    });
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
        competitorPageId: { not: null },
        NOT: { classification: 'noise' },
        competitorPage: { isActive: true, competitor: { isActive: true } },
      },
      select: {
        id: true,
        competitorPageId: true,
        capturedAt: true,
        content: true,
        diffSummary: true,
        classification: true,
        competitorPage: { select: { url: true, competitor: { select: { name: true } } } },
      },
      orderBy: { capturedAt: 'asc' },
    });

    return rows.map((r) => ({
      competitorPageId: r.competitorPageId!,
      competitorName: r.competitorPage!.competitor.name,
      pageUrl: r.competitorPage!.url,
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

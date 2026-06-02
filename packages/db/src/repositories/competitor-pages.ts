import { prisma } from '../index.js';

export interface CompetitorPageWithPlan {
  id: string;
  competitorId: string;
  teamId: string;
  url: string;
  selector: string | null;
  intervalSeconds: number;
  lastSnapshotHash: string | null;
  lastCheckedAt: Date | null;
  nextCheckAt: Date | null;
  teamPlan: string;
  teamTrialEndsAt: Date | null;
  teamSubscriptionStatus: string | null;
}

export const competitorPageRepository = {
  async findDueForCheck(now: Date): Promise<
    Array<{
      id: string;
      competitorId: string;
      teamId: string;
      url: string;
      selector: string | null;
      intervalSeconds: number;
    }>
  > {
    return prisma.competitorPage.findMany({
      where: {
        isActive: true,
        nextCheckAt: { lte: now },
      },
      select: {
        id: true,
        competitorId: true,
        teamId: true,
        url: true,
        selector: true,
        intervalSeconds: true,
      },
    });
  },

  async findByIdWithPlan(id: string): Promise<CompetitorPageWithPlan | null> {
    const row = await prisma.competitorPage.findUnique({
      where: { id },
      select: {
        id: true,
        competitorId: true,
        teamId: true,
        url: true,
        selector: true,
        intervalSeconds: true,
        lastSnapshotHash: true,
        lastCheckedAt: true,
        nextCheckAt: true,
        team: {
          select: {
            plan: true,
            trialEndsAt: true,
            subscription: { select: { status: true } },
          },
        },
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      competitorId: row.competitorId,
      teamId: row.teamId,
      url: row.url,
      selector: row.selector,
      intervalSeconds: row.intervalSeconds,
      lastSnapshotHash: row.lastSnapshotHash,
      lastCheckedAt: row.lastCheckedAt,
      nextCheckAt: row.nextCheckAt,
      teamPlan: row.team.plan,
      teamTrialEndsAt: row.team.trialEndsAt,
      teamSubscriptionStatus: row.team.subscription?.status ?? null,
    };
  },

  async updateAfterCheck(
    id: string,
    data: { lastSnapshotHash?: string; lastCheckedAt: Date; nextCheckAt: Date }
  ): Promise<void> {
    await prisma.competitorPage.update({
      where: { id },
      data: {
        ...(data.lastSnapshotHash !== undefined ? { lastSnapshotHash: data.lastSnapshotHash } : {}),
        lastCheckedAt: data.lastCheckedAt,
        nextCheckAt: data.nextCheckAt,
      },
    });
  },
};

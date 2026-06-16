import { prisma } from '../index.js';

// Backoff cap: never reschedule a failing competitor page further out than 7 days.
// Competitor pages are NOT incidents (see CLAUDE.md) so there is no "down" semantics
// here; the only goal is politeness. A page that keeps failing is almost always a WAF
// block (Cloudflare 403/429), a removed URL, or a site that has gone dark. We must not
// keep hammering it hourly forever (a real case: youthtothepeople.com failed 98 times
// in a row behind Cloudflare). The 7-day ceiling means even a permanently broken page
// is retried roughly weekly, which is enough to notice a recovery without abusing the
// origin or risking an IP block across our 600+ monitored sites.
const BACKOFF_CAP_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Status codes that indicate a hard block (WAF / rate limit / auth wall) rather than a
// transient hiccup. When we see these we back off harder and faster so we stop poking
// the WAF almost immediately.
const HARD_BLOCK_STATUS_CODES = new Set([401, 403, 429, 503]);
const HARD_BLOCK_FLOOR_SECONDS = 6 * 60 * 60; // 6 hours

/**
 * Pure helper: given the NEW consecutive-failure count, compute how many seconds to wait
 * before the next check. Exported so it can be unit-tested without a database.
 *
 * Backoff schedule (based on the incremented failure count):
 *   - failures 1..2: normal interval, no penalty yet (transient blips are common).
 *   - failures >= 3: exponential backoff of intervalSeconds * 2^(failures-2),
 *     so 3 fails = 2x, 4 = 4x, 5 = 8x, ... capped at BACKOFF_CAP_SECONDS (7 days).
 *   - hard block (401/403/429/503): floor the wait at max(6h, computed backoff) so we
 *     stop hammering WAFs quickly, still capped at 7 days.
 */
export function computeFailureBackoffSeconds(
  failures: number,
  intervalSeconds: number,
  statusCode?: number | null
): number {
  // Failures 1 and 2 keep the normal cadence.
  let backoff = intervalSeconds;

  if (failures >= 3) {
    // 2^(failures-2): 3 -> 2x, 4 -> 4x, 5 -> 8x, ...
    const multiplier = 2 ** (failures - 2);
    backoff = intervalSeconds * multiplier;
  }

  // Hard blocks get a steep floor regardless of the normal schedule so we retreat from
  // WAFs immediately rather than waiting for the exponential curve to climb.
  if (statusCode != null && HARD_BLOCK_STATUS_CODES.has(statusCode)) {
    backoff = Math.max(HARD_BLOCK_FLOOR_SECONDS, backoff);
  }

  // Never wait longer than the 7-day ceiling.
  return Math.min(backoff, BACKOFF_CAP_SECONDS);
}

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
        competitor: { isActive: true, deletedAt: null },
        OR: [{ nextCheckAt: null }, { nextCheckAt: { lte: now } }],
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
        consecutiveFailures: 0,
      },
    });
  },

  /**
   * Record a failed check: bump the failure counter and reschedule with exponential
   * backoff so a persistently-failing page (WAF block, dead URL) is not hammered at
   * its normal interval forever. The next-check time is computed from the NEW failure
   * count via computeFailureBackoffSeconds, so the backoff stiffens as failures pile up.
   * Returns the new consecutive failure count so the caller can log it.
   */
  async recordCheckFailure(
    id: string,
    data: { lastCheckedAt: Date; intervalSeconds: number; statusCode?: number | null }
  ): Promise<number> {
    // The backoff depends on the post-increment count, so we increment first and
    // then set nextCheckAt. Run both in one transaction so a failure counter never
    // advances without its matching nextCheckAt being rescheduled.
    return prisma.$transaction(async (tx) => {
      const row = await tx.competitorPage.update({
        where: { id },
        data: {
          lastCheckedAt: data.lastCheckedAt,
          consecutiveFailures: { increment: 1 },
        },
        select: { consecutiveFailures: true },
      });

      const backoffSeconds = computeFailureBackoffSeconds(
        row.consecutiveFailures,
        data.intervalSeconds,
        data.statusCode
      );
      const nextCheckAt = new Date(data.lastCheckedAt.getTime() + backoffSeconds * 1000);

      await tx.competitorPage.update({
        where: { id },
        data: { nextCheckAt },
      });

      return row.consecutiveFailures;
    });
  },
};

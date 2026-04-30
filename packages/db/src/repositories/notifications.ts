import { Prisma } from '../index.js';
import { prisma } from '../index.js';

export type NotificationKind = 'down' | 'up';

export interface ClaimNotificationData {
  teamId: string;
  incidentId: string;
  channelId: string;
  kind: NotificationKind;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * Floor a timestamp to the nearest 5-minute bucket. The unique index in the DB
 * is on (incidentId, channelId, kind, bucket), so two concurrent jobs in the
 * same 5-min window will collide on insert.
 */
function fiveMinuteBucket(at: Date = new Date()): Date {
  return new Date(Math.floor(at.getTime() / FIVE_MINUTES_MS) * FIVE_MINUTES_MS);
}

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
  );
}

export const notificationRepository = {
  /**
   * Returns true if a notification has already been DELIVERED (sent_at non-null)
   * for this (incidentId, channelId) within the rolling window. Used as a fast
   * pre-send check so we don't re-send for spread-out duplicates (BullMQ retry
   * after a long backoff). The actual race-protection is the unique index hit
   * by `tryClaim`.
   */
  async existsRecent(
    teamId: string,
    incidentId: string,
    channelId: string,
    windowMinutes: number
  ): Promise<boolean> {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);

    const notification = await prisma.notification.findFirst({
      where: {
        teamId,
        incidentId,
        channelId,
        sentAt: { gte: cutoff },
      },
      select: { id: true },
    });

    return notification !== null;
  },

  /**
   * Atomically reserve the (incidentId, channelId, kind, bucket) slot.
   * Returns the claim's id on success, or null if another worker already
   * holds the claim (unique-index P2002).
   *
   * The caller MUST follow up with `markSent` (success) or `releaseClaim`
   * (send failure) so retries can re-claim a poisoned slot.
   */
  async tryClaim(data: ClaimNotificationData): Promise<{ id: string; bucket: Date } | null> {
    const bucket = fiveMinuteBucket();
    try {
      const row = await prisma.notification.create({
        data: {
          teamId: data.teamId,
          incidentId: data.incidentId,
          channelId: data.channelId,
          kind: data.kind,
          sentWindowBucket: bucket,
          sentAt: null,
        },
        select: { id: true },
      });
      return { id: row.id, bucket };
    } catch (err) {
      if (isUniqueViolation(err)) {
        return null;
      }
      throw err;
    }
  },

  /** Mark a previously-claimed row as delivered. */
  async markSent(claimId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: claimId },
      data: { sentAt: new Date() },
    });
  },

  /**
   * Delete a claim row whose send failed, so a subsequent retry of the alert
   * job can re-claim the same (incidentId, channelId, kind, bucket) slot.
   */
  async releaseClaim(claimId: string): Promise<void> {
    await prisma.notification.delete({ where: { id: claimId } }).catch((err) => {
      // If it's already gone (race with another retry that succeeded), that's fine.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        return;
      }
      throw err;
    });
  },
};

import { PLAN_LIMITS, type PlanTier } from '@beaconmon/types';
import { prisma } from '../index.js';

export interface AlertChannel {
  id: string;
  teamId: string;
  name: string;
  type: string;
  config: unknown;
  isActive: boolean;
}

export interface DisabledChannel {
  id: string;
  type: string;
  name: string;
}

export const alertChannelRepository = {
  async validateChannelIds(channelIds: string[], teamId: string): Promise<boolean> {
    const count = await prisma.alertChannel.count({
      where: { id: { in: channelIds }, teamId },
    });
    return count === channelIds.length;
  },

  async findActiveByTeamId(teamId: string): Promise<AlertChannel[]> {
    return prisma.alertChannel.findMany({
      where: { teamId, isActive: true, disabledAt: null },
      select: {
        id: true,
        teamId: true,
        name: true,
        type: true,
        config: true,
        isActive: true,
      },
    });
  },

  /**
   * Soft-disable channels exceeding the given plan's `alertChannels` cap,
   * oldest-first. Returns the disabled rows so callers can log/audit.
   *
   * No-op for unlimited plans (cap === -1) or when team is already at/under cap.
   * Already-disabled channels are not double-disabled.
   */
  async disableSurplusForPlan(
    teamId: string,
    plan: PlanTier
  ): Promise<DisabledChannel[]> {
    const cap = PLAN_LIMITS[plan].alertChannels;
    if (cap < 0) return []; // unlimited (Business)

    // Eligible = currently-live channels (not already system-disabled).
    // Order oldest-first; the team gets to keep their first `cap` channels.
    const live = await prisma.alertChannel.findMany({
      where: { teamId, disabledAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true, type: true, name: true },
    });

    if (live.length <= cap) return [];

    const surplus = live.slice(cap);
    const surplusIds = surplus.map((c) => c.id);

    await prisma.alertChannel.updateMany({
      where: { id: { in: surplusIds } },
      data: {
        disabledAt: new Date(),
        disabledReason: `plan_downgrade:${plan}`,
      },
    });

    return surplus;
  },
};

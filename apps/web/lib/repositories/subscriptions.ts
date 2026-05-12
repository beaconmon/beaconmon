import { prisma } from '@beaconmon/db';
import type { PlanTier } from '@beaconmon/types';

type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';

export interface SubscriptionRow {
  teamId: string;
  plan: string;
  status: string;
  billingPeriod: 'monthly' | 'annual';
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
  freemiusUserId: string | null;
  freemiusSubscriptionId: string | null;
}

export interface FreemiusSubscriptionCreateData {
  freemiusUserId: string;
  freemiusSubscriptionId: string;
  plan: PlanTier;
  billingPeriod: 'monthly' | 'annual';
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
}

export interface FreemiusSubscriptionUpdateData {
  plan: PlanTier;
  billingPeriod: 'monthly' | 'annual';
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  freemiusSubscriptionId: string;
}

export const subscriptionRepository: {
  findByTeamId(teamId: string): Promise<SubscriptionRow | null>;
  findTeamIdByOwnerEmail(email: string): Promise<string | null>;
  updateBillingPeriod(teamId: string, billingPeriod: 'monthly' | 'annual'): Promise<void>;
  createFromFreemiusEvent(teamId: string, data: FreemiusSubscriptionCreateData): Promise<void>;
  updateFromFreemiusEvent(freemiusUserId: string, data: FreemiusSubscriptionUpdateData): Promise<{ teamId: string } | null>;
  cancelFromFreemiusEvent(freemiusUserId: string): Promise<{ teamId: string } | null>;
} = {
  async findByTeamId(teamId) {
    const row = await prisma.subscription.findUnique({
      where: { teamId },
      select: {
        teamId: true,
        plan: true,
        status: true,
        billingPeriod: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
        freemiusUserId: true,
        freemiusSubscriptionId: true,
      },
    });
    return row as SubscriptionRow | null;
  },

  // First-event team lookup: Freemius has no metadata passthrough, so on
  // subscription.created we resolve the team via the buyer email — which
  // matches the team owner's user email (set during signup).
  async findTeamIdByOwnerEmail(email) {
    const membership = await prisma.teamMember.findFirst({
      where: {
        role: 'owner',
        user: { email },
      },
      select: { teamId: true },
      orderBy: { createdAt: 'asc' },
    });
    return membership?.teamId ?? null;
  },

  async updateBillingPeriod(teamId, billingPeriod) {
    await prisma.subscription.update({
      where: { teamId },
      data: { billingPeriod },
    });
  },

  async createFromFreemiusEvent(teamId, data) {
    await prisma.$transaction(async (tx) => {
      await tx.subscription.upsert({
        where: { teamId },
        create: {
          teamId,
          freemiusUserId: data.freemiusUserId,
          freemiusSubscriptionId: data.freemiusSubscriptionId,
          plan: data.plan,
          billingPeriod: data.billingPeriod,
          status: data.status,
          currentPeriodEnd: data.currentPeriodEnd,
        },
        update: {
          freemiusUserId: data.freemiusUserId,
          freemiusSubscriptionId: data.freemiusSubscriptionId,
          plan: data.plan,
          billingPeriod: data.billingPeriod,
          status: data.status,
          currentPeriodEnd: data.currentPeriodEnd,
        },
      });
      await tx.team.update({
        where: { id: teamId },
        data: { plan: data.plan },
      });
    });
  },

  async updateFromFreemiusEvent(freemiusUserId, data) {
    let capturedTeamId: string | undefined;
    await prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findUnique({
        where: { freemiusUserId },
        select: { teamId: true },
      });
      if (!existing) return;
      capturedTeamId = existing.teamId;
      await tx.subscription.update({
        where: { teamId: existing.teamId },
        data: {
          plan: data.plan,
          billingPeriod: data.billingPeriod,
          status: data.status,
          currentPeriodEnd: data.currentPeriodEnd,
          freemiusSubscriptionId: data.freemiusSubscriptionId,
        },
      });
      await tx.team.update({
        where: { id: existing.teamId },
        data: { plan: data.plan },
      });
    });
    return capturedTeamId ? { teamId: capturedTeamId } : null;
  },

  async cancelFromFreemiusEvent(freemiusUserId) {
    let capturedTeamId: string | undefined;
    await prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findUnique({
        where: { freemiusUserId },
        select: { teamId: true },
      });
      if (!existing) return;
      capturedTeamId = existing.teamId;
      await tx.subscription.update({
        where: { teamId: existing.teamId },
        data: { status: 'canceled', plan: 'free' },
      });
      await tx.team.update({
        where: { id: existing.teamId },
        data: { plan: 'free' },
      });
    });
    return capturedTeamId ? { teamId: capturedTeamId } : null;
  },
};

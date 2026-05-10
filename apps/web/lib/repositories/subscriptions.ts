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
  paddleCustomerId: string | null;
  paddleSubscriptionId: string | null;
}

export interface PaddleSubscriptionCreateData {
  paddleCustomerId: string;
  paddleSubscriptionId: string;
  plan: PlanTier;
  billingPeriod: 'monthly' | 'annual';
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
}

export interface PaddleSubscriptionUpdateData {
  plan: PlanTier;
  billingPeriod: 'monthly' | 'annual';
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  paddleSubscriptionId: string;
}

export const subscriptionRepository: {
  findByTeamId(teamId: string): Promise<SubscriptionRow | null>;
  updateBillingPeriod(teamId: string, billingPeriod: 'monthly' | 'annual'): Promise<void>;
  createFromPaddleEvent(teamId: string, data: PaddleSubscriptionCreateData): Promise<void>;
  updateFromPaddleEvent(paddleCustomerId: string, data: PaddleSubscriptionUpdateData): Promise<{ teamId: string } | null>;
  cancelFromPaddleEvent(paddleCustomerId: string): Promise<{ teamId: string } | null>;
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
        paddleCustomerId: true,
        paddleSubscriptionId: true,
      },
    });
    return row as SubscriptionRow | null;
  },

  async updateBillingPeriod(teamId, billingPeriod) {
    await prisma.subscription.update({
      where: { teamId },
      data: { billingPeriod },
    });
  },

  async createFromPaddleEvent(teamId, data) {
    await prisma.$transaction(async (tx) => {
      await tx.subscription.upsert({
        where: { teamId },
        create: {
          teamId,
          paddleCustomerId: data.paddleCustomerId,
          paddleSubscriptionId: data.paddleSubscriptionId,
          plan: data.plan,
          billingPeriod: data.billingPeriod,
          status: data.status,
          currentPeriodEnd: data.currentPeriodEnd,
        },
        update: {
          paddleCustomerId: data.paddleCustomerId,
          paddleSubscriptionId: data.paddleSubscriptionId,
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

  async updateFromPaddleEvent(paddleCustomerId, data) {
    let capturedTeamId: string | undefined;
    await prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findUnique({
        where: { paddleCustomerId },
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
          paddleSubscriptionId: data.paddleSubscriptionId,
        },
      });
      await tx.team.update({
        where: { id: existing.teamId },
        data: { plan: data.plan },
      });
    });
    return capturedTeamId ? { teamId: capturedTeamId } : null;
  },

  async cancelFromPaddleEvent(paddleCustomerId) {
    let capturedTeamId: string | undefined;
    await prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findUnique({
        where: { paddleCustomerId },
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

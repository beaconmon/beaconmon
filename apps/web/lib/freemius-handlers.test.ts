import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FreemiusWebhookEvent } from './freemius';

// ─── Mock dependencies ────────────────────────────────────────────────────────

vi.mock('@beaconmon/db', () => ({
  prisma: {
    monitor: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  },
  alertChannelRepository: {
    disableSurplusForPlan: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/lib/freemius', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./freemius')>();
  return {
    ...actual,
    planFromFreemiusPlanId: vi.fn().mockReturnValue('growth'),
    billingPeriodFromFreemiusCycle: vi.fn().mockReturnValue('monthly'),
    freemiusSubscriptionDataSchema: actual.freemiusSubscriptionDataSchema,
  };
});

vi.mock('@/lib/repositories/subscriptions', () => ({
  subscriptionRepository: {
    findTeamIdByOwnerEmail: vi.fn(),
    createFromFreemiusEvent: vi.fn().mockResolvedValue(undefined),
    updateFromFreemiusEvent: vi.fn().mockResolvedValue({ teamId: 'team-1' }),
    cancelFromFreemiusEvent: vi.fn().mockResolvedValue({ teamId: 'team-1' }),
  },
}));

vi.mock('@/lib/posthog-server', () => ({
  getPostHogClient: () => ({ capture: vi.fn() }),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeSubEvent(overrides: Partial<FreemiusWebhookEvent> = {}): FreemiusWebhookEvent {
  return {
    id: 'evt-1',
    type: 'subscription.created',
    data: {
      id: '42',
      user_id: '7',
      plan_id: '200',
      billing_cycle: 12,
      next_payment: '2027-05-23T00:00:00Z',
      user: { id: '7', email: 'buyer@example.com' },
    },
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('handleFreemiusEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscription.created — user_dictionary path', () => {
    it('creates subscription using teamId from user_dictionary', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      const event = makeSubEvent({
        data: {
          id: '42',
          user_id: '7',
          plan_id: '200',
          billing_cycle: 12,
          next_payment: null,
          user: { id: '7', email: 'different@example.com' },
          user_dictionary: { teamId: 'team-abc' },
        },
      });

      await handleFreemiusEvent(event);

      expect(subscriptionRepository.findTeamIdByOwnerEmail).not.toHaveBeenCalled();
      expect(subscriptionRepository.createFromFreemiusEvent).toHaveBeenCalledWith(
        'team-abc',
        expect.objectContaining({ freemiusUserId: '7', freemiusSubscriptionId: '42' })
      );
    });
  });

  describe('subscription.created — email fallback', () => {
    it('falls back to email lookup when user_dictionary is absent', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');
      vi.mocked(subscriptionRepository.findTeamIdByOwnerEmail).mockResolvedValue('team-from-email');

      await handleFreemiusEvent(makeSubEvent());

      expect(subscriptionRepository.findTeamIdByOwnerEmail).toHaveBeenCalledWith('buyer@example.com');
      expect(subscriptionRepository.createFromFreemiusEvent).toHaveBeenCalledWith(
        'team-from-email',
        expect.objectContaining({ freemiusSubscriptionId: '42' })
      );
    });

    it('skips when email lookup returns null', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');
      vi.mocked(subscriptionRepository.findTeamIdByOwnerEmail).mockResolvedValue(null);

      await handleFreemiusEvent(makeSubEvent());

      expect(subscriptionRepository.createFromFreemiusEvent).not.toHaveBeenCalled();
    });

    it('skips when email is missing and no user_dictionary', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      const event = makeSubEvent({
        data: { id: '42', user_id: '7', plan_id: '200' },
      });

      await handleFreemiusEvent(event);

      expect(subscriptionRepository.findTeamIdByOwnerEmail).not.toHaveBeenCalled();
      expect(subscriptionRepository.createFromFreemiusEvent).not.toHaveBeenCalled();
    });
  });

  describe('subscription.updated', () => {
    it('updates the subscription by freemiusUserId', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      const event: FreemiusWebhookEvent = { id: 'evt-2', type: 'subscription.updated', data: { id: '42', user_id: '7', plan_id: '200', billing_cycle: 1, next_payment: null } };
      await handleFreemiusEvent(event);

      expect(subscriptionRepository.updateFromFreemiusEvent).toHaveBeenCalledWith('7', expect.objectContaining({ status: 'active' }));
    });
  });

  describe('subscription.cancelled', () => {
    it('cancels by freemiusUserId', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      const event: FreemiusWebhookEvent = { id: 'evt-3', type: 'subscription.cancelled', data: { id: '42', user_id: '7' } };
      await handleFreemiusEvent(event);

      expect(subscriptionRepository.cancelFromFreemiusEvent).toHaveBeenCalledWith('7');
    });
  });

  describe('payment.failed', () => {
    it('marks subscription past_due', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      const event: FreemiusWebhookEvent = { id: 'evt-4', type: 'payment.failed', data: { id: '42', user_id: '7', plan_id: '200', billing_cycle: 1, next_payment: null } };
      await handleFreemiusEvent(event);

      expect(subscriptionRepository.updateFromFreemiusEvent).toHaveBeenCalledWith('7', expect.objectContaining({ status: 'past_due' }));
    });
  });

  describe('subscription.on_hold', () => {
    it('marks subscription past_due', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      const event: FreemiusWebhookEvent = { id: 'evt-5', type: 'subscription.on_hold', data: { id: '42', user_id: '7', plan_id: '200', billing_cycle: 1, next_payment: null } };
      await handleFreemiusEvent(event);

      expect(subscriptionRepository.updateFromFreemiusEvent).toHaveBeenCalledWith('7', expect.objectContaining({ status: 'past_due' }));
    });
  });

  describe('subscription.pending', () => {
    it('marks subscription incomplete', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      const event: FreemiusWebhookEvent = { id: 'evt-6', type: 'subscription.pending', data: { id: '42', user_id: '7', plan_id: '200', billing_cycle: 1, next_payment: null } };
      await handleFreemiusEvent(event);

      expect(subscriptionRepository.updateFromFreemiusEvent).toHaveBeenCalledWith('7', expect.objectContaining({ status: 'incomplete' }));
    });
  });

  describe('trial events', () => {
    it('is a no-op for subscription.trial_started', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      await handleFreemiusEvent({ id: 'evt-7', type: 'subscription.trial_started', data: {} });

      expect(subscriptionRepository.createFromFreemiusEvent).not.toHaveBeenCalled();
      expect(subscriptionRepository.updateFromFreemiusEvent).not.toHaveBeenCalled();
    });

    it('is a no-op for subscription.trial_expired', async () => {
      const { handleFreemiusEvent } = await import('./freemius-handlers');
      const { subscriptionRepository } = await import('@/lib/repositories/subscriptions');

      await handleFreemiusEvent({ id: 'evt-8', type: 'subscription.trial_expired', data: {} });

      expect(subscriptionRepository.updateFromFreemiusEvent).not.toHaveBeenCalled();
    });
  });
});

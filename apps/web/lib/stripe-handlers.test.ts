import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @beaconmon/db before importing the handler
vi.mock('@beaconmon/db', () => ({
  prisma: {
    $transaction: vi.fn(),
    subscription: {
      upsert: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    team: {
      update: vi.fn(),
    },
  },
}));

// Mock the logger so it doesn't pollute test output
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { handleStripeEvent } from './stripe-handlers';
import { prisma } from '@beaconmon/db';
import type Stripe from 'stripe';

const mockPrisma = prisma as unknown as {
  $transaction: ReturnType<typeof vi.fn>;
  subscription: {
    upsert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
  team: { update: ReturnType<typeof vi.fn> };
};

function makeEvent(type: string, data: object): Stripe.Event {
  return { id: 'evt_test', type, data: { object: data } } as unknown as Stripe.Event;
}

beforeEach(() => {
  vi.clearAllMocks();
  // Default: $transaction calls the callback with the mocked prisma
  mockPrisma.$transaction.mockImplementation(
    async (fn: (tx: typeof prisma) => Promise<unknown>) => fn(prisma)
  );
});

describe('handleStripeEvent — checkout.session.completed', () => {
  it('upserts subscription and updates team plan', async () => {
    const event = makeEvent('checkout.session.completed', {
      client_reference_id: 'team_123',
      customer: 'cus_abc',
      subscription: 'sub_xyz',
      metadata: {},
    });

    await handleStripeEvent(event);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId: 'team_123' },
        create: expect.objectContaining({ stripeCustomerId: 'cus_abc', status: 'active' }),
        update: expect.objectContaining({ stripeCustomerId: 'cus_abc', status: 'active' }),
      })
    );
    expect(mockPrisma.team.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'team_123' } })
    );
  });

  it('skips if teamId is missing', async () => {
    const event = makeEvent('checkout.session.completed', {
      client_reference_id: null,
      customer: 'cus_abc',
      subscription: null,
      metadata: {},
    });

    await handleStripeEvent(event);

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('handleStripeEvent — customer.subscription.updated', () => {
  it('updates subscription and team plan when record exists', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({ teamId: 'team_123' });

    const event = makeEvent('customer.subscription.updated', {
      id: 'sub_xyz',
      customer: 'cus_abc',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 86400,
      items: { data: [{ price: { id: 'price_free' } }] },
    });

    await handleStripeEvent(event);

    expect(mockPrisma.subscription.findUnique).toHaveBeenCalledWith({
      where: { stripeCustomerId: 'cus_abc' },
      select: { teamId: true },
    });
    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.subscription.update).toHaveBeenCalled();
    expect(mockPrisma.team.update).toHaveBeenCalled();
  });

  it('skips if no subscription record found', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue(null);

    const event = makeEvent('customer.subscription.updated', {
      id: 'sub_xyz',
      customer: 'cus_unknown',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000),
      items: { data: [{ price: { id: 'price_free' } }] },
    });

    await handleStripeEvent(event);

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('handleStripeEvent — customer.subscription.deleted', () => {
  it('cancels subscription and downgrades team to free', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue({ teamId: 'team_123' });

    const event = makeEvent('customer.subscription.deleted', {
      id: 'sub_xyz',
      customer: 'cus_abc',
    });

    await handleStripeEvent(event);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId: 'team_123' },
        data: { status: 'canceled', plan: 'free' },
      })
    );
    expect(mockPrisma.team.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'team_123' },
        data: { plan: 'free' },
      })
    );
  });

  it('skips if no subscription record found', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValue(null);

    const event = makeEvent('customer.subscription.deleted', {
      id: 'sub_xyz',
      customer: 'cus_unknown',
    });

    await handleStripeEvent(event);

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('handleStripeEvent — unknown event type', () => {
  it('ignores unknown event types without throwing', async () => {
    const event = makeEvent('payment_intent.created', { id: 'pi_123' });
    await expect(handleStripeEvent(event)).resolves.toBeUndefined();
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

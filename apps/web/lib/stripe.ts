import Stripe from 'stripe';

if (!process.env['STRIPE_SECRET_KEY'] && process.env['NODE_ENV'] === 'production') {
  throw new Error('STRIPE_SECRET_KEY environment variable is required in production');
}

export const stripe = new Stripe(
  process.env['STRIPE_SECRET_KEY'] ?? 'sk_test_placeholder',
  {
    apiVersion: '2025-02-24.acacia',
    typescript: true,
  }
);

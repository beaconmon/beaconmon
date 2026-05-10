'use client';

import { useState } from 'react';
import PricingCard, { type PricingTier } from './PricingCard';

const MONTHLY_TIERS: PricingTier[] = [
  {
    tier: 'Free',
    price: '$0',
    tagline: 'For hobby projects and side sites.',
    features: [
      '10 monitors',
      '5-minute check intervals',
      'Email alerts',
      '1 status page',
      'SSL & domain expiry alerts',
      '7-day history',
    ],
    ctaLabel: 'Start free — no card needed',
    ctaHref: '/sign-up',
  },
  {
    tier: 'Pro',
    price: '$19',
    tagline: 'For indie founders and growing SaaS products.',
    features: [
      '25 monitors',
      '1-minute check intervals',
      'Email + Slack + webhook alerts',
      '3 status pages (custom domain)',
      '90-day history',
      'SLO tracking',
      'Priority support',
    ],
    ctaLabel: 'Start 14-day trial',
    ctaHref: '/sign-up',
    highlighted: true,
    badge: 'Most popular',
    elevated: true,
  },
  {
    tier: 'Business',
    price: '$59',
    tagline: 'For agencies managing multiple clients.',
    features: [
      'Unlimited monitors',
      '30-second check intervals',
      'Email + Slack + webhook alerts',
      'Unlimited status pages',
      'Heartbeat monitoring',
      '1-year history',
      'Priority support',
    ],
    ctaLabel: 'Start 14-day trial',
    ctaHref: '/sign-up?plan=business',
  },
];

const ANNUAL_TIERS: PricingTier[] = [
  {
    ...MONTHLY_TIERS[0]!,
  },
  {
    ...MONTHLY_TIERS[1]!,
    price: '$15',
    priceSuffix: 'billed $180 / yr',
  },
  {
    ...MONTHLY_TIERS[2]!,
    price: '$47',
    priceSuffix: 'billed $564 / yr',
  },
];

export default function PricingToggle() {
  const [period, setPeriod] = useState<'monthly' | 'annual'>('annual');
  const tiers = period === 'annual' ? ANNUAL_TIERS : MONTHLY_TIERS;

  return (
    <>
      {/* Period toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-1 rounded-xl border border-brand-line bg-brand-bg1 p-1">
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-5 py-2 text-[14px] rounded-lg transition-colors ${period === 'monthly' ? 'bg-brand-bg3 text-brand-text font-semibold' : 'text-brand-muted hover:text-brand-dim'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('annual')}
            className={`px-5 py-2 text-[14px] rounded-lg transition-colors flex items-center gap-2 ${period === 'annual' ? 'bg-brand-bg3 text-brand-text font-semibold' : 'text-brand-muted hover:text-brand-dim'}`}
          >
            Annual
            <span className="text-[11px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-5 items-stretch">
        {tiers.map((t) => <PricingCard key={t.tier} {...t} />)}
      </div>
    </>
  );
}

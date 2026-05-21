'use client';

import { useState } from 'react';
import PricingCard, { type PricingTier } from './PricingCard';
import { PRICING, PLAN_CTAS } from '@/lib/pricing';

const MONTHLY_TIERS: PricingTier[] = [
  {
    tier: 'Free',
    price: '$0',
    tagline: 'For solo founders getting started.',
    features: [
      '10 monitors',
      '5-minute check intervals',
      'Email alerts',
      '1 status page',
      'SSL & domain expiry alerts',
      '7-day history',
    ],
    ctaLabel: 'Start free — no card needed',
    ctaHref: PLAN_CTAS.free,
  },
  {
    tier: 'Starter',
    price: `$${PRICING.starter.monthly}`,
    tagline: 'For growing stores tracking competitors.',
    features: [
      '25 monitors',
      '1-minute check intervals',
      '5 competitor monitors',
      'Email + Slack + webhook alerts',
      'Content monitoring',
      '3 status pages',
      '30-day history',
    ],
    ctaLabel: 'Start 14-day trial',
    ctaHref: PLAN_CTAS.starter,
  },
  {
    tier: 'Growth',
    price: `$${PRICING.growth.monthly}`,
    tagline: 'For serious stores that need intelligence.',
    features: [
      '100 monitors',
      '25 competitor monitors',
      'Intelligence Digest (daily + weekly)',
      'AI content-diff summaries',
      'Smart Alerts + Deploy-aware monitoring',
      '5-region multi-location checks',
      '90-day history',
    ],
    ctaLabel: 'Start 14-day trial',
    ctaHref: PLAN_CTAS.growth,
    highlighted: true,
    badge: 'Most popular',
    elevated: true,
  },
  {
    tier: 'Scale',
    price: `$${PRICING.scale.monthly}`,
    tagline: 'For high-volume stores.',
    features: [
      'Unlimited monitors',
      '30-second check intervals',
      'Unlimited competitor monitors',
      'Intelligence Digest (daily + weekly)',
      'All Growth features included',
      '365-day history',
      'Priority support',
    ],
    ctaLabel: 'Start 14-day trial',
    ctaHref: PLAN_CTAS.scale,
  },
];

const ANNUAL_TIERS: PricingTier[] = [
  { ...MONTHLY_TIERS[0]! },
  {
    ...MONTHLY_TIERS[1]!,
    price: `$${PRICING.starter.annual}`,
    priceSuffix: `billed $${PRICING.starter.annualTotal} / yr`,
  },
  {
    ...MONTHLY_TIERS[2]!,
    price: `$${PRICING.growth.annual}`,
    priceSuffix: `billed $${PRICING.growth.annualTotal} / yr`,
  },
  {
    ...MONTHLY_TIERS[3]!,
    price: `$${PRICING.scale.annual}`,
    priceSuffix: `billed $${PRICING.scale.annualTotal.toLocaleString()} / yr`,
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
            <span className="text-[11px] font-bold text-brand-green-ink bg-brand-green/10 px-2 py-0.5 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 gap-5 items-stretch">
        {tiers.map((t) => <PricingCard key={t.tier} {...t} />)}
      </div>
    </>
  );
}

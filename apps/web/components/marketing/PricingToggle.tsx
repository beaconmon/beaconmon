import PricingCard, { type PricingTier } from './PricingCard';
import { PRICING, PLAN_CTAS } from '@/lib/pricing';

const MONTHLY_TIERS: PricingTier[] = [
  {
    tier: 'Free',
    price: '$0',
    tagline: 'For hobby stores and side projects.',
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
    tagline: 'For DTC brands managing $5M-$50M in annual revenue and scaling marketing spend.',
    features: [
      '25 monitors',
      '1-minute check intervals',
      '5 competitor monitors',
      'Email + Slack + webhook alerts',
      'Content monitoring',
      'Weekly intelligence digest',
      '3 status pages',
      '30-day history',
    ],
    ctaLabel: 'Start 14-day trial',
    ctaHref: PLAN_CTAS.starter,
  },
  {
    tier: 'Growth',
    price: `$${PRICING.growth.monthly}`,
    tagline: 'For brands past $50M in revenue running dedicated performance marketing teams.',
    features: [
      '100 monitors',
      '25 competitor monitors',
      'AI-powered Smart Setup',
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
    tagline: 'For operators managing 5+ storefronts or exceeding $10M in monthly checkout volume.',
    features: [
      'Unlimited monitors',
      '30-second check intervals',
      'Unlimited competitor monitors',
      'Daily + weekly intelligence digest',
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

const TOGGLE_CSS = `
.pt-root .pt-radio { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.pt-root .pt-grid-monthly { display: none; }
.pt-root .pt-grid-annual { display: grid; }
.pt-root:has(#pt-period-monthly:checked) .pt-grid-monthly { display: grid; }
.pt-root:has(#pt-period-monthly:checked) .pt-grid-annual { display: none; }
.pt-root .pt-label { color: var(--brand-muted); }
.pt-root .pt-label:hover { color: var(--brand-dim); }
.pt-root:has(#pt-period-monthly:checked) .pt-label-monthly,
.pt-root:has(#pt-period-annual:checked) .pt-label-annual {
  background: var(--brand-bg3);
  color: var(--brand-text);
  font-weight: 600;
}
.pt-root:has(#pt-period-monthly:focus-visible) .pt-label-monthly,
.pt-root:has(#pt-period-annual:focus-visible) .pt-label-annual { outline: 2px solid var(--brand-green); outline-offset: 2px; }
`;

export default function PricingToggle() {
  return (
    <div className="pt-root">
      <style>{TOGGLE_CSS}</style>

      <input type="radio" name="pt-period" id="pt-period-monthly" className="pt-radio" aria-label="Monthly billing" />
      <input type="radio" name="pt-period" id="pt-period-annual" className="pt-radio" defaultChecked aria-label="Annual billing" />

      {/* Period toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center gap-1 rounded-xl border border-brand-line bg-brand-bg1 p-1" role="radiogroup" aria-label="Billing period">
          <label
            htmlFor="pt-period-monthly"
            className="pt-label pt-label-monthly px-5 py-2 text-[14px] rounded-lg transition-colors cursor-pointer select-none"
          >
            Monthly
          </label>
          <label
            htmlFor="pt-period-annual"
            className="pt-label pt-label-annual px-5 py-2 text-[14px] rounded-lg transition-colors cursor-pointer select-none flex items-center gap-2"
          >
            Annual
            <span className="text-[11px] font-bold text-brand-green-ink bg-brand-green/10 px-2 py-0.5 rounded-full">Save 20%</span>
          </label>
        </div>
      </div>

      {/* Pricing cards — both sets rendered SSR; CSS swaps visibility */}
      <div className="pt-grid-monthly grid-cols-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 gap-5 items-stretch">
        {MONTHLY_TIERS.map((t) => <PricingCard key={t.tier} {...t} />)}
      </div>
      <div className="pt-grid-annual grid-cols-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 gap-5 items-stretch">
        {ANNUAL_TIERS.map((t) => <PricingCard key={t.tier} {...t} />)}
      </div>
    </div>
  );
}

import Link from 'next/link';
import CheckIcon from './CheckIcon';

export type PricingTier = {
  tier: string;
  price: string;
  priceSuffix?: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
  elevated?: boolean;
};

export const PRICING_TIERS: PricingTier[] = [
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

export default function PricingCard({
  tier,
  price,
  priceSuffix,
  tagline,
  features,
  ctaLabel,
  ctaHref,
  highlighted,
  badge,
  elevated,
}: PricingTier) {
  return (
    <article
      className={`reveal relative rounded-2xl p-8 px-7 flex flex-col ${
        highlighted
          ? 'bg-[linear-gradient(180deg,rgba(0,229,122,0.04),#0E0E14_40%)] border border-[rgba(0,229,122,0.3)] shadow-[0_20px_40px_-20px_rgba(0,229,122,0.2)]'
          : 'bg-brand-bg1 border border-brand-line-soft'
      } ${elevated ? 'translate-y-[-6px] max-[880px]:translate-y-0' : ''}`}
    >
      {badge && (
        <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 bg-brand-green text-[#001a0c] text-[11px] font-bold px-3 py-1 rounded-full tracking-[0.04em] uppercase whitespace-nowrap">
          {badge}
        </div>
      )}
      <h3 className={`text-[13px] font-semibold tracking-[0.08em] uppercase mb-3 ${highlighted ? 'text-brand-green' : 'text-brand-muted'}`}>
        {tier}
      </h3>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-[44px] font-extrabold tracking-[-0.03em]">{price}</span>
        <span className="text-brand-muted text-[14px]">/ month</span>
      </div>
      {priceSuffix && (
        <p className="text-brand-muted text-[12px] mb-1">{priceSuffix}</p>
      )}
      <p className="text-brand-dim text-[14px] mb-7 leading-[1.4] min-h-[40px]">{tagline}</p>
      <ul className="space-y-0 mb-7 flex-1" aria-label="Plan features">
        {features.map((f, i) => (
          <li key={f} className="flex items-start gap-[10px] py-2 text-[14px] text-brand-dim border-t border-brand-line-soft first:border-t-0">
            <CheckIcon />
            <span>{i === 0 ? <strong className="text-brand-text font-medium">{f}</strong> : f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        aria-label={`Select ${tier} plan`}
        className={
          highlighted
            ? 'inline-flex items-center justify-center h-12 px-[22px] text-[15px] font-semibold rounded-[10px] bg-brand-green text-[#001a0c] shadow-[0_0_0_1px_rgba(0,229,122,0.3),0_6px_20px_rgba(0,229,122,0.2)] hover:scale-[1.02] hover:bg-[#00ff8a] transition-all duration-[120ms]'
            : 'inline-flex items-center justify-center h-12 px-[22px] text-[15px] font-semibold rounded-[10px] bg-brand-bg2 text-brand-text border border-brand-line hover:bg-brand-bg3 hover:border-brand-muted transition-all'
        }
      >
        {ctaLabel}
      </Link>
    </article>
  );
}

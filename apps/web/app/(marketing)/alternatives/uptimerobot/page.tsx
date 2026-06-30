import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to UptimeRobot for Shopify Stores (2026)',
  description:
    "UptimeRobot's free plan is now non-commercial. Shopify stores need a replacement. Beaconmon offers free uptime monitoring built for ecommerce, plus competitor tracking. No card needed.",
  alternates: { canonical: 'https://beaconmon.com/alternatives/uptimerobot' },
};

const TOOL_FACTS = [
  { label: 'Free plan', value: '50 monitors, non-commercial use only since October 2024' },
  { label: 'Paid starting price', value: '~$7/mo for 50 monitors, 1-minute checks' },
  { label: 'Competitor monitoring', value: 'None' },
  { label: 'Shopify-specific features', value: 'None' },
  { label: 'Intelligence Digest', value: 'None' },
  { label: 'Monitor types', value: 'HTTP/HTTPS uptime checks only' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'The free plan is non-commercial.',
    body: 'UptimeRobot changed their free plan terms in October 2024. Running a Shopify store is commercial use. If you have been on the free plan, you are technically in violation and need to upgrade or switch.',
  },
  {
    heading: 'UptimeRobot only checks whether your site is online.',
    body: 'It pings a URL and confirms HTTP 200. It cannot tell you when a competitor drops prices, runs a flash sale, or changes their homepage promotion. For Shopify stores, that missing context is a real gap.',
  },
  {
    heading: 'No Shopify-specific awareness.',
    body: 'UptimeRobot does not know the difference between your store going down and your checkout silently failing due to a Shopify app conflict. It treats every URL the same.',
  },
  {
    heading: 'No weekly digest or summary.',
    body: 'You receive one alert per incident. There is no weekly rollup of what changed across all your monitors, no way to see patterns without logging in and digging through alert history.',
  },
];

const BEACONMON_WINS = [
  'Free plan with 10 uptime monitors and no non-commercial restriction, built for Shopify store owners',
  'Competitor monitoring included: track price changes, promo banners, stock status on competitor storefronts',
  'SSL expiry alerts at 30, 14, and 7 days, included free (UptimeRobot requires paid for this)',
  'Domain expiry alerts included (UptimeRobot does not offer this)',
  'Intelligence Digest on Starter and above consolidates every alert into a weekly Slack or email summary',
  'Onboarding wizard understands ecommerce: detects Shopify or WooCommerce and suggests the monitors that matter',
];

const WHERE_UPTIMEROBOT_WINS = [
  "UptimeRobot's paid plan scales to 100 or more monitors at low cost. For teams monitoring many unrelated URLs, the per-monitor pricing can be cheaper than Beaconmon at volume.",
  'UptimeRobot has a longer track record and integrates with PagerDuty, OpsGenie, and other DevOps tooling. Teams with existing incident-management workflows may prefer staying in that ecosystem.',
  'If you need only HTTP uptime checks with no interest in competitor monitoring or ecommerce intelligence, UptimeRobot paid is a simple, proven tool.',
];

const FAQ_ITEMS = [
  {
    q: "Can Shopify stores still use UptimeRobot's free plan?",
    a: 'No. UptimeRobot changed their free plan to non-commercial use only in October 2024. Running a Shopify store is commercial use. You need to be on a paid plan or switch to an alternative.',
  },
  {
    q: "Does Beaconmon's free plan have any commercial restrictions?",
    a: "No. Beaconmon's free plan is built for Shopify store owners. There are no non-commercial restrictions. You get 10 monitors free forever.",
  },
  {
    q: 'Does Beaconmon do more than just uptime monitoring?',
    a: 'Yes. Beaconmon combines uptime monitoring with competitor tracking. You can monitor when a competitor changes their prices, runs a promotion, or updates their product pages, alongside monitoring whether your own store is online. UptimeRobot only monitors availability.',
  },
  {
    q: 'Is Beaconmon harder to set up than UptimeRobot?',
    a: "No. For Shopify stores, Beaconmon's onboarding wizard is faster than UptimeRobot's manual setup. You enter your store URL, the wizard detects your store type, and suggests the monitors that matter for ecommerce.",
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/uptimerobot',
      name: 'Free Alternative to UptimeRobot for Shopify Stores (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'UptimeRobot',
      applicationCategory: 'BusinessApplication',
      description: 'General-purpose website uptime monitoring service. Free plan restricted to non-commercial use as of October 2024.',
      url: 'https://uptimerobot.com',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'UptimeRobot alternative',
          item: 'https://beaconmon.com/alternatives/uptimerobot',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function UptimeRobotAlternativePage() {
  return (
    <>
      <JsonLd data={schemaData} />
      <NavBar />

      {/* Hero */}
      <section className="relative py-[100px] max-[640px]:py-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            right: '-10%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(0,229,122,0.15), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Free Alternative
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Free alternative to UptimeRobot for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            UptimeRobot removed commercial use from their free plan in October 2024. Beaconmon is free for Shopify stores, with no restrictions, and includes competitor monitoring that UptimeRobot never had.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      {/* Pricing callout */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What UptimeRobot costs now</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">
              The free plan that thousands of Shopify stores relied on is now off-limits for commercial use.
            </p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-4">UptimeRobot</p>
              <ul className="space-y-3">
                {TOOL_FACTS.map(({ label, value }) => (
                  <li key={label} className="flex flex-col gap-1">
                    <span className="text-[12px] font-semibold text-brand-muted">{label}</span>
                    <span className="text-[14px] text-brand-dim">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-4">Beaconmon</p>
              <ul className="space-y-3">
                {[
                  { label: 'Free plan', value: '10 monitors, no commercial restriction, forever' },
                  { label: 'Paid starting price', value: '$29/mo (Starter): Intelligence Digest, unlimited competitors' },
                  { label: 'Competitor monitoring', value: 'Yes, included free (1 competitor on free plan)' },
                  { label: 'Shopify-specific features', value: 'Yes: preset selectors, ecommerce onboarding' },
                  { label: 'Intelligence Digest', value: 'Yes, Starter and above' },
                  { label: 'Monitor types', value: 'Uptime, SSL expiry, domain expiry, competitor content' },
                ].map(({ label, value }) => (
                  <li key={label} className="flex flex-col gap-1">
                    <span className="text-[12px] font-semibold text-brand-green-ink">{label}</span>
                    <span className="text-[14px] text-brand-dim">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-center text-brand-muted text-[13px] mt-5">
            See the full breakdown on{' '}
            <Link href="/pricing" className="text-brand-green-ink hover:underline">
              the pricing page
            </Link>{' '}
            or the{' '}
            <Link href="/vs/uptimerobot" className="text-brand-green-ink hover:underline">
              full Beaconmon vs UptimeRobot comparison
            </Link>.
          </p>
        </div>
      </section>

      {/* Why people look for alternatives */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Why Shopify stores are leaving UptimeRobot
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              It is not just the pricing change. UptimeRobot was built for general HTTP monitoring, not ecommerce.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-[14px] leading-[1.65] text-brand-dim">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Beaconmon covers instead */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              What Beaconmon gives Shopify stores instead
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Built for ecommerce from the start. Not a port of a DevOps tool.
            </p>
          </div>
          <ul className="reveal space-y-4 max-w-[700px] mx-auto">
            {BEACONMON_WINS.map((win) => (
              <li key={win} className="flex items-start gap-4 bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.15)] rounded-xl px-6 py-4">
                <CheckIcon className="mt-0.5 flex-shrink-0 text-brand-green-ink" />
                <span className="text-[15px] leading-[1.65] text-brand-dim">{win}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Where UptimeRobot still wins (honest) */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Where UptimeRobot still wins</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Beaconmon is not the right tool for every use case. Here is where UptimeRobot has a genuine edge.
            </p>
          </div>
          <ul className="reveal space-y-4 max-w-[700px] mx-auto">
            {WHERE_UPTIMEROBOT_WINS.map((point) => (
              <li key={point} className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-6 py-4 text-[15px] leading-[1.65] text-brand-dim">
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Common questions</h2>
          </div>
          <div className="reveal space-y-5">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-3 text-brand-text">{q}</h3>
                <p className="text-[14px] leading-[1.65] text-brand-dim">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] border-t border-brand-line-soft relative overflow-hidden">
        <div aria-hidden className="absolute pointer-events-none" style={{ bottom: '-40%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(0,229,122,0.15), transparent 60%)', filter: 'blur(40px)' }} />
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center relative">
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">Try Beaconmon free.</h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">See the Shopify-specific setup →</Link>
          </p>
        </div>
      </section>

      {/* See also */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot (full comparison)</Link>
            <Link href="/vs/better-uptime" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs BetterStack</Link>
            <Link href="/alternatives/betterstack" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to BetterStack</Link>
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce uptime monitoring guide</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

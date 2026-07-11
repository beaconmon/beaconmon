import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to BetterStack Uptime Monitoring for Shopify (2026)',
  description:
    'BetterStack now covers logs and infrastructure monitoring. Shopify stores that just need uptime alerts and competitor tracking should consider Beaconmon.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/betterstack' },
  openGraph: { url: 'https://beaconmon.com/alternatives/betterstack' },
};

const TOOL_FACTS = [
  { label: 'Free plan', value: '10 monitors, uptime only' },
  { label: 'Paid from', value: '~$20/mo, scales by log volume and monitor count' },
  { label: 'Extra features added', value: 'Log management, distributed tracing, infrastructure metrics, real user monitoring, error tracking, on-call scheduling' },
  { label: 'Shopify-specific features', value: 'None' },
  { label: 'Competitor monitoring', value: 'None at any tier' },
  { label: 'Weekly Competitor Report', value: 'None' },
  { label: 'Primary audience', value: 'Developers and DevOps teams' },
];

const REASONS_TO_SWITCH = [
  'BetterStack is now a full observability platform. If you run a Shopify store and want uptime alerts, you are paying for a large stack of features you will not use.',
  'No competitor monitoring. You need a second tool to track when competitors change prices, run promotions, or update their product listings.',
  "BetterStack's pricing at higher tiers charges by log ingestion volume. That model is not relevant to most Shopify merchants.",
  'The product is aimed at developers and engineering teams, not store owners. The UX reflects this.',
];

const BEACONMON_WINS = [
  {
    heading: 'Same free monitor count, more included.',
    body: 'Both free plans cover 10 monitors. Beaconmon also includes SSL monitoring, domain expiry alerts, and 1 competitor monitor at no cost. BetterStack free covers uptime only.',
  },
  {
    heading: 'Built around the Shopify workflow.',
    body: 'The onboarding wizard understands Shopify and WooCommerce. Preset CSS selectors for product prices and stock status mean you start tracking competitors in minutes, not hours.',
  },
  {
    heading: 'Competitor monitoring bundled.',
    body: 'Track your own uptime and competitor pages in one tool. When a competitor drops prices or adds a promotional banner, you see it alongside your own site health.',
  },
  {
    heading: 'Weekly Competitor Report on Starter and above.',
    body: 'A scheduled Slack or email digest groups every competitor change from the week into a readable summary. No equivalent exists in BetterStack at any tier.',
  },
];

const WHERE_BETTERSTACK_WINS = [
  {
    heading: 'Infrastructure monitoring at scale.',
    body: 'BetterStack is a far more capable observability platform. For teams that need log management, distributed tracing, or infrastructure metrics, Beaconmon does not compete.',
  },
  {
    heading: 'On-call and escalation workflows.',
    body: 'BetterStack integrates with PagerDuty, Opsgenie, and similar DevOps tools. If your team uses formal on-call rotations with escalation policies, BetterStack fits naturally into that stack. Beaconmon does not have on-call scheduling.',
  },
  {
    heading: 'Custom infrastructure beyond Shopify.',
    body: 'For companies running complex multi-service infrastructure, BetterStack is the right choice. Beaconmon is focused on ecommerce stores, not general-purpose DevOps.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is Beaconmon only for Shopify stores?',
    a: 'Primarily, yes. Beaconmon is built around the Shopify and WooCommerce workflow: competitor monitoring with preset selectors, ecommerce uptime monitoring, and Weekly Competitor Reports. BetterStack is a better fit for teams running custom infrastructure or needing log management.',
  },
  {
    q: 'Does Beaconmon have an on-call or escalation system?',
    a: 'No. Beaconmon sends alerts via Slack, email, or webhook. It does not have on-call schedules, rotation management, or escalation policies. For teams that need those, BetterStack or PagerDuty are better fits.',
  },
  {
    q: "How does Beaconmon's free plan compare to BetterStack's?",
    a: "Both free plans include 10 monitors. Beaconmon's free plan also includes SSL monitoring, domain expiry monitoring, and 1 competitor monitor. BetterStack's free plan covers uptime only.",
  },
  {
    q: 'What does BetterStack do that Beaconmon does not?',
    a: 'BetterStack covers log management, infrastructure metrics, distributed tracing, real user monitoring, and on-call scheduling. These are enterprise DevOps capabilities that Beaconmon does not offer. Beaconmon is focused on ecommerce store monitoring and competitor monitoring.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/betterstack',
      name: 'Free Alternative to BetterStack Uptime Monitoring for Shopify (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'BetterStack alternative', item: 'https://beaconmon.com/alternatives/betterstack' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    },
  ],
};

export default function AlternativesBetterStackPage() {
  return (
    <>
      <JsonLd data={schemaData} />
      <NavBar />

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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <Link href="/alternatives" className="inline-flex items-center gap-2 text-[13px] text-brand-muted hover:text-brand-dim transition-colors mb-6">
            <span>←</span> All alternatives
          </Link>
          <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Free Alternative</span>
          <h1 className="text-[clamp(36px,4.5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px]">
            Free alternative to BetterStack<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            BetterStack has expanded into logs, traces, and on-call scheduling. For a Shopify store that just wants uptime alerts and competitor tracking, that is a lot of platform you will never use. Beaconmon covers the same 10 free monitors, adds competitor monitoring, and is shaped around the ecommerce workflow from day one.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-2 max-[700px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">BetterStack</span>
              <p className="text-[28px] font-extrabold tracking-[-0.02em] mb-1">
                Free / ~$20<span className="text-[16px] font-medium text-brand-dim">/mo</span>
              </p>
              <p className="text-brand-dim text-[14px] leading-[1.55] mb-4">10 uptime monitors on the free plan. Paid tiers add logs, traces, on-call scheduling, and infrastructure metrics. Pricing scales by log volume at higher tiers.</p>
              <ul className="space-y-2">
                {TOOL_FACTS.map(({ label, value }) => (
                  <li key={label} className="text-[13px] text-brand-dim">
                    <span className="text-brand-text font-medium">{label}:</span> {value}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[rgba(0,229,122,0.05)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon</span>
              <p className="text-[28px] font-extrabold tracking-[-0.02em] mb-1">
                Free / $29<span className="text-[16px] font-medium text-brand-dim">/mo</span>
              </p>
              <p className="text-brand-dim text-[14px] leading-[1.55] mb-4">10 uptime monitors, SSL monitoring, domain expiry alerts, and 1 competitor monitor on the free plan. Starter adds unlimited competitors and the Weekly Competitor Report.</p>
              <Link href="/pricing" className="text-[13px] text-brand-green-ink hover:underline">See full pricing details →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Why Shopify stores look for a BetterStack alternative
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65] max-w-[620px]">
                BetterStack started as a focused uptime tool. It has since become a full observability platform. For ecommerce stores, that shift created a mismatch between the tool and the job.
              </p>
            </div>
            <ul className="space-y-4">
              {REASONS_TO_SWITCH.map((reason, i) => (
                <li key={i} className="reveal flex items-start gap-3 text-[15px] text-brand-dim">
                  <CheckIcon />
                  <span className="leading-[1.65]">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">What Beaconmon covers instead</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Fewer features, all of them shaped around running a Shopify store.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            {BEACONMON_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[900px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where BetterStack still wins
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                This is an honest comparison. BetterStack is the stronger choice in several areas and it is worth knowing them before you decide.
              </p>
            </div>
            <div className="grid grid-cols-2 max-[700px]:grid-cols-1 gap-5">
              {WHERE_BETTERSTACK_WINS.map(({ heading, body }) => (
                <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-2">{heading}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.6]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.15]">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-6">
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q} className="reveal border-b border-brand-line-soft pb-6">
                  <p className="text-[15px] font-semibold text-brand-text mb-2">{q}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.65]">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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

      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/better-uptime" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs BetterStack (full comparison)</Link>
            <Link href="/alternatives/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Alternative to UptimeRobot</Link>
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce uptime monitoring guide</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

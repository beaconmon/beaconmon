import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to Rivalert for Shopify Stores (2026)',
  description:
    'Rivalert has no free plan and checks only every 12 hours on its cheapest tier. Beaconmon offers a free competitor monitoring plan for Shopify stores, with uptime and a weekly Digest.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/rivalert' },
};

const TOOL_FACTS = [
  { label: 'Free plan', value: 'None (7-day trial only)' },
  { label: 'Starter price', value: '$19/mo' },
  { label: 'Check frequency on Starter', value: 'Every 12 hours' },
  { label: 'Hourly checks', value: 'Pro plan only ($179/mo)' },
  { label: 'Tracks prices and stock', value: 'Yes' },
  { label: 'Tracks promo copy and banners', value: 'No' },
  { label: 'Uptime monitoring', value: 'No' },
  { label: 'SSL / domain expiry alerts', value: 'No' },
  { label: 'Intelligence Digest', value: 'No' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'No free plan.',
    body: 'Rivalert requires a paid subscription from day one. A 7-day trial is all you get before committing. Beaconmon gives you 10 monitors and 1 competitor free forever, with no credit card required.',
  },
  {
    heading: '12-hour check frequency on Starter.',
    body: 'A competitor could launch a flash sale, run it for eight hours, and end it before Rivalert detects anything. Beaconmon checks at least every hour on all plans, including the free tier.',
  },
  {
    heading: 'Price and product changes only.',
    body: 'Rivalert does not monitor promotional copy, homepage banners, campaign headlines, or content changes. If a competitor updates their store copy without touching individual product prices, Rivalert will not alert you. Beaconmon covers all of it with CSS-selector targeting.',
  },
  {
    heading: 'No uptime monitoring.',
    body: 'Rivalert is competitor-only. You need a separate tool to know when your own store goes down or your SSL certificate is about to expire. Beaconmon covers both in one subscription.',
  },
  {
    heading: 'No Intelligence Digest.',
    body: 'Rivalert sends individual email alerts per event. Beaconmon Starter includes a weekly Slack or email digest that groups every competitor change from the past week into a single readable summary.',
  },
];

const BEACONMON_WINS = [
  'Free plan: 10 monitors, 1 competitor, no card required (Rivalert has no free plan)',
  'Hourly checks on free and Starter plans (Rivalert checks every 12 hours on its $19/mo Starter)',
  'Monitors promotional copy, homepage banners, and content changes (Rivalert does not)',
  'Uptime monitoring included at no extra cost (Rivalert has none)',
  'SSL and domain expiry alerts at 30, 14, and 7 days',
  'Intelligence Digest on Starter ($29/mo): weekly Slack or email competitor summary',
];

const WHERE_RIVALERT_WINS = [
  {
    heading: 'Lower entry price.',
    body: 'Rivalert Starter is $19/mo versus Beaconmon Starter at $29/mo. If you only need price and stock tracking and the 12-hour frequency is acceptable, the lower price point is a real advantage.',
  },
  {
    heading: 'Longer price history.',
    body: 'Rivalert stores 30 days of price history on Starter and 180 days on Pro. Beaconmon history is bounded by plan retention windows, which may be shorter for basic plans if you need long-run trend data.',
  },
  {
    heading: 'Narrower, simpler scope.',
    body: 'Rivalert is purpose-built for Shopify price and stock tracking. If that is the only thing you need and the broader Beaconmon feature set is not useful to you, the simpler tool may be a better fit.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does Rivalert have a free plan?',
    a: 'No. Rivalert offers a 7-day trial but no ongoing free tier. Beaconmon\'s free plan covers 10 monitors and 1 competitor forever, with no credit card required.',
  },
  {
    q: 'How often does Rivalert check for price changes?',
    a: 'Every 12 hours on the $19/mo Starter plan. Every hour on the $179/mo Pro plan. Beaconmon checks at least every hour on all paid plans, and the free plan also runs hourly checks.',
  },
  {
    q: 'Can Rivalert tell me when a competitor runs a promotion?',
    a: 'Rivalert tracks price changes and new product appearances. It does not monitor promotional copy, homepage banners, or campaign copy. If a competitor launches a "Summer sale, 25% off sitewide" campaign on their homepage without changing individual product prices, Rivalert will not catch it. Beaconmon will.',
  },
  {
    q: 'Is Beaconmon more expensive than Rivalert?',
    a: 'Beaconmon Starter is $29/mo versus Rivalert Starter at $19/mo. However, Beaconmon Starter includes features Rivalert does not offer at any price: uptime monitoring, SSL alerts, content and promo change monitoring, and the Intelligence Digest. And Beaconmon has a free plan Rivalert does not.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/rivalert',
      name: 'Free Alternative to Rivalert for Shopify Stores (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Rivalert',
      applicationCategory: 'BusinessApplication',
      description: 'Shopify-native competitor price, product, and stock tracker with 12-hour check frequency on the entry plan.',
      offers: { '@type': 'Offer', price: '19', priceCurrency: 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Rivalert alternative', item: 'https://beaconmon.com/alternatives/rivalert' },
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

export default function AlternativesRivalertPage() {
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
          <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Free alternative</span>
          <h1 className="text-[clamp(36px,4.5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px]">
            Free alternative to Rivalert<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Rivalert has no free plan and checks prices only every 12 hours on its $19/mo Starter tier. Beaconmon monitors competitor prices, promotional copy, and uptime from a free plan that never expires.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6 max-w-[820px]">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-4 block">Rivalert</span>
              <div className="space-y-3">
                {TOOL_FACTS.map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4 text-[13px]">
                    <span className="text-brand-muted">{label}</span>
                    <span className="text-brand-dim font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-brand-line-soft">
                <p className="text-[13px] text-brand-muted">
                  See <Link href="/pricing" className="text-brand-green-ink hover:underline">Rivalert pricing</Link> vs Beaconmon on the{' '}
                  <Link href="/pricing" className="text-brand-green-ink hover:underline">pricing page</Link>.
                </p>
              </div>
            </div>
            <div className="bg-[rgba(0,229,122,0.05)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-4 block">Beaconmon</span>
              <div className="space-y-3 text-[13px] text-brand-dim">
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Free plan</span>
                  <span className="text-brand-green-ink font-semibold">10 monitors, 1 competitor</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Starter price</span>
                  <span className="font-medium">$29/mo</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Check frequency</span>
                  <span className="font-medium">Hourly, all plans</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Promo and content monitoring</span>
                  <span className="text-brand-green-ink font-medium">Yes</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Uptime monitoring</span>
                  <span className="text-brand-green-ink font-medium">Yes, included</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">SSL / domain expiry alerts</span>
                  <span className="text-brand-green-ink font-medium">Yes, included</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Intelligence Digest</span>
                  <span className="text-brand-green-ink font-medium">Starter+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.15]">
                Why Shopify stores look for a Rivalert alternative
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65] max-w-[620px]">
                Rivalert targets Shopify stores and does price and stock tracking well. These are the points where stores start looking elsewhere.
              </p>
            </div>
            <div className="space-y-4">
              {REASONS_TO_SWITCH.map(({ heading, body }) => (
                <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-2">{heading}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.65]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[900px] mx-auto">
            <div>
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                What Beaconmon covers instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Beaconmon uses CSS-selector targeting to track specific HTML elements on competitor pages. Not just price and stock, but any content change you choose to watch. See the{' '}
                <Link href="/shopify-competitor-monitoring" className="text-brand-green-ink hover:underline">Shopify competitor monitoring guide</Link> for how it works.
              </p>
            </div>
            <ul className="space-y-4">
              {BEACONMON_WINS.map((win, i) => (
                <li key={i} className="reveal flex items-start gap-3 text-[14px] text-brand-dim">
                  <CheckIcon />
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Where Rivalert still wins
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Here is where Rivalert is the better choice.
              </p>
            </div>
            <div className="space-y-4">
              {WHERE_RIVALERT_WINS.map(({ heading, body }) => (
                <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-2">{heading}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.65]">{body}</p>
                </div>
              ))}
            </div>
            <p className="text-brand-muted text-[13px] mt-6">
              For a full side-by-side breakdown, see the{' '}
              <Link href="/vs/rivalert" className="text-brand-green-ink hover:underline">Beaconmon vs Rivalert comparison</Link>.
            </p>
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
            <Link href="/vs/rivalert" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Rivalert (full comparison)</Link>
            <Link href="/alternatives/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Alternative to Visualping</Link>
            <Link href="/alternatives/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Alternative to Prisync</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

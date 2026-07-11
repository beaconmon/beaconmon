import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to Visualping for Shopify Stores (2026)',
  description:
    'Beaconmon monitors competitor prices, promotions, and page changes with CSS selector precision, plus uptime monitoring. Free plan, no card needed.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/visualping' },
  openGraph: { url: 'https://beaconmon.com/alternatives/visualping' },
};

const TOOL_FACTS = [
  { label: 'Free plan', value: '5 pages, limited checks per day' },
  { label: 'Starter paid', value: '$10/mo, ~50 pages, hourly checks' },
  { label: 'Business tier', value: '$100/mo, 200 pages, Slack, team features' },
  { label: 'Uptime monitoring', value: 'None' },
  { label: 'Tells you what changed', value: 'No. Shows a highlighted region, not the specific value.' },
  { label: 'Shopify preset selectors', value: 'None' },
  { label: 'Weekly Competitor Report', value: 'None' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'You see that something changed, not what changed.',
    body: 'Visualping compares screenshots and highlights a region that looks different. For Shopify stores tracking competitor prices, you need the actual value: the price went from $49 to $39. A highlighted image region does not give you that.',
  },
  {
    heading: 'Five pages is not enough.',
    body: "Visualping's free plan covers 5 pages. A basic competitor watchlist for a Shopify store, price page, stock status, promo banner, homepage, and product listing, uses that up before you start.",
  },
  {
    heading: 'No uptime monitoring means a second tool.',
    body: "Visualping does not alert you when your store goes down or your SSL certificate expires. If you need uptime monitoring alongside content change detection, you're paying for two tools.",
  },
  {
    heading: 'No digest, so you have to check in.',
    body: "Visualping sends per-change alerts but has no weekly summary. There is no way to get a digest of everything that changed across your competitor watchlist delivered to Slack.",
  },
  {
    heading: 'No Shopify awareness.',
    body: 'Visualping does not know the difference between a product price field and a footer link. There are no preset selectors for Shopify product structure, so you are targeting regions visually rather than the specific elements that matter.',
  },
];

const BEACONMON_WINS = [
  {
    heading: 'Double the free monitors.',
    body: 'Beaconmon free includes 10 monitors and 1 competitor tracked, forever. No credit card required. That covers a real watchlist without hitting a wall on day one.',
  },
  {
    heading: 'CSS-selector precision.',
    body: 'Beaconmon targets specific HTML elements: the price field, the stock badge, the promotional headline. Alerts include the old value and the new value. No screenshot archaeology.',
  },
  {
    heading: 'Shopify and WooCommerce presets.',
    body: 'Preset selectors for product price, stock status, and promotional copy mean you do not have to figure out the right CSS selector from scratch for every competitor.',
  },
  {
    heading: 'Uptime monitoring included.',
    body: 'HTTP uptime checks, SSL expiry alerts at 30, 14, and 7 days, and domain expiry alerts are included on every plan, including free. One tool, not two.',
  },
  {
    heading: 'Weekly Competitor Report on Starter.',
    body: 'A scheduled Slack or email summary of every competitor change from the past week, grouped by competitor, in plain language. Available on Starter ($29/mo) and above.',
  },
];

const WHERE_COMPETITOR_WINS = [
  'Pixel-diffing catches anything visible on the page: layout shifts, image swaps, button moves. If you need to detect non-structural visual changes without knowing CSS selectors, Visualping handles this and Beaconmon does not.',
  "Visualping's entry paid tier ($10/mo) is lower than Beaconmon Starter ($29/mo). If you only need a handful of generic page checks and do not need uptime or Slack digests, Visualping costs less.",
  'If you are monitoring generic web pages with no ecommerce context, Visualping works. The 5-page free tier is sufficient for a small watchlist of non-Shopify pages.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Beaconmon have a free plan?',
    a: 'Yes. The free plan includes 10 monitors and 1 competitor, forever. No credit card required. Visualping free covers 5 pages with a limited daily check count.',
  },
  {
    q: 'Can Beaconmon tell me exactly what changed on a competitor Shopify page?',
    a: 'Yes. Beaconmon uses CSS-selector targeting to watch specific elements: the price field, the stock badge, the promotional headline. When a change fires, the alert includes the old value and the new value. Visualping compares screenshots and tells you a region changed, not what inside it changed.',
  },
  {
    q: 'Does Beaconmon monitor uptime?',
    a: 'Yes. Uptime monitoring, SSL expiry alerts, and domain expiry alerts are included on all plans including the free plan. Visualping does not offer uptime monitoring.',
  },
  {
    q: 'What is the Weekly Competitor Report?',
    a: 'A scheduled Slack or email summary of every competitor change detected in the past week, grouped by competitor, written in plain language. It ships on Starter ($29/mo) and above. Visualping does not offer a digest feature.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/visualping',
      name: 'Free Alternative to Visualping for Shopify Stores (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Visualping alternative', item: 'https://beaconmon.com/alternatives/visualping' },
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

export default function AlternativesVisualpingPage() {
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
            Free alternative to Visualping<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Visualping detects visual changes by comparing screenshots. Beaconmon targets specific HTML elements with CSS selectors and tells you exactly what changed: the price, the stock status, the promotional headline. For Shopify stores, that precision is the difference between noise and signal.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-2 max-[760px]:grid-cols-1 gap-5 max-w-[860px] mx-auto">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">Visualping pricing</span>
              <div className="space-y-3">
                {TOOL_FACTS.map(({ label, value }) => (
                  <div key={label} className="flex gap-3 text-[14px]">
                    <span className="text-brand-muted shrink-0 w-[140px]">{label}</span>
                    <span className="text-brand-dim">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[rgba(0,229,122,0.05)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon pricing</span>
              <div className="space-y-3 text-[14px] text-brand-dim">
                <div className="flex gap-3">
                  <span className="text-brand-muted shrink-0 w-[140px]">Free plan</span>
                  <span>10 monitors, 1 competitor, forever</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-brand-muted shrink-0 w-[140px]">Starter paid</span>
                  <span>$29/mo, unlimited competitors, Weekly Competitor Report</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-brand-muted shrink-0 w-[140px]">Uptime monitoring</span>
                  <span className="text-brand-green-ink font-medium">Included on all plans</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-brand-muted shrink-0 w-[140px]">Shopify presets</span>
                  <span className="text-brand-green-ink font-medium">Included</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-brand-muted shrink-0 w-[140px]">Weekly Competitor Report</span>
                  <span className="text-brand-green-ink font-medium">Starter and above</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-brand-muted shrink-0 w-[140px]">Tells you what changed</span>
                  <span className="text-brand-green-ink font-medium">Old value and new value in every alert</span>
                </div>
              </div>
              <Link href="/pricing" className="inline-block mt-5 text-[13px] text-brand-green-ink hover:underline font-medium">
                See full pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                Why Shopify stores look for a Visualping alternative
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Visualping works for a certain kind of monitoring. When your needs are specific to ecommerce, you quickly run into its limits.
              </p>
            </div>
            <div className="space-y-4">
              {REASONS_TO_SWITCH.map(({ heading, body }) => (
                <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-1">{heading}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.6]">{body}</p>
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
                Built for ecommerce stores that need to track competitor moves with precision, not just notice that something on a page looks different.
              </p>
            </div>
            <ul className="space-y-4">
              {BEACONMON_WINS.map(({ heading, body }) => (
                <li key={heading} className="reveal flex items-start gap-3">
                  <CheckIcon />
                  <div>
                    <p className="text-[14px] font-semibold text-brand-text mb-0.5">{heading}</p>
                    <p className="text-[14px] text-brand-dim leading-[1.6]">{body}</p>
                  </div>
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
                Where Visualping still wins
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Being honest about where the alternative is a better fit.
              </p>
            </div>
            <ul className="space-y-4">
              {WHERE_COMPETITOR_WINS.map((item) => (
                <li key={item} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-5 text-[14px] text-brand-dim leading-[1.65]">
                  {item}
                </li>
              ))}
            </ul>
            <p className="reveal mt-6 text-[14px] text-brand-dim leading-[1.65]">
              For a full side-by-side breakdown, see the{' '}
              <Link href="/vs/visualping" className="text-brand-green-ink hover:underline">
                Beaconmon vs Visualping comparison
              </Link>
              .
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
            <Link href="/vs/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Visualping</Link>
            <Link href="/alternatives/hexowatch" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to Hexowatch</Link>
            <Link href="/alternatives/distill" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to Distill.io</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

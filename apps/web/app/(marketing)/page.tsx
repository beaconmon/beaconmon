import NavBar from '@/components/marketing/NavBar';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import PricingToggle from '@/components/marketing/PricingToggle';
import { PRICING } from '@/lib/pricing';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Intelligence & Uptime Monitoring for eCommerce | Beaconmon',
  description:
    'Beaconmon monitors your Shopify competitors and delivers a daily brief of every price drop, new launch, and content change. Set up in five minutes. Free to start.',
  alternates: { canonical: 'https://beaconmon.com' },
  openGraph: { url: 'https://beaconmon.com' },
};

const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Beaconmon',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Shopify Competitor Intelligence',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com',
  description:
    'Shopify competitor intelligence and store monitoring. Tracks competitor pricing, product launches, and content changes. Delivers a daily brief with every competitor move. Includes uptime monitoring, SSL expiry, and domain expiry alerts.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://beaconmon.com/sign-up',
      description: '10 monitors, 5-minute check interval, 1 competitor monitor, 1 status page',
    },
    {
      '@type': 'Offer',
      name: 'Starter',
      price: String(PRICING.starter.monthly),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://beaconmon.com/sign-up',
      description: '25 monitors, 1-minute check interval, 5 competitor monitors, 3 status pages',
    },
    {
      '@type': 'Offer',
      name: 'Growth',
      price: String(PRICING.growth.monthly),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://beaconmon.com/sign-up',
      description: '100 monitors, 25 competitor monitors, AI content-diff, multi-location checks',
    },
    {
      '@type': 'Offer',
      name: 'Scale',
      price: String(PRICING.scale.monthly),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://beaconmon.com/sign-up',
      description: 'Unlimited monitors, 30-second check interval, unlimited competitor monitors',
    },
  ],
};

const HERO_EVENTS = [
  {
    type: 'competitor' as const,
    icon: '↓',
    label: 'Allbirds: price drop',
    detail: 'Tree Runners dropped from $98 to $79 on all colorways',
    timeAgo: '2m ago',
    bigText: true,
  },
  {
    type: 'competitor' as const,
    icon: '✎',
    label: "Rothy's: copy change",
    detail: 'Hero changed: "Summer drop is live" added above CTA',
    timeAgo: '14m ago',
  },
  {
    type: 'competitor' as const,
    icon: '○',
    label: 'Vuori: stockout',
    detail: 'Performance Jogger in Cloud White (S, M) now out of stock',
    timeAgo: '38m ago',
  },
  {
    type: 'competitor' as const,
    icon: '★',
    label: 'Allbirds: new launch',
    detail: 'New SKU added: Tree Glider, 3 colorways, $110',
    timeAgo: '1h ago',
  },
];

export default function LandingPage() {
  return (
    <>
      <JsonLd data={SOFTWARE_SCHEMA} />

      {/* ====== NAV ====== */}
      <NavBar />

      {/* ====== HERO ====== */}
      <section className="relative py-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-10%',
            right: '-5%',
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, var(--brand-green-glow-04) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] max-[1024px]:grid-cols-1 gap-16 max-[1024px]:gap-12 items-center">
            {/* Left */}
            <div>
              <h1 className="text-[clamp(42px,5.6vw,72px)] leading-[1.02] tracking-[-0.035em] font-extrabold m-0 mb-[22px]">
                Your daily Shopify competitor brief,{' '}
                <span className="text-brand-green-ink">written automatically.</span>
              </h1>
              <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[520px] mb-8">
                Beaconmon tracks pricing changes, product launches, and content updates across every competitor you follow. One digest. Every morning at 8am.
              </p>

              <CtaForm />
              <Link
                href="/features"
                className="mt-3 inline-flex items-center gap-1 text-[14px] text-brand-dim hover:text-brand-text transition-colors"
              >
                See how it works →
              </Link>
              <p className="mt-[14px] text-[13px] text-brand-muted">
                14-day Growth trial included. No credit card required.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-[10px] text-[13px] text-brand-dim">
                <span className="inline-flex items-center gap-2"><CheckIcon /> Monitors price, launches + content changes</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> Daily brief at 8am, no dashboard required</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> Shopify-native, 5-minute setup</span>
              </div>
            </div>

            {/* Right — intelligence mockup */}
            <IntelligenceMockup
              storeLabel="yourstore.myshopify.com"
              stats={{ competitorMoves: 7, storeChanges: 4, storeChangesLabel: 'price drops', smartAlerts: 3, smartAlertsLabel: 'new launches' }}
              events={HERO_EVENTS}
              slackNotification={{
                title: 'Beaconmon',
                body: 'Allbirds dropped Tree Runners to $79. You were $98.',
                timeAgo: '2m ago',
                channel: '#ecom-intel',
              }}
            />
          </div>
        </div>
      </section>

      {/* ====== LOGO STRIP ====== */}
      <section className="border-t border-b border-brand-line-soft bg-brand-bg-section py-11">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <p className="text-center text-[12px] tracking-[0.08em] uppercase text-brand-muted mb-6">
            Trusted by merchants on
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap">
            <Link href="/for/shopify" className="text-[16px] font-medium text-brand-muted opacity-60 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Shopify</Link>
            <Link href="/for/woocommerce" className="text-[16px] font-medium text-brand-muted opacity-60 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">WooCommerce</Link>
          </div>
        </div>
      </section>

      {/* ====== WHAT IS BEACONMON ====== */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[780px] mx-auto px-8 max-[640px]:px-5">
          <h2 className="text-[clamp(24px,3vw,34px)] tracking-[-0.025em] font-extrabold mb-5">Website and competitor intelligence for eCommerce stores</h2>
          <div className="text-brand-dim text-[16px] leading-[1.7] space-y-4">
            <p>
              Beaconmon is a monitoring platform built specifically for Shopify and WooCommerce store owners. It checks your store pages every 30 seconds (Scale plan) to 5 minutes (Free plan) and sends an alert within 60 seconds of a confirmed failure, before a customer notices or emails you.
            </p>
            <p>
              Beyond uptime, Beaconmon monitors competitor product pages, pricing pages, and homepage hero sections for content changes. When a competitor drops a price or runs a promotion, Beaconmon detects the change and notifies you immediately or includes it in your next Intelligence Digest.
            </p>
            <p>
              The Intelligence Digest is a scheduled email or Slack message summarizing every competitor move and store anomaly from the previous period. Growth and Scale plan subscribers receive a daily digest. All plans receive a weekly digest.
            </p>
            <p>
              Beaconmon tracks six monitor types: HTTP uptime, SSL certificate expiry, domain expiry, TCP port status, keyword presence, and content change detection. No code changes or plugins required to get started.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[14px]">
            <Link href="/shopify-competitor-monitoring" className="text-brand-green-ink hover:underline">Shopify competitor monitoring</Link>
            <Link href="/competitor-price-tracking" className="text-brand-green-ink hover:underline">Competitor price tracking</Link>
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-green-ink hover:underline">Competitor intelligence guide</Link>
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-brand-green-ink hover:underline">Uptime monitoring for eCommerce</Link>
            <Link href="/website-change-detection" className="text-brand-green-ink hover:underline">Website change detection</Link>
          </div>
        </div>
      </section>

      {/* ====== PAIN ====== */}
      <section className="py-[120px] max-[640px]:py-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-[radial-gradient(ellipse_at_top,var(--brand-red-glow-04),transparent_60%),var(--brand-pain-card-bg)] border border-brand-line rounded-[20px] px-[60px] py-20 max-[640px]:px-6 max-[640px]:py-12 text-center max-w-[920px] mx-auto relative overflow-hidden">
            <div className="relative m-0 text-[clamp(24px,3vw,36px)] leading-[1.25] font-semibold tracking-[-0.02em] max-w-[760px] mx-auto mb-6">
              <p className="m-0">Your competitor dropped prices at 2am. You found out at 11am, from a customer asking for a match.</p>
              <p className="text-brand-muted text-[16px] font-normal mt-3 tracking-normal">Sound familiar?</p>
            </div>
            <p className="text-brand-dim text-[15px] max-w-[560px] mx-auto mb-7 leading-[1.6]">
              Generic uptime tools tell you when your site is down. They don&apos;t write your competitor brief. Beaconmon snapshots competitor pages every hour, classifies every change, and compiles your morning briefing automatically.
            </p>
            <span className="text-brand-green-ink text-[15px] font-semibold inline-flex items-center gap-[10px]">
              <span aria-hidden className="block w-6 h-px bg-brand-green" />
              One pane, both sides of the fence
            </span>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-[100px] border-t border-brand-line-soft bg-brand-bg-section">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Three steps. About five minutes.</h2>
            <p className="text-brand-dim text-[17px] max-w-[520px] mx-auto">No agents. No DNS config. No code changes. Paste, pick, done.</p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-2">
            {[
              {
                num: '01. Add your store',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
                heading: 'Paste your Shopify or WooCommerce URL.',
                body: "We auto-detect product pages, cart, and checkout, and propose a sensible monitor bundle. Confirm and you're live in under a minute.",
              },
              {
                num: '02. Add competitors to watch',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
                heading: 'List the brands you actually compare against.',
                body: 'We snapshot their content, prices, and homepage hero every check. Any change lands in your feed and your digest automatically.',
              },
              {
                num: '03. Read your morning digest',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                ),
                heading: 'Every morning at 8am.',
                body: 'Outages, content edits, pricing changes, SEO moves. In your inbox, Slack, or webhook of choice. No dashboard required.',
              },
            ].map(({ num, icon, heading, body }) => (
              <div key={num} className="reveal p-8 bg-brand-bg1 border border-brand-line-soft rounded-[14px]">
                <div className="font-mono text-[13px] text-brand-green-ink mb-8 flex items-center justify-between">
                  <span>{num}</span>
                  <span className="w-9 h-9 bg-brand-bg3 border border-brand-line rounded-[9px] inline-flex items-center justify-center text-brand-green-ink">
                    {icon}
                  </span>
                </div>
                <h3 className="text-[20px] font-bold tracking-[-0.015em] mb-[10px]">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.6]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== DETECT, CLASSIFY, BRIEF ====== */}
      <section className="py-[100px]" id="features">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">How Beaconmon works</span>
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">
              Detect. Classify. Brief.
            </h2>
            <p className="text-brand-dim text-[17px] max-w-[540px] mx-auto">Three stages, one morning email, no manual checking.</p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-4">
            {[
              {
                step: '01',
                label: 'Detect',
                labelColor: 'text-amber-500',
                heading: 'We crawl your competitors while you sleep.',
                body: 'Add competitor URLs and Beaconmon snapshots their product pages, price pages, and hero sections every hour. Any change is captured and timestamped.',
              },
              {
                step: '02',
                label: 'Classify',
                labelColor: 'text-brand-green-ink',
                heading: 'Every change is labeled, not just logged.',
                body: 'Price drop, new product launch, stockout, copy change, SEO edit. Each event is classified so your brief is scannable, not a dump of raw diffs.',
              },
              {
                step: '03',
                label: 'Brief',
                labelColor: 'text-blue-400',
                heading: 'Your morning brief, at 8am sharp.',
                body: 'A daily brief, automatically compiled from your competitor moves. Like having a research analyst watching 10 competitors full-time.',
              },
            ].map(({ step, label, labelColor, heading, body }) => (
              <div key={step} className="reveal p-8 bg-brand-bg1 border border-brand-line-soft rounded-[14px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className={`text-[11px] font-semibold tracking-[0.08em] uppercase ${labelColor}`}>{label}</span>
                  <span className="font-mono text-[13px] text-brand-muted">{step}</span>
                </div>
                <h3 className="text-[20px] font-bold tracking-[-0.015em] mb-[10px]">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.6]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COMPARISON ====== */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">How Beaconmon compares to generic uptime and competitor monitoring tools</h2>
            <p className="text-brand-dim text-[17px] max-w-[540px] mx-auto">A quick side-by-side with the alternatives.</p>
          </div>
          <div className="reveal max-w-[920px] mx-auto overflow-x-auto border border-brand-line rounded-[14px] bg-brand-bg1">
            <table className="w-full border-collapse min-w-[620px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft">Feature</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-green-ink font-semibold border-b border-brand-line-soft bg-[var(--brand-green-glow-04)] border-l border-r border-[var(--brand-green-border-20)]">Beaconmon</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">
                    <Link href="/vs/visualping" className="hover:text-brand-dim transition-colors">Visualping</Link>
                  </th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Prisync</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feat: 'Uptime monitoring (30s)',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Competitor price tracking',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted text-[12px]">Pages only</span>,
                    ps: <span className="text-brand-green-ink font-semibold">✓</span>,
                  },
                  {
                    feat: 'Daily intelligence digest',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Event classification',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted text-[12px]">Pricing only</span>,
                  },
                  {
                    feat: 'Shopify-native setup',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Status pages included',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'HTML-first monitoring',
                    bm: <span className="text-brand-green-ink font-semibold text-[12px]">✓ faster checks</span>,
                    vp: <span className="text-brand-muted text-[12px]">JS renderer</span>,
                    ps: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Starts at',
                    bm: <span className="font-mono">$0</span>,
                    vp: <span className="font-mono">$0</span>,
                    ps: <span className="font-mono">$99/mo</span>,
                  },
                ].map(({ feat, bm, vp, ps }, i, arr) => (
                  <tr key={feat}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feat}</td>
                    <td className={`p-4 text-[14px] bg-[var(--brand-green-glow-04)] border-l border-r border-[var(--brand-green-border-20)] ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{bm}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{vp}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{ps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section className="py-[100px] border-t border-brand-line-soft bg-brand-bg-section" id="pricing">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Simple pricing. No surprises.</h2>
            <p className="text-brand-dim text-[17px]">Start free. Upgrade when you need more.</p>
          </div>
          <PricingToggle />
          <p className="text-center mt-8 text-brand-muted text-[13px] max-w-[600px] mx-auto leading-[1.6]">
            Shopify catalog tracking on your competitors, plus uptime monitoring, daily briefings, and status pages. Annual billing saves 20%. No contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="py-[120px] relative overflow-hidden border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center relative">
          <h2 className="text-[clamp(36px,4.6vw,60px)] tracking-[-0.035em] leading-[1.08] font-extrabold mb-[18px]">
            Stop being the last to know.<br />About your store. About theirs.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. Add competitors when you&apos;re ready. Set up in five minutes.</p>
          <CtaForm className="mx-auto mb-4" />
          <p className="text-[13px] text-brand-muted">14-day Growth trial included. No credit card required.</p>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

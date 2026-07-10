import NavBar from '@/components/marketing/NavBar';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import PricingToggle from '@/components/marketing/PricingToggle';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Intelligence & Uptime Monitoring for eCommerce | Beaconmon',
  description:
    "Beaconmon tracks your Shopify competitors' prices, launches, and promos. Daily brief at 8am. Set up in five minutes. Free to start.",
  alternates: { canonical: 'https://beaconmon.com' },
  openGraph: { url: 'https://beaconmon.com' },
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

const FAQ_ITEMS = [
  {
    q: 'Does this work with any Shopify competitor store?',
    a: "Beaconmon monitors public-facing pages, so it works on any publicly accessible Shopify or WooCommerce store. It doesn't need credentials or API access for competitor stores.",
  },
  {
    q: 'How accurate is the price data?',
    a: 'We scan the actual product pages your customers see, so you get the live displayed price. Sale prices and compare-at prices are both captured when they appear on the page.',
  },
  {
    q: 'Does Beaconmon need access to my Shopify admin?',
    a: 'No. Monitoring your own store only needs your public URL. We auto-detect your product pages, cart, and checkout from there. No Shopify credentials required.',
  },
  {
    q: "What's the difference between a price drop and a flash sale?",
    a: 'When a compare-at price appears alongside a lower sale price, we classify it as a promotion. A straight price reduction with no compare-at is logged as a permanent drop. Growth and Scale plans get the breakdown in plain language in the brief.',
  },
  {
    q: 'What if a competitor uses Cloudflare or restricts scraping?',
    a: 'Beaconmon uses HTML monitoring on public pages. Most product listing pages and homepages are accessible. Login-gated pages and stores with aggressive bot-blocking are not supported.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts, no cancellation fees. Cancel from your account settings and your plan stays active until the end of the billing period.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={faqSchema} />

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
                Know what competitors changed{' '}
                <span className="text-brand-green-ink">before it costs you sales.</span>
              </h1>
              <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[520px] mb-8">
                Every price drop, product launch, and promo from your Shopify competitors lands in one email at 8am. No dashboard. No tab-checking.
              </p>

              <CtaForm />
              <Link
                href="/features"
                className="mt-3 inline-flex items-center gap-1 text-[14px] text-brand-dim hover:text-brand-text transition-colors"
              >
                See how it works →
              </Link>
              <p className="mt-[14px] text-[13px] text-brand-muted">
                Free forever for 1 competitor. 14-day Growth trial. No credit card.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-[10px] text-[13px] text-brand-dim">
                <span className="inline-flex items-center gap-2"><CheckIcon /> Tracks price drops, launches, and promos</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> One morning email, no dashboard to check</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> Shopify setup in 5 minutes</span>
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

      {/* ====== STATS STRIP ====== */}
      <section className="border-t border-b border-brand-line-soft bg-brand-bg-section py-10">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="grid grid-cols-4 max-[640px]:grid-cols-2 gap-8 text-center">
            {[
              { stat: 'Hourly', label: 'competitor page checks' },
              { stat: '8am', label: 'daily brief, every day' },
              { stat: '5 min', label: 'to set up' },
              { stat: 'Free', label: '1 competitor, forever' },
            ].map(({ stat, label }) => (
              <div key={stat} className="flex flex-col gap-1">
                <span className="text-[28px] font-extrabold tracking-[-0.03em] text-brand-text">{stat}</span>
                <span className="text-[13px] text-brand-muted">{label}</span>
              </div>
            ))}
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
              One place. Your store and theirs.
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
                num: '03. Read your morning brief',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                ),
                heading: 'Every morning at 8am.',
                body: 'Price moves, new launches, content edits, and your own store status. In your inbox, Slack, or webhook of choice. No dashboard required.',
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

      {/* ====== WHAT'S IN YOUR BRIEF ====== */}
      <section className="py-[100px]" id="features">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">
              Your brief. Delivered at 8am.
            </h2>
            <p className="text-brand-dim text-[17px] max-w-[540px] mx-auto">Competitor price moves, new launches, and your own store status. One email covers all three.</p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-4">
            {[
              {
                step: '01',
                label: 'Prices + promos',
                labelColor: 'text-amber-500',
                heading: 'Price moves, caught overnight.',
                body: 'Every price drop and flash sale your competitors ran since your last brief. You see the old price, the new price, and when it changed.',
              },
              {
                step: '02',
                label: 'Launches + changes',
                labelColor: 'text-brand-green-ink',
                heading: 'New products and copy edits.',
                body: 'New SKUs, restocks, colorways, and homepage copy changes. Each one labeled as a drop, launch, stockout, or edit so your brief scans in two minutes.',
              },
              {
                step: '03',
                label: 'Your store',
                labelColor: 'text-blue-400',
                heading: 'Your own store, watched too.',
                body: 'Checkout down? Key page changed unexpectedly? You hear before a customer does. Both sides of the market, one morning email.',
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

      {/* ====== TESTIMONIALS — placeholder removed; add real quotes when available ====== */}

      {/* ====== COMPARISON ====== */}
      <section className="py-[100px] border-t border-brand-line-soft bg-brand-bg-section">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">How Beaconmon compares</h2>
            <p className="text-brand-dim text-[17px] max-w-[540px] mx-auto">Side by side with the tools Shopify merchants usually try first.</p>
          </div>
          <div className="reveal max-w-[1060px] mx-auto overflow-x-auto border border-brand-line rounded-[14px] bg-brand-bg1">
            <table className="w-full border-collapse min-w-[760px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft">Feature</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-green-ink font-semibold border-b border-brand-line-soft bg-[var(--brand-green-glow-04)] border-l border-r border-[var(--brand-green-border-20)]">Beaconmon</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">
                    <Link href="/vs/visualping" className="hover:text-brand-dim transition-colors">Visualping</Link>
                  </th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Prisync</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Manual</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feat: 'Competitor price tracking',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted text-[12px]">Pages only</span>,
                    ps: <span className="text-brand-green-ink font-semibold">✓</span>,
                    mn: <span className="text-brand-muted text-[12px]">Tab by tab</span>,
                  },
                  {
                    feat: 'Daily morning brief',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted">—</span>,
                    mn: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Change labels (drop / sale / launch)',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted text-[12px]">Pricing only</span>,
                    mn: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Shopify-native setup',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted">—</span>,
                    mn: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Uptime monitoring (30s)',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted">—</span>,
                    mn: <span className="text-brand-muted text-[12px]">Customer complaint</span>,
                  },
                  {
                    feat: 'Status pages included',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted">—</span>,
                    ps: <span className="text-brand-muted">—</span>,
                    mn: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'No code or plugins needed',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    vp: <span className="text-brand-muted text-[12px]">JS renderer required</span>,
                    ps: <span className="text-brand-muted">—</span>,
                    mn: <span className="text-brand-green-ink font-semibold">✓</span>,
                  },
                  {
                    feat: 'Starts at',
                    bm: <span className="font-mono">$0</span>,
                    vp: <span className="font-mono">$0</span>,
                    ps: <span className="font-mono">$99/mo</span>,
                    mn: <span className="text-brand-muted text-[12px]">Your time</span>,
                  },
                ].map(({ feat, bm, vp, ps, mn }, i, arr) => (
                  <tr key={feat}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feat}</td>
                    <td className={`p-4 text-[14px] bg-[var(--brand-green-glow-04)] border-l border-r border-[var(--brand-green-border-20)] ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{bm}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{vp}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{ps}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{mn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ====== FREE TOOL CALLOUT ====== */}
      <section className="py-14 border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal flex flex-col sm:flex-row items-center justify-between gap-6 bg-brand-bg1 border border-brand-line-soft rounded-[14px] px-8 py-6">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-1">Free tool</p>
              <p className="text-[17px] font-semibold tracking-[-0.01em] m-0">Not ready to sign up? Try the Shopify Competitor Snapshot.</p>
              <p className="text-[14px] text-brand-dim mt-1">Paste any Shopify store URL and get a free instant snapshot of their prices, products, and promotions.</p>
            </div>
            <Link
              href="/tools/shopify-competitor-snapshot"
              className="shrink-0 inline-flex items-center justify-center h-10 px-5 text-[14px] font-semibold rounded-lg bg-brand-bg2 text-brand-text border border-brand-line hover:bg-brand-bg3 hover:border-brand-muted transition-all whitespace-nowrap"
            >
              Try it free →
            </Link>
          </div>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section className="py-[100px] border-t border-brand-line-soft" id="pricing">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Simple pricing. No surprises.</h2>
            <p className="text-brand-dim text-[17px]">Start free. Upgrade when you need more.</p>
            <p className="text-brand-muted text-[14px] mt-3">One missed competitor flash sale typically costs more than a year of Growth.</p>
          </div>
          <PricingToggle />
          <p className="text-center mt-8 text-brand-muted text-[13px] max-w-[600px] mx-auto leading-[1.6]">
            Shopify catalog tracking on your competitors, plus uptime monitoring, daily briefings, and status pages. Annual billing saves 20%. No contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="py-[100px] border-t border-brand-line-soft bg-brand-bg-section">
        <div className="max-w-[780px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Common questions</h2>
          </div>
          <div className="divide-y divide-brand-line-soft">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="reveal group py-6 cursor-pointer">
                <summary className="flex items-start justify-between gap-4 text-[17px] font-semibold tracking-[-0.01em] list-none marker:hidden [&::-webkit-details-marker]:hidden">
                  <span>{q}</span>
                  <span className="text-brand-muted text-[22px] leading-none shrink-0 mt-[2px] group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <p className="mt-4 text-brand-dim text-[15px] leading-[1.65] pb-1">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ====== GUIDES (SEO internal links) ====== */}
      <section className="py-14 border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <p className="text-center text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-7">Further reading</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link href="/shopify-competitor-monitoring" className="text-[14px] text-brand-dim hover:text-brand-green-ink transition-colors">Shopify competitor monitoring</Link>
            <Link href="/competitor-price-tracking" className="text-[14px] text-brand-dim hover:text-brand-green-ink transition-colors">Competitor price tracking</Link>
            <Link href="/ecommerce-competitor-intelligence" className="text-[14px] text-brand-dim hover:text-brand-green-ink transition-colors">Competitor intelligence guide</Link>
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-[14px] text-brand-dim hover:text-brand-green-ink transition-colors">Uptime monitoring for eCommerce</Link>
            <Link href="/website-change-detection" className="text-[14px] text-brand-dim hover:text-brand-green-ink transition-colors">Website change detection</Link>
          </div>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="py-[120px] relative overflow-hidden border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center relative">
          <h2 className="text-[clamp(36px,4.6vw,60px)] tracking-[-0.035em] leading-[1.08] font-extrabold mb-[18px]">
            Stop being the last to know.<br />About your store. About theirs.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Track 1 competitor free, forever. Add more when you need them. Set up in five minutes.</p>
          <CtaForm className="mx-auto mb-4" />
          <p className="text-[13px] text-brand-muted">Free forever for 1 competitor. 14-day Growth trial. No credit card.</p>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

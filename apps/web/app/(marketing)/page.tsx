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
  title: 'Store and Competitor Monitoring | Beaconmon',
  description:
    'Monitor your store and competitors automatically. Know about outages, pricing changes, SEO edits, SSL expiry, and competitor updates before they hurt sales.',
  alternates: { canonical: 'https://beaconmon.com' },
};

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Beaconmon',
  url: 'https://beaconmon.com',
  description: 'Store and competitor monitoring for e-commerce businesses.',
  email: 'hello@beaconmon.com',
  sameAs: ['https://beaconmon.com'],
};

const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Beaconmon',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com',
  description:
    'Store monitoring and competitor intelligence service. Monitors your store for downtime, checkout failures, SSL expiry, and domain expiry. Tracks competitor pricing and page updates. Alerts via email, Slack, or webhook.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'USD',
      description: '10 monitors, 5-minute check interval, 1 status page',
    },
    {
      '@type': 'Offer',
      name: 'Starter',
      price: String(PRICING.starter.monthly),
      priceCurrency: 'USD',
      description: '25 monitors, 1-minute check interval, 5 competitor monitors, 3 status pages',
    },
    {
      '@type': 'Offer',
      name: 'Growth',
      price: String(PRICING.growth.monthly),
      priceCurrency: 'USD',
      description: '100 monitors, 25 competitor monitors, AI content-diff, multi-location checks',
    },
    {
      '@type': 'Offer',
      name: 'Scale',
      price: String(PRICING.scale.monthly),
      priceCurrency: 'USD',
      description: 'Unlimited monitors, 30-second check interval, unlimited competitor monitors',
    },
  ],
};

const HERO_EVENTS = [
  {
    type: 'competitor' as const,
    icon: '↓',
    label: 'Allbirds — price drop',
    detail: 'Tree Runners dropped from $98 to $79 on all colorways',
    timeAgo: '2m ago',
    bigText: true,
  },
  {
    type: 'competitor' as const,
    icon: '✎',
    label: "Rothy's — copy change",
    detail: 'Hero changed: "Summer drop is live" added above CTA',
    timeAgo: '14m ago',
  },
  {
    type: 'alert' as const,
    icon: '!',
    label: 'Checkout alert',
    detail: 'yourstore.com/checkout returned 502 — 1 check failed',
    timeAgo: '31m ago',
  },
  {
    type: 'store' as const,
    icon: '✓',
    label: 'Deploy detected',
    detail: 'yourstore.com homepage content changed after deploy',
    timeAgo: '1h ago',
  },
];

export default function LandingPage() {
  return (
    <>
      <JsonLd data={[ORGANIZATION_SCHEMA, SOFTWARE_SCHEMA]} />

      {/* ====== NAV ====== */}
      <NavBar />

      {/* ====== HERO ====== */}
      <section className="relative py-[100px] max-[1024px]:py-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-40%',
            right: '-10%',
            width: 800,
            height: 800,
            background: 'radial-gradient(circle, rgba(0,229,122,0.10) 0%, rgba(0,229,122,0.04) 40%, transparent 70%)',
          }}
        />

        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] max-[1024px]:grid-cols-1 gap-16 max-[1024px]:gap-12 items-center">
            {/* Left */}
            <div>
              <a
                href="/features"
                className="inline-flex items-center gap-2 text-[12px] font-semibold text-brand-green-ink border border-[rgba(0,229,122,0.25)] bg-[rgba(0,229,122,0.06)] rounded-full px-3 py-1 mb-5 hover:bg-[rgba(0,229,122,0.10)] transition-colors"
              >
                Now for ecommerce · competitor monitoring is live →
              </a>
              <h1 className="text-[clamp(42px,5.6vw,72px)] leading-[1.02] tracking-[-0.035em] font-extrabold m-0 mb-[22px]">
                Monitor your store and{' '}
                <span className="text-brand-green-ink">competitors automatically.</span>
              </h1>
              <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[520px] mb-8">
                Beaconmon watches your Shopify store for outages, SSL expiry, pricing changes and SEO edits, and quietly tracks the same on every competitor you care about. Find out before your customers do. Or before your customers go to them.
              </p>

              <CtaForm />
              <p className="mt-[14px] text-[13px] text-brand-muted">
                Free forever for 10 monitors. No credit card required.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-[10px] text-[13px] text-brand-dim">
                <span className="inline-flex items-center gap-2"><CheckIcon /> Shopify &amp; WooCommerce native</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> Detects pricing + content changes</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> Daily intelligence digest</span>
              </div>
            </div>

            {/* Right — intelligence mockup */}
            <IntelligenceMockup
              storeLabel="yourstore.myshopify.com"
              stats={{ competitorMoves: 7, storeChanges: 2, storeChangesLabel: 'store events', smartAlerts: 1, smartAlertsLabel: 'smart alerts' }}
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
            Built for stores on
          </p>
          <div className="flex justify-between items-center gap-8 flex-wrap">
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Shopify</span>
            <span className="text-[17px] font-medium italic text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">WooCommerce</span>
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">BigCommerce</span>
            <span className="text-[17px] font-bold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Webflow Ecom</span>
            <span className="text-[17px] font-bold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Squarespace</span>
            <span className="text-[13px] font-bold tracking-[0.06em] uppercase text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Magento</span>
          </div>
        </div>
      </section>

      {/* ====== PAIN ====== */}
      <section className="py-[120px] max-[640px]:py-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-[radial-gradient(ellipse_at_top,rgba(255,68,68,0.04),transparent_60%),#0E0E14] border border-brand-line rounded-[20px] px-[60px] py-20 max-[640px]:px-6 max-[640px]:py-12 text-center max-w-[920px] mx-auto relative overflow-hidden">
            <span aria-hidden className="absolute top-[10px] left-10 font-serif text-[160px] text-brand-line leading-none select-none">&ldquo;</span>
            <blockquote className="relative m-0 text-[clamp(24px,3vw,36px)] leading-[1.25] font-semibold tracking-[-0.02em] max-w-[760px] mx-auto mb-6">
              Your competitor dropped prices at 2am. You found out at 11am, from a customer asking for a match.
            </blockquote>
            <p className="text-brand-dim text-[15px] max-w-[560px] mx-auto mb-7 leading-[1.6]">
              Generic uptime tools tell you when your store is on fire. They don't tell you when your competitor changed their hero, slashed a price, or quietly launched a new collection. Beaconmon does both, in one feed.
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
                body: 'We auto-detect product pages, cart, and checkout, and propose a sensible monitor bundle. Confirm and you\'re live in under a minute.',
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

      {/* ====== BENTO ====== */}
      <section className="py-[100px]" id="features">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Features</span>
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">
              Two products. One pane.
            </h2>
            <p className="text-brand-dim text-[17px] max-w-[600px] mx-auto">Everything you'd expect from a serious uptime tool, plus the competitor side most teams quietly cobble together with bookmarks and screenshots.</p>
          </div>

          <div className="grid grid-cols-6 max-[880px]:grid-cols-1 gap-4" style={{ gridAutoRows: 'minmax(240px,auto)' }}>
            {/* Large 1 — competitor intelligence */}
            <div className="reveal col-span-4 max-[880px]:col-span-1 row-span-2 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden flex flex-col">
              <div className="p-7 pb-4">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-amber-500 mb-[10px]">Competitor intelligence</span>
                <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-[10px] leading-[1.2]">See what your competitors changed. Before your customers point it out.</h3>
                <p className="text-brand-dim text-[14px] leading-[1.55]">Track competitor price pages and product listings. Get alerted the moment they update pricing, run a promotion, or rewrite their hero.</p>
              </div>
              <div className="mt-auto p-2 pt-0 flex items-end flex-1">
                <div className="bg-brand-bg2 border border-brand-line-soft rounded-[10px] mx-[10px] mb-[10px] w-full overflow-hidden">
                  <div className="px-4 py-3 border-b border-brand-line-soft flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-text">allbirds.com/products/tree-runners</span>
                    <span className="text-[10px] font-semibold text-amber-500 bg-amber-400/10 px-2 py-[2px] rounded border border-amber-400/20">Price change</span>
                  </div>
                  <div className="px-4 py-3 font-mono text-[12px] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-red-400 shrink-0">-</span>
                      <span className="line-through text-red-400/70">$98.00</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-green-400 shrink-0">+</span>
                      <span className="text-green-400">$79.00</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-brand-line-soft bg-[rgba(0,229,122,0.02)]">
                    <p className="text-[11px] text-brand-muted">AI summary: Sale pricing applied to all colorways. 19% reduction, likely flash sale.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small — uptime */}
            <div className="reveal col-span-2 max-[880px]:col-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="p-7 pb-5">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green-ink mb-[10px]">Uptime monitoring</span>
                <h3 className="text-[17px] font-bold tracking-[-0.02em] mb-2">30-second checks from multiple regions.</h3>
                <p className="text-brand-dim text-[13px] leading-[1.55]">One blip doesn't trigger an alert. We confirm from two locations to eliminate false alarms.</p>
              </div>
            </div>

            {/* Small — content change */}
            <div className="reveal col-span-2 max-[880px]:col-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="p-7 pb-5">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green-ink mb-[10px]">Content change detection</span>
                <h3 className="text-[17px] font-bold tracking-[-0.02em] mb-2">Monitor any page for content changes.</h3>
                <p className="text-brand-dim text-[13px] leading-[1.55]">Pricing, availability, terms, or any text you care about. See exactly what changed and when.</p>
              </div>
            </div>

            {/* Large 2 — daily digest */}
            <div className="reveal col-span-4 max-[880px]:col-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden flex flex-col">
              <div className="p-7 pb-4">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green-ink mb-[10px]">Daily digest</span>
                <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-[10px] leading-[1.2]">Your morning briefing. One email. Everything that mattered.</h3>
                <p className="text-brand-dim text-[14px] leading-[1.55]">Every morning at 8am: outages, content edits, pricing changes, SEO moves, across your store and every competitor you track.</p>
              </div>
              <div className="mt-auto px-[18px] pb-[14px]">
                <div className="bg-brand-bg2 border border-brand-line-soft rounded-[10px] overflow-hidden">
                  <div className="px-4 py-[10px] bg-[rgba(0,229,122,0.04)] border-b border-brand-line-soft flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[rgba(255,255,255,0.12)]" />
                    <span className="text-[11px] text-brand-muted font-medium">Intelligence Digest · Mon May 20</span>
                  </div>
                  <div className="px-4 py-3 space-y-[6px]">
                    {[
                      { dot: 'bg-amber-400', text: '3 competitor moves — Allbirds price drop, Rothys hero change, HOKA new collection' },
                      { dot: 'bg-green-400', text: 'All 12 store monitors up · 99.97% uptime this week' },
                      { dot: 'bg-yellow-400', text: '1 smart alert · Response time spike on /checkout at 3:14am' },
                    ].map(({ dot, text }, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-brand-dim">
                        <span className={`shrink-0 mt-[5px] w-[6px] h-[6px] rounded-full ${dot}`} />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Small — status pages */}
            <div className="reveal col-span-2 max-[880px]:col-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="p-7 pb-5">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green-ink mb-[10px]">Public status pages</span>
                <h3 className="text-[17px] font-bold tracking-[-0.02em] mb-2">Status pages your customers will actually trust.</h3>
                <p className="text-brand-dim text-[13px] leading-[1.55]">At your own domain. Looks professional. Takes 2 minutes to set up.</p>
              </div>
            </div>

            {/* Small — reliability targets */}
            <div className="reveal col-span-2 max-[880px]:col-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="p-7 pb-5">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green-ink mb-[10px]">Reliability Targets</span>
                <h3 className="text-[17px] font-bold tracking-[-0.02em] mb-2">Set SLOs and burn-rate alerts per monitor.</h3>
                <p className="text-brand-dim text-[13px] leading-[1.55]">Know the moment you're burning through your reliability budget, not after the month ends.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== COMPARISON ====== */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Same uptime promise. Competitor intelligence on top.</h2>
            <p className="text-brand-dim text-[17px] max-w-[540px] mx-auto">A quick side-by-side with the incumbents.</p>
          </div>
          <div className="reveal max-w-[920px] mx-auto overflow-x-auto border border-brand-line rounded-[14px] bg-brand-bg1">
            <table className="w-full border-collapse min-w-[620px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft">Feature</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-green-ink font-semibold border-b border-brand-line-soft bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)]">Beaconmon</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">
                    <Link href="/vs/uptimerobot" className="hover:text-brand-dim transition-colors">UptimeRobot</Link>
                  </th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">
                    <Link href="/vs/pingdom" className="hover:text-brand-dim transition-colors">Pingdom</Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feat: 'Uptime monitoring (30s)',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    ur: <span className="font-mono">✓ <span className="text-brand-muted text-[12px]">5min</span></span>,
                    p: <span className="text-brand-green-ink font-semibold">✓</span>,
                  },
                  {
                    feat: 'Competitor monitoring',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    ur: <span className="text-brand-muted">—</span>,
                    p: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Content change detection',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    ur: <span className="text-brand-muted">—</span>,
                    p: <span className="text-brand-muted text-[12px]">✓ paid</span>,
                  },
                  {
                    feat: 'Pricing change alerts',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    ur: <span className="text-brand-muted">—</span>,
                    p: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Daily intelligence digest',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    ur: <span className="text-brand-muted">—</span>,
                    p: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Status pages included',
                    bm: <span className="text-brand-green-ink font-semibold">✓</span>,
                    ur: 'Basic',
                    p: 'Extra cost',
                  },
                  {
                    feat: 'Starts at',
                    bm: <span className="font-mono">$0</span>,
                    ur: <span className="font-mono">$0</span>,
                    p: <span className="font-mono">$15</span>,
                  },
                ].map(({ feat, bm, ur, p }, i, arr) => (
                  <tr key={feat}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feat}</td>
                    <td className={`p-4 text-[14px] bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)] ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{bm}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{ur}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < arr.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{p}</td>
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
            All plans include SSL monitoring, domain expiry alerts, and public status pages. Annual billing saves 20%. No contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* ====== FINAL CTA ====== */}
      <section className="py-[120px] relative overflow-hidden border-t border-brand-line-soft">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            bottom: '-50%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 900,
            height: 600,
            background: 'radial-gradient(ellipse, rgba(0,229,122,0.18), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center relative">
          <h2 className="text-[clamp(36px,4.6vw,60px)] tracking-[-0.035em] leading-[1.08] font-extrabold mb-[18px]">
            Stop being the last to know.<br />About your store. About theirs.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. Add competitors when you're ready. Set up in five minutes.</p>
          <CtaForm className="mx-auto mb-4" />
          <p className="text-[13px] text-brand-muted">No credit card · Cancel anytime · Made in Europe</p>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

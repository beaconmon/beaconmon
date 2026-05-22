import NavBar from '@/components/marketing/NavBar';
import DashboardPreview from '@/components/marketing/DashboardPreview';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import PricingToggle from '@/components/marketing/PricingToggle';
import { PRICING } from '@/lib/pricing';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Store and competitor monitoring</span>
              <h1 className="text-[clamp(42px,5.6vw,72px)] leading-[1.02] tracking-[-0.035em] font-extrabold m-0 mb-[22px]">
                Monitor your store and{' '}
                <span className="text-brand-green-ink">competitors automatically.</span>
              </h1>
              <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[520px] mb-8">
                Know about outages, pricing changes, SEO edits, SSL expiry, and competitor updates before they hurt sales.
              </p>

              <CtaForm />
              <p className="mt-[14px] text-[13px] text-brand-muted">
                Free forever for 10 monitors. No credit card required.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-[10px] text-[13px] text-brand-dim">
                <span className="inline-flex items-center gap-2"><CheckIcon /> 30-second checks</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> Competitor monitoring</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> SSL &amp; domain alerts included</span>
              </div>
            </div>

            {/* Right — dashboard preview */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ====== LOGO STRIP ====== */}
      <section className="border-t border-b border-brand-line-soft bg-brand-bg-section py-11">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <p className="text-center text-[12px] tracking-[0.08em] uppercase text-brand-muted mb-6">
            Works with your store platform
          </p>
          <div className="flex justify-between items-center gap-8 flex-wrap">
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">shopify</span>
            <span className="text-[17px] font-medium italic text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">WooCommerce</span>
            <span className="text-[13px] font-bold tracking-[0.06em] uppercase text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Magento</span>
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">BigCommerce</span>
            <span className="text-[17px] font-bold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Squarespace</span>
            <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Custom</span>
          </div>
        </div>
      </section>

      {/* ====== PAIN ====== */}
      <section className="py-[120px] max-[640px]:py-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-[radial-gradient(ellipse_at_top,rgba(255,68,68,0.04),transparent_60%),#0E0E14] border border-brand-line rounded-[20px] px-[60px] py-20 max-[640px]:px-6 max-[640px]:py-12 text-center max-w-[920px] mx-auto relative overflow-hidden">
            <span aria-hidden className="absolute top-[10px] left-10 font-serif text-[160px] text-brand-line leading-none select-none">&ldquo;</span>
            <blockquote className="relative m-0 text-[clamp(24px,3vw,36px)] leading-[1.25] font-semibold tracking-[-0.02em] max-w-[760px] mx-auto mb-6">
              I found out a competitor had slashed their price because a customer emailed asking why I was more expensive.
            </blockquote>
            <p className="text-brand-dim text-[15px] max-w-[560px] mx-auto mb-7 leading-[1.6]">
              It happens to every store owner eventually. The competitor quietly drops their price during a sale weekend. You find out days later, after losing orders you never knew were at risk.
            </p>
            <span className="text-brand-green-ink text-[15px] font-semibold inline-flex items-center gap-[10px]">
              <span aria-hidden className="block w-6 h-px bg-brand-green" />
              Beaconmon makes sure you&apos;re always first to know.
            </span>
          </div>
        </div>
      </section>

      {/* ====== WHY IT MATTERS ====== */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Why it matters</span>
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">
              The cost of not knowing.
            </h2>
            <p className="text-brand-dim text-[17px] max-w-[520px] mx-auto">
              Every minute your store is down or a competitor is undercutting you, something is being lost.
            </p>
          </div>

          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-5">
            {/* Card 1 — checkout downtime */}
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 flex flex-col gap-6">
              <span className="w-12 h-12 rounded-[14px] bg-[rgba(0,229,122,0.08)] border border-[rgba(0,229,122,0.15)] inline-flex items-center justify-center text-brand-green-ink shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </span>
              <div>
                <h3 className="text-[19px] font-bold tracking-[-0.02em] mb-3 leading-[1.25]">
                  Checkout downtime is revenue out the door.
                </h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">
                  During a flash sale or peak hour, every minute your checkout is down costs you real orders. Beaconmon detects failures within 60 seconds and fires an alert before the next customer hits the error page.
                </p>
              </div>
            </div>

            {/* Card 2 — competitor changes */}
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 flex flex-col gap-6">
              <span className="w-12 h-12 rounded-[14px] bg-[rgba(0,229,122,0.08)] border border-[rgba(0,229,122,0.15)] inline-flex items-center justify-center text-brand-green-ink shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <div>
                <h3 className="text-[19px] font-bold tracking-[-0.02em] mb-3 leading-[1.25]">
                  Competitors change pricing when you&apos;re not watching.
                </h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">
                  A weekend promotion, a stealth price cut, a new bundle — competitors move quietly. Beaconmon watches their pages on the same schedule as your store and alerts you the moment something changes.
                </p>
              </div>
            </div>

            {/* Card 3 — silent failures */}
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 flex flex-col gap-6">
              <span className="w-12 h-12 rounded-[14px] bg-[rgba(0,229,122,0.08)] border border-[rgba(0,229,122,0.15)] inline-flex items-center justify-center text-brand-green-ink shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              <div>
                <h3 className="text-[19px] font-bold tracking-[-0.02em] mb-3 leading-[1.25]">
                  Silent failures hit hardest.
                </h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">
                  An expired SSL shows a browser security warning to every visitor. A lapsed domain takes your store offline entirely. A broken product page quietly rejects traffic. None of them tell you — they just cost you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-[100px] border-t border-brand-line-soft bg-brand-bg-section">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Three steps. Five minutes.</h2>
            <p className="text-brand-dim text-[17px] max-w-[520px] mx-auto">Add your URLs, get alerted, stay ahead of the market.</p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-2">
            {[
              {
                num: '01. Add your URLs',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                ),
                heading: 'Your store and your competitors.',
                body: 'Add your homepage, checkout, and product pages — then add competitor price pages alongside them. Beaconmon starts checking everything immediately. About 30 seconds per monitor.',
              },
              {
                num: '02. Get alerted instantly',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                ),
                heading: 'Outages, price drops, content edits.',
                body: 'Whether it\'s your checkout going down or a competitor slashing prices, Beaconmon fires an alert within 60 seconds. Email, Slack, or webhook — your whole team sees it at once.',
              },
              {
                num: '03. Get a weekly digest',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                ),
                heading: 'See what moved in your market.',
                body: 'A weekly intelligence digest summarizes every price change, content edit, and uptime event across your store and the competitors you track. Know your market without monitoring it manually.',
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
              Everything you need.<br />Nothing you don&apos;t.
            </h2>
            <p className="text-brand-dim text-[17px] max-w-[560px] mx-auto">Six monitor types, competitor tracking, three alert channels. No enterprise bloat.</p>
          </div>

          <div className="grid grid-cols-6 max-[880px]:grid-cols-1 gap-4" style={{ gridAutoRows: 'minmax(240px,auto)' }}>
            {/* Large 1 — uptime */}
            <div className="reveal col-span-3 max-[880px]:col-span-1 row-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden flex flex-col">
              <div className="p-7 pb-6">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green-ink mb-[10px]">Uptime monitoring</span>
                <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-[10px] leading-[1.2]">30-second checks from multiple locations.</h3>
                <p className="text-brand-dim text-[14px] leading-[1.55]">We check your store every 30 seconds from multiple regions. One blip doesn&apos;t trigger an alert — we confirm from two locations first to eliminate false alarms.</p>
              </div>
              <div className="mt-auto p-2 pt-0 flex items-end flex-1">
                <div className="bg-brand-bg2 border border-brand-line-soft rounded-[10px] p-[14px] mx-[10px] mb-[10px] w-full">
                  {[
                    { name: 'acme-storefront.com', pct: '99.98%', width: '99.98%', color: 'bg-brand-green', textColor: 'text-brand-green-ink' },
                    { name: 'checkout.acme-storefront.com', pct: '100.00%', width: '100%', color: 'bg-brand-green', textColor: 'text-brand-green-ink' },
                    { name: 'api.loomwave.io', pct: '97.14%', width: '97%', color: 'bg-brand-red', textColor: 'text-brand-red' },
                    { name: 'greenhaus-coffee.com', pct: '99.90%', width: '99.9%', color: 'bg-brand-green', textColor: 'text-brand-green-ink' },
                  ].map(({ name, pct, width, color, textColor }, i) => (
                    <div key={i} className={`flex items-center justify-between py-[6px] text-[12px] ${i > 0 ? 'border-t border-brand-line-soft' : ''}`}>
                      <span className="text-brand-dim">{name}</span>
                      <div className="h-[6px] bg-brand-bg3 rounded-[3px] overflow-hidden flex-1 mx-[10px]">
                        <div className={`h-full ${color} rounded-[3px]`} style={{ width }} />
                      </div>
                      <span className={`font-mono text-[10px] ${textColor} font-medium`}>{pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Large 2 — status pages */}
            <div className="reveal col-span-3 max-[880px]:col-span-1 row-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden flex flex-col">
              <div className="p-7 pb-6">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green-ink mb-[10px]">Public status pages</span>
                <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-[10px] leading-[1.2]">Status pages your customers will actually trust.</h3>
                <p className="text-brand-dim text-[14px] leading-[1.55]">Public status pages at your own domain. Show uptime history, active incidents, and scheduled maintenance. Looks professional. Takes 2 minutes to set up.</p>
              </div>
              <div className="mt-auto p-2 pt-0 flex items-end flex-1">
                <div className="bg-brand-bg2 border border-brand-line-soft rounded-[10px] mx-[10px] mb-[10px] w-full overflow-hidden">
                  <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-brand-line-soft text-[12px]">
                    <span className="font-semibold">status.acme-storefront.com</span>
                    <span className="text-[10px] bg-[rgba(0,229,122,0.1)] text-brand-green-ink px-2 py-[3px] rounded font-semibold border border-[rgba(0,229,122,0.2)]">All systems operational</span>
                  </div>
                  <div className="px-[14px] py-[10px] pb-3 space-y-2">
                    {[
                      { name: 'Storefront', pct: '99.98%', dots: Array(15).fill(false) },
                      { name: 'Checkout', pct: '99.72%', dots: Array(15).fill(false).map((_, i) => i === 12) },
                      { name: 'Product pages', pct: '100.00%', dots: Array(15).fill(false) },
                      { name: 'API', pct: '99.94%', dots: Array(15).fill(false) },
                    ].map(({ name, pct, dots }) => (
                      <div key={name} className="flex items-center gap-[10px] text-[11px]">
                        <span className="flex-1 text-brand-dim">{name}</span>
                        <div className="flex gap-[2px]">
                          {dots.map((isDown, i) => (
                            <span key={i} className={`inline-block w-[6px] h-[10px] rounded-[2px] ${isDown ? 'bg-brand-red' : 'bg-brand-green'} opacity-90`} />
                          ))}
                        </div>
                        <span className="font-mono text-[10px] text-brand-text font-medium">{pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Small tiles */}
            {[
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
                heading: 'SSL expiry alerts',
                body: 'Know 30 days before your SSL certificate expires. Never lose a customer to a browser security warning.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ),
                heading: 'Domain expiry tracking',
                body: 'We watch your domain renewal dates too. A lapsed domain takes your store offline completely.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
                heading: 'Competitor monitoring',
                body: 'Track competitor price pages and product listings. Get alerted the moment they update pricing or run a promotion.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                heading: 'Content change detection',
                body: 'Monitor any page for content changes — pricing, availability, terms, or any text you care about. See exactly what changed and when.',
              },
            ].map(({ icon, heading, body }) => (
              <div key={heading} className="reveal col-span-3 max-[880px]:col-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden min-h-[180px]">
                <div className="p-7 pb-6">
                  <span className="w-11 h-11 rounded-[11px] bg-[rgba(0,229,122,0.1)] border border-[rgba(0,229,122,0.2)] inline-flex items-center justify-center text-brand-green-ink mb-[18px]">
                    {icon}
                  </span>
                  <h3 className="text-[17px] font-bold tracking-[-0.02em] mb-2">{heading}</h3>
                  <p className="text-brand-dim text-[14px] leading-[1.55]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COMPARISON ====== */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Complete store monitoring. Without the enterprise price tag.</h2>
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
                    feat: 'Check frequency',
                    bm: <span className="text-brand-green-ink font-semibold font-mono">30 seconds</span>,
                    ur: <span className="font-mono">5 minutes <span className="text-brand-muted">(free)</span></span>,
                    p: <span className="font-mono">1 minute</span>,
                  },
                  {
                    feat: 'Status pages',
                    bm: <span className="text-brand-green-ink font-semibold">Included</span>,
                    ur: 'Basic only',
                    p: 'Extra cost',
                  },
                  {
                    feat: 'SSL monitoring',
                    bm: <span className="text-brand-green-ink font-semibold">Included</span>,
                    ur: <span className="text-brand-green-ink font-semibold">Yes</span>,
                    p: <span className="text-brand-green-ink font-semibold">Yes</span>,
                  },
                  {
                    feat: 'Domain expiry',
                    bm: <span className="text-brand-green-ink font-semibold">Included</span>,
                    ur: <span className="text-brand-muted">No</span>,
                    p: <span className="text-brand-muted">No</span>,
                  },
                  {
                    feat: 'Heartbeat monitoring',
                    bm: <span className="text-brand-green-ink font-semibold">Included</span>,
                    ur: <span className="text-brand-muted">No</span>,
                    p: <span className="text-brand-muted">No</span>,
                  },
                  {
                    feat: 'Competitor monitoring',
                    bm: <span className="text-brand-green-ink font-semibold">Included</span>,
                    ur: <span className="text-brand-muted">No</span>,
                    p: <span className="text-brand-muted">No</span>,
                  },
                  {
                    feat: 'Starting price',
                    bm: <span className="font-mono">${PRICING.starter.monthly}/mo</span>,
                    ur: <span className="font-mono">$7/mo</span>,
                    p: <span className="font-mono">$15/mo</span>,
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

      {/* ====== FAQ ====== */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="grid grid-cols-[minmax(0,360px)_1fr] max-[880px]:grid-cols-1 gap-20 max-[880px]:gap-8 max-w-[1040px] mx-auto">
            {/* Left */}
            <div className="reveal">
              <h2 className="text-[clamp(32px,3.6vw,42px)] tracking-[-0.03em] font-extrabold mb-[14px] leading-[1.1]">
                Questions?<br />Good.
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.6]">
                The most common ones, answered plainly. Need more?{' '}
                <a href="mailto:hello@beaconmon.com" className="text-brand-green-ink border-b border-[rgba(0,229,122,0.4)] hover:border-brand-green transition-colors">
                  Email us
                </a>{' '}
                — a real person reads every message.
              </p>
            </div>
            {/* Right */}
            <div className="reveal">
              <Accordion type="single" collapsible defaultValue="item-1">
                {[
                  {
                    q: 'Does this work with Shopify, WooCommerce, and other platforms?',
                    a: 'Yes — Beaconmon monitors any URL. It works with Shopify, WooCommerce, Magento, BigCommerce, Squarespace, and fully custom stores. No plugin or integration required.',
                  },
                  {
                    q: 'How does competitor monitoring work?',
                    a: 'You add competitor URLs alongside your own store monitors. Beaconmon checks their pages on the same schedule and alerts you whenever the content changes — price updates, promotions, new copy. You see exactly what changed and when.',
                  },
                  {
                    q: 'How quickly will I know when my checkout is down?',
                    a: 'Within 60 seconds on paid plans (30-second checks plus alert delivery time). Free plan checks every 5 minutes. You can set up keyword monitoring to confirm that critical checkout elements are actually present on the page.',
                  },
                  {
                    q: 'What kinds of changes trigger an alert?',
                    a: 'Downtime (non-2xx responses), slow response times, SSL expiry warnings, domain expiry warnings, missing keywords on pages you specify, and any content changes on pages you\'re tracking. Each monitor type has its own alert logic.',
                  },
                  {
                    q: 'Is there a free plan?',
                    a: 'Yes — free forever for up to 10 monitors with 5-minute check intervals. No credit card required, no trial period, no expiry. Upgrade when you need faster checks or more monitors.',
                  },
                  {
                    q: 'Do you offer annual billing?',
                    a: 'Yes — annual billing saves 20% on all paid plans.',
                  },
                ].map(({ q, a }, i) => (
                  <AccordionItem key={i} value={`item-${i + 1}`} className="border-b border-brand-line-soft py-0">
                    <AccordionTrigger className="text-[16px] font-semibold tracking-[-0.01em] py-5 hover:no-underline text-brand-text">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="text-brand-dim text-[15px] leading-[1.6] pb-5">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
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
            Your store and your competitors,<br />fully monitored.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Set up in 5 minutes. Start free. No credit card required.</p>
          <CtaForm className="mx-auto mb-4" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import DashboardPreview from '@/components/marketing/DashboardPreview';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import PricingCard, { PRICING_TIERS } from '@/components/marketing/PricingCard';
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
  title: 'Uptime Monitoring for Freelancers & Agencies | Beaconmon',
  description:
    'Beaconmon is a website monitoring service that checks your sites every 30 seconds and alerts you the moment something breaks — downtime, SSL expiry, domain expiry, or content changes.',
  alternates: { canonical: 'https://beaconmon.com' },
};

const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Beaconmon',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com',
  description:
    'Website uptime and performance monitoring service. Checks URLs every 30 seconds, monitors SSL certificates, domain expiry, TCP ports, keywords, and content changes. Sends alerts via email, Slack, or webhook.',
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
      name: 'Pro',
      price: '19',
      priceCurrency: 'USD',
      description: '25 monitors, 1-minute check interval, 3 status pages',
    },
    {
      '@type': 'Offer',
      name: 'Business',
      price: '59',
      priceCurrency: 'USD',
      description: 'Unlimited monitors, 30-second check interval, unlimited status pages',
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={SOFTWARE_SCHEMA} />

      {/* ====== NAV ====== */}
      <NavBar />

      {/* ====== HERO ====== */}
      <section className="relative py-[100px] max-[1024px]:py-16 overflow-hidden">
        {/* green radial glow — no filter:blur to avoid GPU compositor layer */}
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
              <h1 className="text-[clamp(42px,5.6vw,72px)] leading-[1.02] tracking-[-0.035em] font-extrabold m-0 mb-[22px]">
                Know when your site goes down.<br />
                <span className="text-brand-green">Before your clients do.</span>
              </h1>
              <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[520px] mb-8">
                Beaconmon is a website monitoring service that checks your sites every 30 seconds and alerts you the moment something breaks — downtime, SSL expiry, domain expiry, or content changes.
              </p>

              <CtaForm />
              <p className="mt-[14px] text-[13px] text-brand-muted">
                Free forever for 10 monitors. No credit card required.
              </p>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-[10px] text-[13px] text-brand-dim">
                <span className="inline-flex items-center gap-2"><CheckIcon /> 30-second checks</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> 5-minute setup</span>
                <span className="inline-flex items-center gap-2"><CheckIcon /> SSL &amp; domain alerts included</span>
              </div>
            </div>

            {/* Right — dashboard preview */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ====== LOGO STRIP ====== */}
      <section className="border-t border-b border-brand-line-soft py-11">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <p className="text-center text-[12px] tracking-[0.08em] uppercase text-brand-muted mb-6">
            Built for developers working with
          </p>
          <div className="flex justify-between items-center gap-8 flex-wrap">
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">shopify</span>
            <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Webflow</span>
            <span className="text-[17px] font-medium italic text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">WordPress</span>
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Framer</span>
            <span className="text-[17px] font-bold tracking-[-0.01em] text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Squarespace</span>
            <span className="text-[13px] font-bold tracking-[0.08em] uppercase text-brand-muted opacity-70 hover:opacity-100 hover:text-brand-dim transition-all whitespace-nowrap">Wix</span>
          </div>
        </div>
      </section>

      {/* ====== PAIN ====== */}
      <section className="py-[120px] max-[640px]:py-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-[radial-gradient(ellipse_at_top,rgba(255,68,68,0.04),transparent_60%),#0E0E14] border border-brand-line rounded-[20px] px-[60px] py-20 max-[640px]:px-6 max-[640px]:py-12 text-center max-w-[920px] mx-auto relative overflow-hidden">
            {/* Big quote mark */}
            <span aria-hidden className="absolute top-[10px] left-10 font-serif text-[160px] text-brand-line leading-none select-none">&ldquo;</span>
            <blockquote className="relative m-0 text-[clamp(24px,3vw,36px)] leading-[1.25] font-semibold tracking-[-0.02em] max-w-[760px] mx-auto mb-6">
              I found out my client&apos;s store was down because they called me. Not my monitoring tool.
            </blockquote>
            <p className="text-brand-dim text-[15px] max-w-[560px] mx-auto mb-7 leading-[1.6]">
              It&apos;s happened to every freelancer and agency at least once. The site goes down at 2am on a Friday. By the time anyone notices, the damage is done: lost sales, lost trust, an uncomfortable conversation with the client.
            </p>
            <span className="text-brand-green text-[15px] font-semibold inline-flex items-center gap-[10px]">
              <span aria-hidden className="block w-6 h-px bg-brand-green" />
              Beaconmon makes sure you&apos;re always first to know.
            </span>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Three steps. Five minutes.</h2>
            <p className="text-brand-dim text-[17px] max-w-[520px] mx-auto">Paste a URL, get alerts, share a status page. That&apos;s it.</p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-2">
            {[
              {
                num: '01. Add your sites',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                ),
                heading: 'Paste your URL.',
                body: 'Beaconmon starts monitoring immediately. About 30 seconds per site — no agents, no DNS config, no code changes.',
              },
              {
                num: '02. Get alerted instantly',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                ),
                heading: 'The moment something breaks.',
                body: 'Down, slow, SSL expiring, domain renewing — Beaconmon fires an alert. Email, Slack, SMS, or webhook. Usually within 60 seconds.',
              },
              {
                num: '03. Share your status',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                  </svg>
                ),
                heading: 'Give clients a status page.',
                body: (
                  <>
                    Beautiful, fast, hosted at <span className="font-mono text-brand-dim">status.yoursite.com</span>. Shows uptime history and active incidents. No dashboard logins required.
                  </>
                ),
              },
            ].map(({ num, icon, heading, body }) => (
              <div key={num} className="reveal p-8 bg-brand-bg1 border border-brand-line-soft rounded-[14px]">
                <div className="font-mono text-[13px] text-brand-green mb-8 flex items-center justify-between">
                  <span>{num}</span>
                  <span className="w-9 h-9 bg-brand-bg3 border border-brand-line rounded-[9px] inline-flex items-center justify-center text-brand-green">
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
            <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Features</span>
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">
              Everything you need.<br />Nothing you don&apos;t.
            </h2>
            <p className="text-brand-dim text-[17px] max-w-[560px] mx-auto">Six monitor types, three alert channels, one clean dashboard. No enterprise bloat.</p>
          </div>

          <div className="grid grid-cols-6 max-[880px]:grid-cols-1 gap-4" style={{ gridAutoRows: 'minmax(240px,auto)' }}>
            {/* Large 1 — uptime */}
            <div className="reveal col-span-3 max-[880px]:col-span-1 row-span-2 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden flex flex-col">
              <div className="p-7 pb-6">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green mb-[10px]">Uptime monitoring</span>
                <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-[10px] leading-[1.2]">30-second checks from multiple locations.</h3>
                <p className="text-brand-dim text-[14px] leading-[1.55]">We check your site every 30 seconds from multiple regions. One blip doesn&apos;t trigger an alert — we confirm from two locations first to eliminate false alarms.</p>
              </div>
              <div className="mt-auto p-2 pt-0 flex items-end flex-1">
                <div className="bg-brand-bg2 border border-brand-line-soft rounded-[10px] p-[14px] mx-[10px] mb-[10px] w-full">
                  {[
                    { name: 'acme-storefront.com', pct: '99.98%', width: '99.98%', color: 'bg-brand-green', textColor: 'text-brand-green' },
                    { name: 'marquez.design', pct: '100.00%', width: '100%', color: 'bg-brand-green', textColor: 'text-brand-green' },
                    { name: 'api.loomwave.io', pct: '97.14%', width: '97%', color: 'bg-brand-red', textColor: 'text-brand-red' },
                    { name: 'greenhaus-coffee.com', pct: '99.90%', width: '99.9%', color: 'bg-brand-green', textColor: 'text-brand-green' },
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
            <div className="reveal col-span-3 max-[880px]:col-span-1 row-span-2 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden flex flex-col">
              <div className="p-7 pb-6">
                <span className="block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand-green mb-[10px]">Public status pages</span>
                <h3 className="text-[22px] font-bold tracking-[-0.02em] mb-[10px] leading-[1.2]">Status pages your clients will actually trust.</h3>
                <p className="text-brand-dim text-[14px] leading-[1.55]">Public status pages at your own domain. Show uptime history, active incidents, and scheduled maintenance. Looks professional. Takes 2 minutes to set up.</p>
              </div>
              <div className="mt-auto p-2 pt-0 flex items-end flex-1">
                <div className="bg-brand-bg2 border border-brand-line-soft rounded-[10px] mx-[10px] mb-[10px] w-full overflow-hidden">
                  <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-brand-line-soft text-[12px]">
                    <span className="font-semibold">status.marquez.design</span>
                    <span className="text-[10px] bg-[rgba(0,229,122,0.1)] text-brand-green px-2 py-[3px] rounded font-semibold border border-[rgba(0,229,122,0.2)]">All systems operational</span>
                  </div>
                  <div className="px-[14px] py-[10px] pb-3 space-y-2">
                    {[
                      { name: 'Marketing site', pct: '99.98%', dots: Array(15).fill(false) },
                      { name: 'API', pct: '99.72%', dots: Array(15).fill(false).map((_, i) => i === 12) },
                      { name: 'Checkout', pct: '100.00%', dots: Array(15).fill(false) },
                      { name: 'Admin dashboard', pct: '99.94%', dots: Array(15).fill(false) },
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
                body: 'Know 30 days before your SSL certificate expires. Never get caught off guard.',
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
                body: 'We watch your domain renewal dates too. The worst downtime is entirely preventable.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                ),
                heading: 'Heartbeat monitoring',
                body: 'Monitor your cron jobs and scheduled tasks. If a job stops running, you\'ll know.',
              },
              {
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
                heading: 'Instant Slack alerts',
                body: 'Alerts in your Slack channel the moment something changes. Your team sees it together.',
              },
            ].map(({ icon, heading, body }) => (
              <div key={heading} className="reveal col-span-3 max-[880px]:col-span-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden min-h-[180px]">
                <div className="p-7 pb-6">
                  <span className="w-11 h-11 rounded-[11px] bg-[rgba(0,229,122,0.1)] border border-[rgba(0,229,122,0.2)] inline-flex items-center justify-center text-brand-green mb-[18px]">
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
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Powerful uptime monitoring. Without the enterprise price tag.</h2>
            <p className="text-brand-dim text-[17px] max-w-[540px] mx-auto">A quick side-by-side with the incumbents.</p>
          </div>
          <div className="reveal max-w-[920px] mx-auto overflow-x-auto border border-brand-line rounded-[14px] bg-brand-bg1">
            <table className="w-full border-collapse min-w-[620px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft">Feature</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-green font-semibold border-b border-brand-line-soft bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)]">Beaconmon</th>
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
                    bm: <span className="text-brand-green font-semibold font-mono">30 seconds</span>,
                    ur: <span className="font-mono">5 minutes <span className="text-brand-muted">(free)</span></span>,
                    p: <span className="font-mono">1 minute</span>,
                  },
                  {
                    feat: 'Status pages',
                    bm: <span className="text-brand-green font-semibold">✓ Included</span>,
                    ur: 'Basic only',
                    p: '✓ Extra cost',
                  },
                  {
                    feat: 'SSL monitoring',
                    bm: <span className="text-brand-green font-semibold">✓ Included</span>,
                    ur: <span className="text-brand-green font-semibold">✓</span>,
                    p: <span className="text-brand-green font-semibold">✓</span>,
                  },
                  {
                    feat: 'Domain expiry',
                    bm: <span className="text-brand-green font-semibold">✓ Included</span>,
                    ur: <span className="text-brand-muted">—</span>,
                    p: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Heartbeat monitoring',
                    bm: <span className="text-brand-green font-semibold">✓ Included</span>,
                    ur: <span className="text-brand-muted">—</span>,
                    p: <span className="text-brand-muted">—</span>,
                  },
                  {
                    feat: 'Starting price',
                    bm: <span className="font-mono">$19/mo</span>,
                    ur: <span className="font-mono">$7/mo</span>,
                    p: <span className="font-mono">$15/mo</span>,
                  },
                ].map(({ feat, bm, ur, p }, i) => (
                  <tr key={feat}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < 5 ? 'border-b border-brand-line-soft' : ''}`}>{feat}</td>
                    <td className={`p-4 text-[14px] bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)] ${i < 5 ? 'border-b border-brand-line-soft' : ''}`}>{bm}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < 5 ? 'border-b border-brand-line-soft' : ''}`}>{ur}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < 5 ? 'border-b border-brand-line-soft' : ''}`}>{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ====== PRICING ====== */}
      <section className="py-[100px] border-t border-brand-line-soft" id="pricing">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(32px,3.8vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Simple pricing. No surprises.</h2>
            <p className="text-brand-dim text-[17px]">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-5 items-stretch">
            {PRICING_TIERS.map((t) => <PricingCard key={t.tier} {...t} />)}
          </div>
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
                <a href="mailto:hello@beaconmon.com" className="text-brand-green border-b border-[rgba(0,229,122,0.4)] hover:border-brand-green transition-colors">
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
                    q: 'Do I need a credit card to start?',
                    a: 'No. The free plan is genuinely free — no card, no trial period, no expiry. Upgrade only when you need more monitors or faster checks.',
                  },
                  {
                    q: 'How quickly will I be alerted when my site goes down?',
                    a: 'Within 60 seconds on paid plans (30-second checks + alert delivery time). Free plan checks every 5 minutes.',
                  },
                  {
                    q: 'What happens if Beaconmon itself goes down?',
                    a: 'We monitor ourselves using independent third-party services. Our architecture runs check workers independently from the web app — so even if the dashboard has a hiccup, monitoring continues uninterrupted.',
                  },
                  {
                    q: 'Can I monitor sites that require authentication?',
                    a: 'Yes — you can set custom request headers (including Authorization headers) on HTTP monitors. Full cookie-based auth simulation is on our roadmap.',
                  },
                  {
                    q: 'How are status pages hosted?',
                    a: (
                      <>
                        At a subdomain we provide (<span className="font-mono">yourname.beaconmon.com</span>) for free, or at your own custom domain (<span className="font-mono">status.yourcompany.com</span>) on paid plans.
                      </>
                    ),
                  },
                  {
                    q: 'Do you offer annual billing?',
                    a: 'Yes — annual billing saves 20% on Pro and Business plans.',
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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 text-center relative max-w-[720px]">
          <h2 className="text-[clamp(36px,4.6vw,60px)] tracking-[-0.035em] leading-[1.08] font-extrabold mb-[18px]">
            Your sites are either being monitored,<br />or they&apos;re not.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Set up in 5 minutes. Start free. No credit card.</p>
          <CtaForm className="mx-auto mb-4" />
          <p className="text-[13px] text-brand-muted">
            Be among the first developers and agencies monitoring their sites with Beaconmon.
          </p>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

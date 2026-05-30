import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Intelligence for Ecommerce | Beaconmon',
  description:
    'Track competitor prices, product changes, and page updates automatically. Get a daily or weekly digest of what changed, with AI-powered summaries. Built for Shopify and WooCommerce brands.',
  alternates: { canonical: 'https://beaconmon.com/features/intelligence' },
};

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Competitor Intelligence | Beaconmon',
  description:
    'Track competitor prices, product changes, and page updates automatically. Get a daily or weekly digest of what changed.',
  url: 'https://beaconmon.com/features/intelligence',
};

const CAPABILITIES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    name: 'Price change alerts',
    body: 'Point Beaconmon at a competitor pricing page or product listing. The moment the price, sale label, or "sold out" badge changes, you get an alert, not a digest days later.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    name: 'Content change detection',
    body: 'Target any CSS selector on a page and track exactly that element. Product titles, return policy text, shipping times, promotional banners. Beaconmon diffs the HTML and shows you exactly what changed.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    name: 'Competitor watchlist',
    body: 'Add a competitor domain and Beaconmon suggests the high-value pages to monitor: product pages, pricing, checkout, shipping policy. One click to add them all.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 2.68h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z" />
      </svg>
    ),
    name: 'Intelligence digest',
    body: 'Instead of one alert per change, get a single daily or weekly email (or Slack message) summarising everything that changed across your competitor watchlist. Toggle which sections to include per channel.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    name: 'AI-powered diff summaries',
    body: 'Raw HTML diffs are hard to read. Beaconmon uses AI to summarise what actually changed in plain English: "Price dropped from $89 to $74" or "Free shipping threshold raised to $75." Available on Growth and Scale plans.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    name: 'Noise filtering',
    body: 'Not every change matters. Beaconmon classifies trivial changes (ad rotation, timestamp updates, session tokens) and suppresses alerts for them, so your digest only surfaces changes that are actually significant.',
  },
];

export default function IntelligencePage() {
  return (
    <>
      <JsonLd data={SCHEMA} />
      <JsonLd data={breadcrumbSchema({ name: 'Features', path: '/features' }, { name: 'Competitor Intelligence', path: '/features/intelligence' })} />
      <NavBar />

      {/* Hero */}
      <section className="relative py-[100px] max-[640px]:py-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            left: '-10%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(0,229,122,0.12), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Intelligence</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px] mx-auto">
            Know what your competitors are doing
            <span className="text-brand-green-ink"> before your customers do.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-10">
            Beaconmon watches competitor pages, detects price changes, tracks content updates, and delivers a clean digest of everything that moved. No manual checking. No missed changes.
          </p>
          <CtaForm className="mx-auto" />
        </div>
      </section>

      {/* How it works */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How competitor intelligence works</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">Beaconmon takes an HTML snapshot on first run, then checks on your schedule and diffs the result each time.</p>
          </div>
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-6">
            {[
              { step: '01', title: 'Add a competitor', body: 'Enter a domain. Beaconmon suggests the pages most worth watching: pricing, product pages, shipping policy, checkout.' },
              { step: '02', title: 'Set your selectors', body: 'Target a specific CSS selector or watch the full page body. Narrow selectors filter out noise and focus on what matters.' },
              { step: '03', title: 'Get notified', body: 'Alerts fire immediately on change, or roll up into a daily or weekly digest email or Slack message with AI summaries.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <div className="text-[40px] font-extrabold tracking-[-0.04em] text-brand-green-ink opacity-30 mb-4">{step}</div>
                <h3 className="text-[18px] font-bold tracking-[-0.02em] mb-3">{title}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Everything in the Intelligence layer</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Six capabilities that work together to keep you informed without overwhelming you.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {CAPABILITIES.map(({ icon, name, body }) => (
              <div key={name} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7 flex gap-5">
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,229,122,0.1)] border border-[rgba(0,229,122,0.2)] inline-flex items-center justify-center text-brand-green-ink shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold tracking-[-0.02em] mb-2">{name}</h3>
                  <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Digest preview */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-center">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Intelligence Digest</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                One email. Everything that changed.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                Instead of a flood of individual alerts, get a structured digest delivered daily or weekly. Each section is toggleable: you pick what matters for your team. Growth plan gets daily delivery; all paid plans get weekly.
              </p>
              <ul className="space-y-3">
                {[
                  'Daily (Growth/Scale) or weekly (all paid plans)',
                  'Delivered to email and/or Slack',
                  'Five toggleable sections per channel',
                  'AI summaries explain changes in plain English',
                  'Noise-filtered: trivial changes are suppressed',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-brand-line-soft flex items-center justify-between">
                <span className="text-[13px] font-semibold">Intelligence Digest</span>
                <span className="text-[11px] text-brand-muted">Today, 7:00 AM</span>
              </div>
              <div className="px-5 py-4 space-y-4">
                {[
                  { competitor: 'rivalshop.com', page: '/pricing', summary: 'Starter plan dropped from $49 to $39/mo.', type: 'price' },
                  { competitor: 'acmegear.co', page: '/free-shipping', summary: 'Free shipping threshold raised from $50 to $75.', type: 'policy' },
                  { competitor: 'shopwave.io', page: '/products/pro-kit', summary: 'Product marked "Back in stock" (previously sold out).', type: 'stock' },
                ].map(({ competitor, page, summary, type }) => (
                  <div key={competitor} className="flex gap-3 text-[13px]">
                    <div className={`mt-[3px] w-2 h-2 rounded-full shrink-0 ${type === 'price' ? 'bg-brand-red' : type === 'policy' ? 'bg-yellow-400' : 'bg-brand-green'}`} />
                    <div>
                      <div className="text-brand-muted font-mono text-[11px] mb-[2px]">{competitor}{page}</div>
                      <div className="text-brand-dim leading-[1.5]">{summary}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans callout */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-3 max-[880px]:grid-cols-1 gap-5">
            {[
              { plan: 'Starter', monitors: '5 competitor monitors', digest: 'Weekly digest', ai: 'No AI summaries' },
              { plan: 'Growth', monitors: '25 competitor monitors', digest: 'Daily or weekly digest', ai: 'AI diff summaries included' },
              { plan: 'Scale', monitors: 'Unlimited competitors', digest: 'Daily or weekly digest', ai: 'AI diff summaries included' },
            ].map(({ plan, monitors, digest, ai }) => (
              <div key={plan} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3">{plan}</div>
                <ul className="space-y-2">
                  {[monitors, digest, ai].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-brand-dim">
                      <span className="mt-[5px] w-[4px] h-[4px] rounded-full bg-brand-green shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-[13px] text-brand-muted mt-6">
            Free plan includes uptime monitoring only.{' '}
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">See full pricing</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] border-t border-brand-line-soft relative overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            bottom: '-40%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 500,
            background: 'radial-gradient(ellipse, rgba(0,229,122,0.15), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center relative">
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">
            Start watching your competitors today.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">14-day Growth trial, no card required. Competitor monitors included from day one.</p>
          <CtaForm className="mx-auto mb-5" />
          <Link href="/pricing" className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
            See pricing
          </Link>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

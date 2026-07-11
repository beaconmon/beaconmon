import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon Features: Daily Brief and Smart Alerts',
  description:
    'Track competitor prices and page changes with daily AI digests. Plus HTTP uptime, SSL, domain expiry, and content monitoring for Shopify and WooCommerce.',
  alternates: { canonical: 'https://beaconmon.com/features' },
  openGraph: { url: 'https://beaconmon.com/features' },
};

const FEATURES_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
      { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://beaconmon.com/features' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Beaconmon Features',
    description:
      'Competitor monitoring and uptime monitoring for ecommerce: daily brief, AI diff summaries, smart alerts, HTTP, SSL, domain, and content monitoring.',
    url: 'https://beaconmon.com/features',
    numberOfItems: 10,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Daily Competitor Report', description: 'One email with everything that changed across your competitor watchlist.', url: 'https://beaconmon.com/features/intelligence#daily-brief' },
      { '@type': 'ListItem', position: 2, name: 'AI Diff Summaries', description: 'Plain-English summaries of what actually changed: "Price dropped from $89 to $74."', url: 'https://beaconmon.com/features/intelligence#ai-diffs' },
      { '@type': 'ListItem', position: 3, name: 'Competitor Watchlist', description: 'Add a domain, get suggested pages to monitor, add them all in one click.', url: 'https://beaconmon.com/features#competitor-intelligence' },
      { '@type': 'ListItem', position: 4, name: 'Smart Alerts', description: 'Statistical anomaly detection that fires only when something is genuinely wrong.', url: 'https://beaconmon.com/features#smart-alerts' },
      { '@type': 'ListItem', position: 5, name: 'HTTP Monitoring', description: 'Know the moment your site or API stops responding.', url: 'https://beaconmon.com/features#http-monitoring' },
      { '@type': 'ListItem', position: 6, name: 'SSL Certificate Monitoring', description: 'Never let an expired cert take you by surprise.', url: 'https://beaconmon.com/features#ssl-monitoring' },
      { '@type': 'ListItem', position: 7, name: 'Domain Expiry Tracking', description: 'The worst outage is one you could have prevented.', url: 'https://beaconmon.com/features#domain-monitoring' },
      { '@type': 'ListItem', position: 8, name: 'TCP Port Monitoring', description: 'Monitor any service that speaks TCP.', url: 'https://beaconmon.com/features#tcp-monitoring' },
      { '@type': 'ListItem', position: 9, name: 'Keyword Monitoring', description: 'Verify your pages say exactly what they should.', url: 'https://beaconmon.com/features#keyword-monitoring' },
      { '@type': 'ListItem', position: 10, name: 'Content Change Monitoring', description: 'Know the instant a page changes.', url: 'https://beaconmon.com/features#content-monitoring' },
    ],
  },
];

const MONITOR_TYPES = [
  {
    slug: 'http-monitoring',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    name: 'HTTP Monitoring',
    tagline: 'Know the moment your site or API stops responding.',
    body: 'Beaconmon checks your URLs every 30 seconds (Scale) or 1 minute (Growth and Starter). If the response is anything other than a 2xx, you\'re alerted within 60 seconds. Set custom request headers, follow redirects, and configure per-monitor response-time thresholds to catch slow sites and APIs before users notice.',
    highlights: ['Response code validation', 'Response time thresholds', 'Custom request headers', 'Third-party app health checks'],
  },
  {
    slug: 'ssl-monitoring',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    name: 'SSL Certificate Monitoring',
    tagline: 'Never let an expired cert take you by surprise.',
    body: 'SSL expiry is one of the most embarrassing and preventable causes of downtime. Beaconmon watches every certificate and fires tiered alerts at 30 days, 14 days, and 7 days before expiry, giving you plenty of time to renew without scrambling.',
    highlights: ['30-day early warning', '14-day and 7-day reminders', 'Certificate validity checks', 'No config needed'],
  },
  {
    slug: 'domain-monitoring',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    name: 'Domain Expiry Tracking',
    tagline: 'The worst outage is one you could have prevented.',
    body: 'Domain renewals slip through the cracks, especially when you\'re heads-down on a campaign. Beaconmon checks WHOIS records and alerts you at 30, 14, and 7 days before the domain expires. No more panicked domain rescues.',
    highlights: ['WHOIS-based expiry detection', '30/14/7-day alerts', 'Works on all TLDs', 'Per-domain alert channels'],
  },
  {
    slug: 'tcp-monitoring',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    name: 'TCP Port Monitoring',
    tagline: 'Monitor any service that speaks TCP.',
    body: 'Not everything is a webpage. Payment gateways, fulfillment APIs, and third-party services your store depends on all speak TCP. If a port goes unreachable, you hear about it before your checkout does.',
    highlights: ['Any TCP port', 'Works on private IPs via VPN probes', 'Sub-60 second alerts', 'Works alongside HTTP monitors'],
  },
  {
    slug: 'keyword-monitoring',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    name: 'Keyword Monitoring',
    tagline: 'Verify your pages say exactly what they should.',
    body: 'A 200 response doesn\'t always mean your store is right. A theme update could quietly remove your free shipping banner, or an app conflict could replace your checkout CTA with an error state. Keyword monitoring checks that the right text is present on the right page, so you catch silent breakages before they cost you conversions.',
    highlights: ['Keyword present or absent', 'Case-sensitive matching', 'Works on any HTTP response', 'Combine with HTTP threshold checks'],
  },
  {
    slug: 'content-monitoring',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    name: 'Content Change Monitoring',
    tagline: 'Know the instant a page changes.',
    body: 'Track competitors\' pricing pages, product listings, legal terms, or any public web page. Beaconmon takes an HTML snapshot on first run and alerts you the moment the content at a CSS selector (or the full page body) changes. Perfect for competitor monitoring and change detection.',
    highlights: ['CSS selector targeting', 'Full-page or partial diff', 'HTML-only (no JS rendering needed)', 'Snapshot history with diff view'],
  },
];

const INTEL_CARDS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    name: 'Daily Competitor Report',
    body: 'Instead of a flood of individual alerts, get a single digest delivered every morning. Price changes, content updates, and stock status all in one place, with AI summaries explaining what each change means.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    name: 'AI Diff Summaries',
    body: 'Raw HTML diffs are hard to read. Beaconmon translates them into plain English: "Price dropped from $89 to $74" or "Free shipping threshold raised to $75." Available on Growth and Scale plans.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    name: 'Competitor Watchlist',
    body: 'Add a competitor domain and Beaconmon suggests the high-value pages to watch: pricing, product pages, checkout, shipping policy. One click to add them all and start monitoring immediately.',
  },
];

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={FEATURES_SCHEMA} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Features</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px] mx-auto">
            Competitor monitoring and uptime monitoring,
            <span className="text-brand-green-ink"> built for Shopify stores.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mx-auto">
            Track what rivals change overnight. Know when your own store breaks. Get a daily brief on both.
          </p>
        </div>
      </section>

      {/* Competitor Monitoring */}
      <section id="competitor-intelligence" className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Competitor Monitoring</span>
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How competitor price and content tracking works in Beaconmon</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">Track competitor prices, promotions, and page content. Get a daily brief with AI summaries of everything that moved.</p>
          </div>

          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-5 mb-10">
            {INTEL_CARDS.map(({ icon, name, body }) => (
              <div key={name} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(0,229,122,0.1)] border border-[rgba(0,229,122,0.2)] inline-flex items-center justify-center text-brand-green-ink mb-5">
                  {icon}
                </div>
                <h3 className="text-[17px] font-bold tracking-[-0.02em] mb-2">{name}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>

          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden max-w-[760px] mx-auto mb-8">
            <div className="px-5 py-4 border-b border-brand-line-soft flex items-center justify-between">
              <span className="text-[13px] font-semibold">Weekly Competitor Report</span>
              <span className="text-[11px] text-brand-muted">Today, 7:00 AM</span>
            </div>
            <div className="px-5 py-4 space-y-4">
              {[
                { competitor: 'rivalshop.com', page: '/pricing', summary: 'Pro plan dropped from $89/mo to $69/mo. A 22% reduction.', type: 'price' },
                { competitor: 'acmegear.co', page: '/shipping', summary: 'Free shipping threshold raised from $50 to $75.', type: 'policy' },
                { competitor: 'shopwave.io', page: '/products/pro-kit', summary: 'Pro Kit back in stock. Was marked sold out for 12 days.', type: 'stock' },
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

          <p className="text-center">
            <Link href="/features/intelligence" className="text-brand-green-ink hover:underline text-[15px] font-semibold">
              Full breakdown: how competitor monitoring works →
            </Link>
          </p>
        </div>
      </section>

      {/* Smart Alerts */}
      <section id="smart-alerts" className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-center">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Smart Alerts</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Alerts that know when something is actually wrong.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                Not every spike is an outage. Beaconmon uses statistical anomaly detection to separate genuine slowdowns from background noise. You get alerted when response times deviate meaningfully from the historical baseline, not when a single check runs slow.
              </p>
              <ul className="space-y-3">
                {[
                  'Z-score anomaly detection on HTTP and keyword monitors',
                  'Fires through existing alert channels (email, Slack, webhook)',
                  'Tunable sensitivity per monitor',
                  'Available on Growth and Scale plans',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6 space-y-4">
              <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-brand-muted mb-1">Anomaly detected</div>
              {[
                { label: 'Checkout API', baseline: '210ms', current: '1,420ms', severity: 'high' },
                { label: 'Product page', baseline: '340ms', current: '480ms', severity: 'low' },
                { label: 'Marketing site', baseline: '180ms', current: '195ms', severity: 'none' },
              ].map(({ label, baseline, current, severity }) => (
                <div key={label} className="flex items-center gap-4 py-3 border-b border-brand-line-soft last:border-b-0 text-[13px]">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${severity === 'high' ? 'bg-brand-red' : severity === 'low' ? 'bg-yellow-400' : 'bg-brand-green'}`} />
                  <span className="flex-1 text-brand-dim">{label}</span>
                  <span className="font-mono text-brand-muted">avg {baseline}</span>
                  <span className={`font-mono font-semibold ${severity === 'high' ? 'text-brand-red' : severity === 'low' ? 'text-yellow-400' : 'text-brand-green'}`}>{current}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Also included divider */}
      <div className="border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 py-12 text-center">
          <span className="inline-block text-[11px] font-semibold tracking-[0.14em] uppercase text-brand-muted mb-3">Also included on every paid plan</span>
          <h2 className="text-[clamp(24px,3vw,38px)] font-extrabold tracking-[-0.03em] leading-[1.1] mb-4">Your store, always on</h2>
          <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Know the moment your checkout page, product pages, or homepage go down, before a customer does.</p>
        </div>
      </div>

      {/* Monitor types grid */}
      <section id="monitors" className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Six ways to monitor your store</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">Each type covers a different way your store can go wrong, so the right problem gets caught every time.</p>
          </div>
          <div className="grid grid-cols-2 max-[880px]:grid-cols-1 gap-5">
            {MONITOR_TYPES.map(({ slug, icon, name, tagline, body, highlights }) => (
              <div key={name} id={slug} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <div className="w-12 h-12 rounded-[12px] bg-[rgba(0,229,122,0.1)] border border-[rgba(0,229,122,0.2)] inline-flex items-center justify-center text-brand-green-ink mb-5">
                  {icon}
                </div>
                <h3 className="text-[20px] font-bold tracking-[-0.02em] mb-2">{name}</h3>
                <p className="text-brand-green-ink text-[13px] font-semibold mb-4">{tagline}</p>
                <p className="text-brand-dim text-[14px] leading-[1.65] mb-6">{body}</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-[13px] text-brand-dim">
                      <span className="w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-location */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-center">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Multi-location</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                One blip won&apos;t wake you at 3am.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                False alarms erode trust in your alerting system. Beaconmon confirms failures from multiple geographic regions before firing an alert. When you get a notification, it&apos;s real.
              </p>
              <ul className="space-y-3">
                {[
                  'Checks from US East, US West, EU West, AP Southeast, SA East',
                  'Alert only fires when 2+ locations confirm failure',
                  'Per-region response times visible in the dashboard',
                  'Available on Growth and Scale plans',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
              <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-brand-muted mb-5">Check locations</div>
              <div className="space-y-3">
                {[
                  { region: 'US East', latency: '12ms', status: 'up' },
                  { region: 'US West', latency: '34ms', status: 'up' },
                  { region: 'EU West', latency: '28ms', status: 'up' },
                  { region: 'AP Southeast', latency: '91ms', status: 'up' },
                  { region: 'SA East', latency: '67ms', status: 'up' },
                ].map(({ region, latency, status }) => (
                  <div key={region} className="flex items-center justify-between py-2 border-b border-brand-line-soft last:border-b-0 text-[13px]">
                    <span className="text-brand-dim">{region}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-brand-muted">{latency}</span>
                      <span className={`w-2 h-2 rounded-full ${status === 'up' ? 'bg-brand-green' : 'bg-brand-red'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status pages */}
      <section id="status-pages" className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1.1fr_1fr] max-[880px]:grid-cols-1 gap-16 items-center">
            <div className="order-2 max-[880px]:order-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-line-soft text-[13px]">
                <span className="font-semibold">status.yourcompany.com</span>
                <span className="text-[11px] bg-[rgba(0,229,122,0.1)] text-brand-green-ink px-2 py-[3px] rounded font-semibold border border-[rgba(0,229,122,0.2)]">All systems operational</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                {['Marketing site', 'API', 'Checkout', 'Admin'].map((name, i) => (
                  <div key={name} className="flex items-center gap-3 text-[12px]">
                    <span className="flex-1 text-brand-dim">{name}</span>
                    <div className="flex gap-[2px]">
                      {Array(15).fill(false).map((_, j) => (
                        <span key={j} className={`inline-block w-[6px] h-[10px] rounded-[2px] ${i === 1 && j === 12 ? 'bg-brand-red' : 'bg-brand-green'} opacity-90`} />
                      ))}
                    </div>
                    <span className="font-mono text-[10px] text-brand-text font-medium">
                      {i === 1 ? '99.72%' : '100.00%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 max-[880px]:order-2">
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Public Status Pages</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                A status page your clients will actually trust.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                Customers shouldn&apos;t have to guess whether your store is down. Give them a public status page at your own domain that shows real-time uptime and incident history. It builds trust during outages, cuts support tickets, and takes two minutes to set up.
              </p>
              <ul className="space-y-3">
                {[
                  'Custom domain (status.yoursite.com)',
                  '90-day uptime history bars',
                  'Active incident banners',
                  'Scheduled maintenance windows',
                  'Embeddable status badge (Markdown + HTML)',
                  'No Beaconmon branding on paid plans',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Uptime goals */}
      <section id="reliability-targets" className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-center">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Uptime goals</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Know if your store is meeting its uptime promise.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                Set an uptime target for your store, say 99.9%, and Beaconmon tracks how much downtime you have left in the window. If you&apos;re burning through it too fast, you get an alert before the window closes and before it hits your revenue.
              </p>
              <ul className="space-y-3">
                {[
                  'Per-monitor uptime goals (e.g. 99.9%)',
                  'Error budget tracking in real time',
                  'Immediate and sustained burn alerts',
                  'Available on all paid plans (unlimited on Growth and Scale)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
              <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-brand-muted mb-5">Uptime goals: this period</div>
              <div className="space-y-5">
                {[
                  { name: 'acme-storefront.com', target: '99.9%', remaining: 82 },
                  { name: 'api.loomwave.io', target: '99.5%', remaining: 34 },
                  { name: 'marquez.design', target: '99.0%', remaining: 97 },
                ].map(({ name, target, remaining }) => (
                  <div key={name}>
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="text-brand-dim">{name}</span>
                      <span className="text-brand-muted font-mono">Target {target} · {remaining}% budget left</span>
                    </div>
                    <div className="h-2 bg-brand-bg3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${remaining > 50 ? 'bg-brand-green' : remaining > 20 ? 'bg-yellow-400' : 'bg-brand-red'}`}
                        style={{ width: `${remaining}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            Ready to see what your competitors changed overnight?
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Start free. Add 1 competitor. Your first digest arrives tomorrow morning.</p>
          <CtaForm className="mx-auto mb-5" />
          <Link href="/pricing" className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
            See pricing →
          </Link>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

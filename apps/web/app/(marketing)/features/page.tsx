import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uptime Monitoring Features: HTTP, SSL, Domain, Content | Beaconmon',
  description:
    'Six website monitoring types: HTTP uptime, SSL certificate expiry, domain expiry, TCP port, keyword, and content change detection. Multi-location checks and SLO tracking — free for 10 monitors.',
  alternates: { canonical: 'https://beaconmon.com/features' },
};

const FEATURES_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Beaconmon Monitor Types',
  description:
    'Six website monitoring types: HTTP uptime, SSL certificate expiry, domain expiry, TCP port, keyword, and content change detection.',
  url: 'https://beaconmon.com/features',
  numberOfItems: 6,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'HTTP Monitoring', description: 'Know the moment your site or API stops responding.' },
    { '@type': 'ListItem', position: 2, name: 'SSL Certificate Monitoring', description: 'Never let an expired cert take you by surprise.' },
    { '@type': 'ListItem', position: 3, name: 'Domain Expiry Tracking', description: 'The worst outage is one you could have prevented.' },
    { '@type': 'ListItem', position: 4, name: 'TCP Port Monitoring', description: 'Monitor any service that speaks TCP.' },
    { '@type': 'ListItem', position: 5, name: 'Keyword Monitoring', description: 'Verify your pages say exactly what they should.' },
    { '@type': 'ListItem', position: 6, name: 'Content Change Monitoring', description: 'Know the instant a page changes.' },
  ],
};

const MONITOR_TYPES = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    name: 'HTTP Monitoring',
    tagline: 'Know the moment your site or API stops responding.',
    body: 'Beaconmon checks your URLs every 30 seconds (Business) or 1 minute (Pro). If the response is anything other than a 2xx, you\'re alerted within 60 seconds. Set custom request headers, follow redirects, and configure per-monitor response-time thresholds to catch slow sites and APIs before users notice.',
    highlights: ['Response code validation', 'Response time thresholds', 'Custom request headers', 'API endpoint monitoring'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    name: 'SSL Certificate Monitoring',
    tagline: 'Never let an expired cert take you by surprise.',
    body: 'SSL expiry is one of the most embarrassing and preventable causes of downtime. Beaconmon watches every certificate and fires tiered alerts at 30 days, 14 days, and 7 days before expiry — giving you plenty of time to renew without scrambling.',
    highlights: ['30-day early warning', '14-day and 7-day reminders', 'Certificate validity checks', 'No config needed'],
  },
  {
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
    body: 'Domain renewals slip through the cracks — especially for client sites you manage. Beaconmon checks WHOIS records and alerts you at 30, 14, and 7 days before the domain expires. No more panicked domain rescues.',
    highlights: ['WHOIS-based expiry detection', '30/14/7-day alerts', 'Works on all TLDs', 'Per-domain alert channels'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    name: 'TCP Port Monitoring',
    tagline: 'Monitor any service that speaks TCP.',
    body: 'Not everything is a website. Database servers, mail servers, game servers, custom APIs — if it listens on a TCP port, Beaconmon can watch it. You\'ll be alerted the moment a port becomes unreachable, before your users hit a connection error.',
    highlights: ['Any TCP port', 'Works on private IPs via VPN probes', 'Sub-60 second alerts', 'Works alongside HTTP monitors'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    name: 'Keyword Monitoring',
    tagline: 'Verify your pages say exactly what they should.',
    body: 'A 200 response doesn\'t always mean everything is fine. A broken deploy could serve an empty page, a database error, or a maintenance placeholder. Keyword monitoring checks that a specific string is present (or absent) in the response body — so you know the page actually loaded correctly.',
    highlights: ['Keyword present or absent', 'Case-sensitive matching', 'Works on any HTTP response', 'Combine with HTTP threshold checks'],
  },
  {
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
    body: 'Track competitors\' pricing pages, product listings, legal terms, or any public web page. Beaconmon takes an HTML snapshot on first run and alerts you the moment the content at a CSS selector (or the full page body) changes. Perfect for competitive intelligence and change detection.',
    highlights: ['CSS selector targeting', 'Full-page or partial diff', 'HTML-only (no JS rendering needed)', 'Snapshot history with diff view'],
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Features</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px] mx-auto">
            All the website monitoring tools you need —
            <span className="text-brand-green"> know what&apos;s broken before anyone else does.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto">
            Six monitor types. Multi-location checks. Incident management. Public status pages. SLO tracking. All in one tool, built for freelancers and agencies.
          </p>
        </div>
      </section>

      {/* Monitor types grid */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Six ways to watch your stack</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">Each monitor type is purpose-built for a different failure mode — so you catch the right problems, every time.</p>
          </div>
          <div className="grid grid-cols-2 max-[880px]:grid-cols-1 gap-5">
            {MONITOR_TYPES.map(({ icon, name, tagline, body, highlights }) => (
              <div key={name} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <div className="w-12 h-12 rounded-[12px] bg-[rgba(0,229,122,0.1)] border border-[rgba(0,229,122,0.2)] inline-flex items-center justify-center text-brand-green mb-5">
                  {icon}
                </div>
                <h3 className="text-[20px] font-bold tracking-[-0.02em] mb-2">{name}</h3>
                <p className="text-brand-green text-[13px] font-semibold mb-4">{tagline}</p>
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
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Multi-location</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                One blip won&apos;t wake you at 3am.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                False alarms erode trust in your alerting system. Beaconmon confirms failures from multiple geographic regions before firing an alert — so when you get a notification, it&apos;s real.
              </p>
              <ul className="space-y-3">
                {[
                  'Checks from US East, US West, EU West, AP Southeast, SA East',
                  'Alert only fires when 2+ locations confirm failure',
                  'Per-region response times visible in the dashboard',
                  'Available on Pro and Business plans',
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
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1.1fr_1fr] max-[880px]:grid-cols-1 gap-16 items-center">
            <div className="order-2 max-[880px]:order-1 bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-line-soft text-[13px]">
                <span className="font-semibold">status.yourcompany.com</span>
                <span className="text-[11px] bg-[rgba(0,229,122,0.1)] text-brand-green px-2 py-[3px] rounded font-semibold border border-[rgba(0,229,122,0.2)]">All systems operational</span>
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
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Public Status Pages</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                A status page your clients will actually trust.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                Clients shouldn&apos;t have to email you to find out if their site is down. Give them a public status page — at your own domain — that shows real-time uptime, incident history, and scheduled maintenance. It looks professional, and it takes two minutes to set up.
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

      {/* SLO */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-center">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">SLO Tracking</span>
              <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Know your error budget before it runs out.
              </h2>
              <p className="text-brand-dim text-[16px] leading-[1.65] mb-6">
                Set a per-monitor uptime target (e.g. 99.9%). Beaconmon tracks your error budget in real time and fires fast/slow burn-rate alerts when you&apos;re consuming it too quickly — so you can act before the SLO period is blown.
              </p>
              <ul className="space-y-3">
                {[
                  'Per-monitor SLO targets (e.g. 99.9%)',
                  'Error budget tracking in real time',
                  'Fast and slow burn-rate alerts',
                  'Available on Pro and Business plans',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
              <div className="text-[12px] font-semibold tracking-[0.08em] uppercase text-brand-muted mb-5">Error budget — this period</div>
              <div className="space-y-5">
                {[
                  { name: 'acme-storefront.com', target: '99.9%', remaining: 82 },
                  { name: 'api.loomwave.io', target: '99.5%', remaining: 34 },
                  { name: 'marquez.design', target: '99.0%', remaining: 97 },
                ].map(({ name, target, remaining }) => (
                  <div key={name}>
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="text-brand-dim">{name}</span>
                      <span className="text-brand-muted font-mono">SLO {target} · {remaining}% budget left</span>
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
            Ready to set up your first monitor?
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. Pro and Business trials start the moment you sign up — no card required.</p>
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

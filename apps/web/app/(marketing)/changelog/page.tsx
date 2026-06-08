import NavBar from '@/components/marketing/NavBar';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog | Beaconmon',
  description: 'What\'s new in Beaconmon. New features, improvements, and fixes, in reverse chronological order.',
  alternates: { canonical: 'https://beaconmon.com/changelog' },
};

type Tag = 'Feature' | 'Improvement' | 'Fix';

type Entry = {
  date: string;
  tag: Tag;
  title: string;
  body: string;
};

const TAG_STYLES: Record<Tag, string> = {
  Feature: 'bg-[rgba(0,229,122,0.1)] text-brand-green-ink border border-[rgba(0,229,122,0.2)]',
  Improvement: 'bg-[rgba(96,165,250,0.1)] text-blue-400 border border-[rgba(96,165,250,0.2)]',
  Fix: 'bg-[rgba(248,113,113,0.1)] text-red-400 border border-[rgba(248,113,113,0.2)]',
};

const ENTRIES: Entry[] = [
  {
    date: 'May 2026',
    tag: 'Feature',
    title: 'Multi-location checks from 5 regions',
    body: 'Pro and Business plans now run checks from US East, US West, EU West, AP Southeast, and SA East. An alert only fires when two or more locations confirm the failure, dramatically reducing false alarms. Per-region response times are visible in the dashboard.',
  },
  {
    date: 'April 2026',
    tag: 'Feature',
    title: 'Heartbeat monitoring',
    body: 'Monitor your cron jobs and scheduled tasks by having them ping a Beaconmon heartbeat URL. If a ping is missed, you\'re alerted. Supports configurable grace periods so one late task doesn\'t page you at 3am.',
  },
  {
    date: 'April 2026',
    tag: 'Feature',
    title: 'Scheduled maintenance windows',
    body: 'Create one-time or recurring maintenance windows for any monitor. Alerts are suppressed during the window, and your status page shows a "Scheduled maintenance" banner automatically. No more alerting during planned deployments.',
  },
  {
    date: 'March 2026',
    tag: 'Feature',
    title: 'Reliability Targets',
    body: 'Set a per-monitor uptime target (e.g. 99.9%). Beaconmon tracks your error budget in real time and fires immediate or sustained burn alerts when you\'re consuming it too quickly. Alert thresholds are configurable. Available on Growth and Scale plans.',
  },
  {
    date: 'February 2026',
    tag: 'Feature',
    title: 'Content snapshot history and diff view',
    body: 'Content monitoring now stores a full history of snapshots. View a side-by-side diff of any two snapshots directly in the dashboard, so you can see exactly what changed, not just that something did. Snapshot retention: 3 snapshots (Free), 30 (Pro), 90 (Business).',
  },
  {
    date: 'February 2026',
    tag: 'Improvement',
    title: 'Faster alert delivery',
    body: 'Reworked the alert worker to use exponential backoff with jitter. In practice, most alerts now land within 45 seconds of a confirmed failure on paid plans, down from ~90 seconds previously.',
  },
  {
    date: 'January 2026',
    tag: 'Feature',
    title: 'Deploy-aware monitoring',
    body: 'Suppress false-positive alerts during your own deployments. Trigger a deployment event via webhook or from the dashboard. Beaconmon holds alerts for up to 30 minutes while your services restart. Auto-expires so you can\'t accidentally leave it on.',
  },
  {
    date: 'January 2026',
    tag: 'Feature',
    title: 'Competitor tracking presets',
    body: 'Added a library of suggested CSS selectors for popular e-commerce and SaaS platforms, so you can set up a content monitor on a competitor\'s pricing page in seconds. Presets for Shopify, WooCommerce, Webflow, and more.',
  },
  {
    date: 'December 2025',
    tag: 'Improvement',
    title: 'Per-plan data retention enforcement',
    body: 'Check result history is now properly clamped to plan limits in the dashboard: 7 days (Free), 90 days (Pro), 365 days (Business). Underlying data is retained for 365 days for all plans. Upgrading reveals your full history.',
  },
  {
    date: 'December 2025',
    tag: 'Feature',
    title: 'Public status pages: general availability',
    body: 'Status pages are now available on all plans. Free plan: one status page at a beaconmon.com subdomain. Pro: three status pages with custom domain support. Business: unlimited. 90-day uptime history, active incident banners, and scheduled maintenance support included.',
  },
  {
    date: 'December 2025',
    tag: 'Feature',
    title: 'Beaconmon launches',
    body: 'Six monitor types (HTTP, SSL, domain, TCP, keyword, content), three alert channels (email, Slack, webhook), public status pages, and a clean dashboard. Free plan with 10 monitors. Pro at $19/mo, Business at $59/mo. 14-day trial on all paid plans, no card required.',
  },
];

const CHANGELOG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Beaconmon Changelog',
  url: 'https://beaconmon.com/changelog',
  itemListElement: ENTRIES.map(({ date, title, body }, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Article',
      headline: title,
      datePublished: (() => {
        const parts = date.split(' ');
        const month = parts[0] ?? '';
        const year = parts[1] ?? '';
        const months: Record<string, string> = {
          January: '01', February: '02', March: '03', April: '04',
          May: '05', June: '06', July: '07', August: '08',
          September: '09', October: '10', November: '11', December: '12',
        };
        return `${year}-${months[month] ?? '01'}-01`;
      })(),
      description: body,
      author: { '@type': 'Organization', name: 'Beaconmon' },
      publisher: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
      url: `https://beaconmon.com/changelog`,
    },
  })),
};

export default function ChangelogPage() {
  return (
    <>
      <JsonLd data={CHANGELOG_SCHEMA} />
      <NavBar />

      <main>

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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Changelog</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[760px] mx-auto">
            What&apos;s new in Beaconmon.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[520px] mx-auto">
            Every feature, improvement, and fix, in the order it shipped.
          </p>
        </div>
      </section>

      {/* Entries */}
      <section className="pb-[120px] border-t border-brand-line-soft">
        <div className="max-w-[780px] mx-auto px-8 max-[640px]:px-5 pt-16">
          <div className="space-y-0">
            {ENTRIES.map(({ date, tag, title, body }) => (
              <div
                key={`${date}-${tag}-${title}`}
                className="reveal grid grid-cols-[160px_1fr] max-[640px]:grid-cols-1 gap-8 max-[640px]:gap-3 py-10 border-b border-brand-line-soft last:border-b-0"
              >
                <div className="pt-[3px]">
                  <span className="text-[13px] text-brand-muted font-mono">{date}</span>
                </div>
                <div>
                  <span className={`inline-block text-[11px] font-semibold px-2 py-[3px] rounded mb-3 ${TAG_STYLES[tag]}`}>
                    {tag}
                  </span>
                  <h2 className="text-[18px] font-bold tracking-[-0.015em] mb-3 leading-[1.3]">{title}</h2>
                  <p className="text-brand-dim text-[15px] leading-[1.65]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>

      <RevealObserver />
    </>
  );
}

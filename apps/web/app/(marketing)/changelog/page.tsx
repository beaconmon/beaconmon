import NavBar from '@/components/marketing/NavBar';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog | Beaconmon',
  description: "What's new in Beaconmon: new features, monitor improvements, and bug fixes, listed newest first so you can track exactly what shipped and when.",
  alternates: { canonical: 'https://beaconmon.com/changelog' },
  openGraph: { url: 'https://beaconmon.com/changelog' },
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
    date: 'June 2026',
    tag: 'Feature',
    title: 'Full competitor catalog tracking for Shopify',
    body: 'Add a competitor\'s Shopify store and Beaconmon now watches their entire product catalog, not just a single page. We pull the full product feed and track every product for price changes and stock changes, each labeled with the store\'s own currency. You see when a rival cuts a price, runs a promo, or sells out, across their whole catalog.',
  },
  {
    date: 'June 2026',
    tag: 'Feature',
    title: 'AI change summaries and significance scoring',
    body: 'Every detected competitor change now comes with a plain-English summary of what actually changed, plus a significance score so the moves that matter rise to the top. A 20% price drop across a collection reads very differently from a one-word edit, and your digest now knows the difference. Growth and Scale plans.',
  },
  {
    date: 'June 2026',
    tag: 'Feature',
    title: 'Smart Alerts',
    body: 'Smart Alerts notify you only when a competitor change is genuinely significant, filtering out the noise of trivial edits. No more getting pinged for a whitespace tweak on a page you are tracking. You stay focused on the moves worth reacting to. Growth and Scale plans.',
  },
  {
    date: 'June 2026',
    tag: 'Improvement',
    title: 'Daily Intelligence Digest, timezone-aware',
    body: 'The Intelligence Digest now lands daily on Growth and Scale, summarizing every meaningful competitor move since the last one. Scheduling is timezone-aware, so the digest arrives at the start of your morning instead of the middle of your night. Free and Starter plans continue to get the weekly digest.',
  },
  {
    date: 'May 2026',
    tag: 'Feature',
    title: 'Smart Setup for stores',
    body: 'Paste your store URL and Beaconmon detects your platform (Shopify, WooCommerce, and more), then proposes a full bundle of monitors covering your storefront and key pages. On Growth and Scale, an AI layer suggests the exact selectors for price and content tracking. Confirm the bundle and every monitor is created in one click.',
  },
  {
    date: 'May 2026',
    tag: 'Feature',
    title: 'Competitor tracking becomes first-class',
    body: 'Track a competitor by domain and watch their pricing pages, promos, and content for changes. Competitor monitors are now a dedicated quota, separate from your uptime monitors: 1 on Free, 5 on Starter, 25 on Growth, unlimited on Scale. Even the Free plan includes a competitor monitor so you can see it work before you pay.',
  },
  {
    date: 'April 2026',
    tag: 'Feature',
    title: 'E-commerce onboarding with catalog preview',
    body: 'The onboarding wizard is built for stores from step one. It detects your platform, previews what we can track across your catalog, and shows the potential ROI before you commit. Granular stock events (in stock, low stock, out of stock) are tracked from day one.',
  },
  {
    date: 'March 2026',
    tag: 'Feature',
    title: 'Multi-location checks from 5 regions',
    body: 'Growth and Scale plans now run checks from US East, US West, EU West, AP Southeast, and SA East. An alert only fires when two or more locations confirm the failure, which dramatically reduces false alarms. Per-region response times are visible in the dashboard.',
  },
  {
    date: 'February 2026',
    tag: 'Feature',
    title: 'Content snapshot history and diff view',
    body: 'Content monitoring stores a full history of snapshots. View a side-by-side diff of any two snapshots directly in the dashboard, so you can see exactly what changed on a competitor page, not just that something did.',
  },
  {
    date: 'February 2026',
    tag: 'Improvement',
    title: 'Faster alert delivery',
    body: 'Reworked the alert worker to use exponential backoff with jitter. In practice, most alerts now land within 45 seconds of a confirmed failure on paid plans, down from roughly 90 seconds previously.',
  },
  {
    date: 'January 2026',
    tag: 'Feature',
    title: 'Update-aware alerts',
    body: 'Suppress false-positive alerts while you are pushing your own changes. Trigger an update event via webhook or from the dashboard, and Beaconmon holds alerts for up to 30 minutes while things settle. It auto-expires, so you cannot accidentally leave it on.',
  },
  {
    date: 'December 2025',
    tag: 'Feature',
    title: 'Public status pages: general availability',
    body: 'Status pages are available on all plans. Free includes one status page at a beaconmon.com subdomain, with more status pages and custom domain support on paid tiers. Uptime history, active incident banners, and scheduled maintenance support are included.',
  },
  {
    date: 'December 2025',
    tag: 'Feature',
    title: 'Beaconmon launches',
    body: 'Uptime, SSL, domain, keyword, and content monitoring, with email, Slack, and webhook alerts, public status pages, and a clean dashboard. Free plan with 10 monitors and no card required, plus a 14-day trial on every paid plan.',
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
            Competitor intelligence, store monitoring, and everything new in Beaconmon, in the order it shipped.
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

        {/* Feature request CTA */}
        <div className="max-w-[780px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal rounded-2xl border border-brand-line-soft bg-[rgba(0,229,122,0.03)] p-8 max-[640px]:p-6 text-center">
            <h2 className="text-[20px] font-bold tracking-[-0.015em] mb-2">Want to see something tracked?</h2>
            <p className="text-brand-dim text-[15px] leading-[1.65] max-w-[480px] mx-auto mb-5">
              We ship fast and we build what store owners ask for. If there is a competitor signal, a platform, or a report you want, tell us and it goes straight on the list.
            </p>
            <a
              href="mailto:hello@beaconmon.com?subject=Feature%20request"
              className="inline-flex items-center justify-center h-12 px-[22px] text-[15px] font-semibold rounded-[10px] bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] hover:scale-[1.02] hover:bg-[#00ff8a] transition-all duration-[120ms]"
            >
              Email us a request
            </a>
          </div>
        </div>
      </section>

      </main>

      <RevealObserver />
    </>
  );
}

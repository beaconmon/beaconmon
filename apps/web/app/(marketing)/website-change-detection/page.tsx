import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Change Detection for Ecommerce Teams | Beaconmon',
  description:
    'Track competitor prices, promotions, and page changes across any ecommerce site. Built for teams, not personal use. AI summaries, CSS selectors, and daily digests. A focused alternative to Visualping and Distill.',
  alternates: { canonical: 'https://beaconmon.com/website-change-detection' },
  openGraph: { url: 'https://beaconmon.com/website-change-detection' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How is Beaconmon different from Visualping?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Visualping is built for personal use: individual users watching a single page for a specific change. Beaconmon is built for ecommerce teams: multiple users, multiple competitors, Slack integration, AI summaries of what changed, and a weekly digest your whole team can read. Visualping sends you an email with a screenshot diff. Beaconmon tells your team what the competitor actually changed, in plain English.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Beaconmon different from Distill?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Distill is a browser extension focused on technical power users who want XPath selectors and JavaScript execution. Beaconmon is a web-based tool for ecommerce teams that need to share monitoring across a team, receive alerts in Slack, and understand competitor changes without reading HTML diffs. No extension required.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is HTML-based change detection?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Beaconmon fetches a page's HTML source and compares it to a stored snapshot. Any addition, removal, or modification in the HTML is detected. CSS selectors narrow the comparison to a specific element, such as a price or promo banner.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does change detection work on JavaScript-rendered pages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon uses server-side HTML fetching without a browser. Pages that require JavaScript to render content will not show the JavaScript-rendered content. Most pricing, product, and landing pages on Shopify and WooCommerce are server-rendered and work correctly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long is change history stored?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free: 7 days. Starter: 30 days. Growth: 90 days. Scale: 365 days.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the AI change summary look like?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instead of a raw HTML diff, you see a sentence like: "The price changed from $49 to $39. A new FAQ item was added about free shipping." Available on the Growth plan and above.',
      },
    },
  ],
};

const VS_TABLE = [
  { feature: 'Team Slack integration', beaconmon: true, visualping: false, distill: false },
  { feature: 'AI summaries of changes', beaconmon: true, visualping: false, distill: false },
  { feature: 'CSS selector targeting', beaconmon: true, visualping: true, distill: true },
  { feature: 'Weekly digest emails', beaconmon: true, visualping: false, distill: false },
  { feature: 'No browser extension needed', beaconmon: true, visualping: true, distill: false },
  { feature: 'Ecommerce-specific use cases', beaconmon: true, visualping: false, distill: false },
  { feature: 'Uptime monitoring in same tool', beaconmon: true, visualping: false, distill: false },
];

const USE_CASES = [
  {
    heading: 'Competitor price changes',
    body: 'Target the price element on a competitor product page. When the price drops or rises, you get an alert with the before and after value. No spreadsheet updates, no manual checks.',
  },
  {
    heading: 'Promotion and sale banners',
    body: 'Watch for new sale banners on competitor homepages and collection pages. Know within hours when a competitor launches a promotion so you can respond before customers start comparing.',
  },
  {
    heading: 'Shipping policy changes',
    body: 'Free shipping thresholds appear in site headers and footer copy. When a competitor lowers their threshold, Beaconmon catches it and alerts your team with a plain-English summary.',
  },
  {
    heading: 'New product and category launches',
    body: 'Monitor competitor collection pages and navigation. When a new product line appears or a category is added, you see it in the snapshot diff before any press release goes out.',
  },
];

const FEATURES = [
  {
    heading: 'HTML-based detection with CSS selectors',
    body: 'Beaconmon fetches the page HTML and compares it to the previous snapshot. CSS selectors let you monitor just a price element, a shipping cost blurb, or a specific promo section, not the entire page.',
  },
  {
    heading: 'AI change summaries',
    body: 'Growth plan and above: when a change is detected, Beaconmon generates a plain-English summary of what changed. No reading raw HTML diffs to figure out what actually moved.',
  },
  {
    heading: 'Snapshot history up to 365 days',
    body: 'Every version of a monitored page is stored with a timestamp. Open any two snapshots side by side to see exactly what changed and when. Scroll back through a competitor\'s pricing history over the past year.',
  },
  {
    heading: 'Weekly intelligence digests',
    body: 'A weekly email summary of all competitor changes detected in the past 7 days. Share it with your team or use it in a weekly competitive review meeting without anyone needing to log in.',
  },
  {
    heading: 'Slack and email alerts',
    body: 'Alerts reach your team where they work. Configure different Slack channels per monitor so pricing alerts go to the pricing team and product alerts go to product.',
  },
  {
    heading: 'Uptime monitoring in the same tool',
    body: 'Your own store uptime and competitor change detection in one dashboard. No switching between a change detection tool and an uptime tool.',
  },
];

const HOW_IT_WORKS = [
  'Add any URL as a content monitor, including competitor pricing pages, homepages, and collection pages',
  'Set a CSS selector to target just the element you care about, such as a price or promo banner',
  'Beaconmon fetches the page on your chosen interval and compares it to the previous snapshot',
  'When a change is detected, receive an alert with a diff and an AI summary of what changed in plain English',
  'Review weekly digests that collect all competitor moves from the past 7 days into a single email',
];

const FAQS = [
  {
    q: 'How is Beaconmon different from Visualping?',
    a: 'Visualping is built for personal use: individual users watching a single page for a specific change. Beaconmon is built for ecommerce teams: multiple users, multiple competitors, Slack integration, AI summaries of what changed, and a weekly digest your whole team can read. Visualping sends you an email with a screenshot diff. Beaconmon tells your team what the competitor actually changed, in plain English.',
  },
  {
    q: 'How is Beaconmon different from Distill?',
    a: 'Distill is a browser extension focused on technical power users who want XPath selectors and JavaScript execution. Beaconmon is a web-based tool for ecommerce teams that need to share monitoring across a team, receive alerts in Slack, and understand competitor changes without reading HTML diffs. No extension required.',
  },
  {
    q: 'What is HTML-based change detection?',
    a: "Beaconmon fetches a page's HTML source and compares it to a stored snapshot. Any addition, removal, or modification in the HTML is detected. CSS selectors narrow the comparison to a specific element, such as a price or promo banner.",
  },
  {
    q: 'Does change detection work on JavaScript-rendered pages?',
    a: 'Beaconmon uses server-side HTML fetching without a browser. Pages that require JavaScript to render content will not show the JavaScript-rendered content. Most pricing, product, and landing pages on Shopify and WooCommerce are server-rendered and work correctly.',
  },
  {
    q: 'How long is change history stored?',
    a: 'Free: 7 days. Starter: 30 days. Growth: 90 days. Scale: 365 days.',
  },
  {
    q: 'What does the AI change summary look like?',
    a: 'Instead of a raw HTML diff, you see a sentence like: "The price changed from $49 to $39. A new FAQ item was added about free shipping." Available on the Growth plan and above.',
  },
];

function CheckMark() {
  return <span className="text-brand-green-ink font-bold">Yes</span>;
}

function CrossMark() {
  return <span className="text-brand-muted">No</span>;
}

export default function WebsiteChangeDetectionPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Website Change Detection', path: '/website-change-detection' })} />
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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Change Detection for Ecommerce Teams</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Website Change Detection Built for Ecommerce Competitor Intelligence
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            Track competitor prices, promotions, and page changes at scale. Visualping and Distill are built for personal use. Beaconmon is built for teams that need to share intelligence, get Slack alerts, and act on changes the same day.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">What ecommerce teams actually track</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Change detection is most valuable when it is focused on competitor moves that affect your revenue.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            {USE_CASES.map(({ heading, body }) => (
              <div key={heading} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-2 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg1">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">Beaconmon vs Visualping vs Distill</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Both alternatives were designed for individual users. Beaconmon is designed for teams.</p>
          </div>
          <div className="reveal max-w-[780px] mx-auto overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-brand-line-soft">
                  <th className="text-left py-3 pr-6 text-brand-muted font-semibold tracking-[0.06em] uppercase text-[12px]">Feature</th>
                  <th className="py-3 px-4 text-brand-green-ink font-semibold text-[13px]">Beaconmon</th>
                  <th className="py-3 px-4 text-brand-muted font-semibold text-[13px]">Visualping</th>
                  <th className="py-3 px-4 text-brand-muted font-semibold text-[13px]">Distill</th>
                </tr>
              </thead>
              <tbody>
                {VS_TABLE.map(({ feature, beaconmon, visualping, distill }) => (
                  <tr key={feature} className="border-b border-brand-line-soft">
                    <td className="py-3 pr-6 text-brand-dim">{feature}</td>
                    <td className="py-3 px-4 text-center">{beaconmon ? <CheckMark /> : <CrossMark />}</td>
                    <td className="py-3 px-4 text-center">{visualping ? <CheckMark /> : <CrossMark />}</td>
                    <td className="py-3 px-4 text-center">{distill ? <CheckMark /> : <CrossMark />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">How website change detection alerts your team to what actually changed</h2>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FEATURES.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[980px] mx-auto">
            <div>
              <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                How website change detection works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Set up a content monitor in minutes. No browser extension, no code required.
              </p>
            </div>
            <ul className="space-y-4">
              {HOW_IT_WORKS.map((item, i) => (
                <li key={i} className="reveal flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5">
                  <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
                  <span className="text-[15px] text-brand-dim leading-[1.6]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Frequently asked questions</h2>
          </div>
          <div className="reveal max-w-[760px] mx-auto space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce competitor intelligence</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/homepage-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Competitor homepage monitoring</Link>
            <Link href="/for/shopify" className="text-brand-dim hover:text-brand-text transition-colors">Shopify monitoring</Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
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
            Know what competitors are changing, before your customers do.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

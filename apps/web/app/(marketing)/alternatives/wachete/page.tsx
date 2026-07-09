import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to Wachete for Ecommerce Stores (2026)',
  description:
    'Wachete is a generic web monitoring tool with no ecommerce features. Beaconmon offers free competitor monitoring for Shopify stores, with Shopify preset selectors and uptime alerts.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/wachete' },
  openGraph: { url: 'https://beaconmon.com/alternatives/wachete' },
};

const REASONS_TO_SWITCH = [
  {
    heading: 'Free plan checks once per day.',
    body: 'Wachete free gives you 5 pages at 24-hour check frequency. If a competitor drops a price and runs a same-day flash sale, you will not see it until the next morning. Beaconmon free checks hourly.',
  },
  {
    heading: 'No Shopify preset selectors.',
    body: 'Every monitor requires manual CSS selector setup. There are no presets for Shopify product prices, stock badges, or promotional copy. Beaconmon ships with preset selectors for the most common Shopify and WooCommerce elements.',
  },
  {
    heading: 'No uptime monitoring.',
    body: 'Wachete tracks content changes only. It will not alert you if a competitor site goes down, or if your own store loses SSL. Beaconmon handles both competitor tracking and uptime alerts in one subscription.',
  },
  {
    heading: 'No digest or Slack integration.',
    body: 'Wachete sends per-change email alerts. There is no weekly digest grouping changes into a readable summary and no native Slack delivery. Beaconmon Starter includes a scheduled Intelligence Digest to Slack or email.',
  },
  {
    heading: 'Built for generic use, not ecommerce.',
    body: "Wachete is a general-purpose page change tool. The onboarding, monitor types, and alert formats are not shaped around a Shopify store owner's workflow.",
  },
];

const BEACONMON_WINS = [
  'Free plan: 10 monitors, 1 competitor, hourly checks (Wachete free: 5 pages, daily checks)',
  'Preset Shopify and WooCommerce selectors included, no manual CSS setup required',
  'Uptime monitoring, SSL expiry, and domain expiry alerts on every plan',
  'Intelligence Digest to Slack or email on Starter ($29/mo)',
  'Ecommerce-native onboarding that detects Shopify and WooCommerce from step one',
];

const WHERE_WACHETE_WINS = [
  "Wachete's paid plan starts at $5.40/mo, less than any Beaconmon paid tier. For a small number of non-ecommerce pages with no need for uptime or ecommerce context, Wachete costs less.",
  "Wachete is general-purpose and works for any web page. If your monitoring needs extend beyond ecommerce into areas like tracking documentation, news pages, or competitor blog posts, Wachete's flexibility covers more ground.",
];

const FAQ_ITEMS = [
  {
    q: "How does Beaconmon's free plan compare to Wachete's?",
    a: "Wachete free: 5 pages, 24-hour check frequency. Beaconmon free: 10 monitors, 1 competitor, hourly checks. Beaconmon's free plan also includes uptime monitoring and SSL expiry alerts.",
  },
  {
    q: 'Does Wachete have Shopify-specific features?',
    a: 'No. Wachete is a generic web monitoring tool. It does not have preset selectors for Shopify product prices or stock status. Beaconmon provides preset selectors for the most common Shopify and WooCommerce elements so you can start tracking a competitor in minutes without knowing CSS.',
  },
  {
    q: 'Is Beaconmon more expensive than Wachete?',
    a: "Wachete's paid plan starts at $5.40/mo. Beaconmon Starter is $29/mo. If you only need basic web page monitoring with no ecommerce context, Wachete is cheaper. If you need Shopify preset selectors, uptime monitoring, and the Intelligence Digest, Beaconmon covers things Wachete does not offer at any price.",
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/wachete',
      name: 'Free Alternative to Wachete for Ecommerce Stores (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Wachete alternative', item: 'https://beaconmon.com/alternatives/wachete' },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function WacheteAlternativePage() {
  return (
    <>
      <JsonLd data={schemaData} />
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
          <Link
            href="/alternatives"
            className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4 hover:underline"
          >
            Alternatives
          </Link>
          <h1 className="text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[800px] mx-auto">
            Free alternative to Wachete for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mx-auto mb-4">
            Wachete is a generic web monitoring tool. Beaconmon is built for ecommerce, with Shopify preset selectors, hourly checks on the free plan, and uptime monitoring included.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      {/* Pricing callout */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(26px,3.2vw,38px)] tracking-[-0.03em] font-extrabold mb-3">
              How the free plans compare.
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[480px] mx-auto">
              Both tools have a free tier. The difference is what you get.
            </p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[820px] mx-auto">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-4">Wachete free</p>
              <ul className="space-y-3 text-[14px] text-brand-dim">
                <li>5 monitored pages</li>
                <li>24-hour check frequency</li>
                <li>No uptime monitoring</li>
                <li>No Shopify selectors</li>
                <li>No digest or Slack alerts</li>
              </ul>
              <p className="text-brand-muted text-[13px] mt-6">
                Paid from{' '}
                <Link href="/pricing" className="text-brand-green-ink hover:underline">
                  $5.40/mo
                </Link>{' '}
                (50 pages, 1-hour checks)
              </p>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-4">Beaconmon free</p>
              <ul className="space-y-3 text-[14px] text-brand-dim">
                <li className="flex items-start gap-2"><CheckIcon />10 monitors, 1 competitor</li>
                <li className="flex items-start gap-2"><CheckIcon />Hourly checks</li>
                <li className="flex items-start gap-2"><CheckIcon />Uptime monitoring + SSL alerts</li>
                <li className="flex items-start gap-2"><CheckIcon />Shopify and WooCommerce preset selectors</li>
                <li className="flex items-start gap-2"><CheckIcon />Free forever, no card required</li>
              </ul>
              <p className="text-brand-muted text-[13px] mt-6">
                Starter{' '}
                <Link href="/pricing" className="text-brand-green-ink hover:underline">
                  $29/mo
                </Link>{' '}
                adds Intelligence Digest and unlimited competitors
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why people look for alternatives */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(26px,3.2vw,38px)] tracking-[-0.03em] font-extrabold mb-3">
              Why Shopify stores look for Wachete alternatives.
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Wachete works for generic page monitoring. These are the points where it does not fit an ecommerce workflow.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[960px] mx-auto">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-2">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Beaconmon covers instead */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(26px,3.2vw,38px)] tracking-[-0.03em] font-extrabold mb-3">
              What Beaconmon covers instead.
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[480px] mx-auto">
              Built for ecommerce from the ground up, not adapted from a generic tool.
            </p>
          </div>
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
            <ul className="space-y-4">
              {BEACONMON_WINS.map((win) => (
                <li key={win} className="flex items-start gap-3">
                  <CheckIcon />
                  <span className="text-[15px] text-brand-dim leading-[1.6]">{win}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-center text-brand-muted text-[13px] mt-6">
            See{' '}
            <Link href="/shopify-competitor-monitoring" className="text-brand-green-ink hover:underline">
              how Shopify competitor monitoring works
            </Link>{' '}
            or{' '}
            <Link href="/pricing" className="text-brand-green-ink hover:underline">
              compare plans
            </Link>.
          </p>
        </div>
      </section>

      {/* Where Wachete still wins */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-8">
            <h2 className="text-[clamp(24px,3vw,34px)] tracking-[-0.03em] font-extrabold mb-3">
              Where Wachete is still the better choice.
            </h2>
            <p className="text-brand-dim text-[15px] max-w-[460px] mx-auto">
              Honest about where the competitor wins.
            </p>
          </div>
          <div className="reveal space-y-4">
            {WHERE_WACHETE_WINS.map((item) => (
              <div key={item} className="bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                <p className="text-[15px] text-brand-dim leading-[1.65]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,34px)] tracking-[-0.03em] font-extrabold mb-3">Frequently asked questions.</h2>
          </div>
          <div className="space-y-5">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.7]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] border-t border-brand-line-soft relative overflow-hidden">
        <div aria-hidden className="absolute pointer-events-none" style={{ bottom: '-40%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(0,229,122,0.15), transparent 60%)', filter: 'blur(40px)' }} />
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center relative">
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">Try Beaconmon free.</h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">See the Shopify-specific setup →</Link>
          </p>
        </div>
      </section>

      {/* See also */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/alternatives/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Visualping alternative</Link>
            <Link href="/alternatives/distill" className="text-brand-dim hover:text-brand-text transition-colors">Distill.io alternative</Link>
            <Link href="/alternatives/pagecrawl" className="text-brand-dim hover:text-brand-text transition-colors">PageCrawl alternative</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

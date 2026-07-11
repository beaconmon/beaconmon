import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to Hexowatch for Ecommerce Stores (2026)',
  description:
    'Hexowatch starts at $29 per month with no free plan. Beaconmon offers free monitoring and uptime for Shopify stores, with CSS selector precision.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/hexowatch' },
  openGraph: { url: 'https://beaconmon.com/alternatives/hexowatch' },
};

const TOOL_FACTS = [
  { label: 'Free plan', value: 'None' },
  { label: 'Starting price', value: '$29/mo (or $249.90/yr)' },
  { label: 'Business plan', value: '$55/mo' },
  { label: 'Business+ plan', value: '$99.99/mo' },
  { label: 'Enterprise', value: '$999+/mo' },
  { label: 'Monitor types', value: '13 (visual, content, keyword, price, API, WHOIS, and more)' },
  { label: 'Shopify preset selectors', value: 'No' },
  { label: 'Weekly Competitor Report', value: 'No' },
  { label: 'Primary audience', value: 'Marketers and agencies' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'No free plan.',
    body: 'Hexowatch requires payment from day one. There is no way to test whether the tool solves your problem before you commit to a monthly bill.',
  },
  {
    heading: 'Built for agencies, not store owners.',
    body: 'Hexowatch targets marketers and agencies running broad web intelligence workflows. There are no preset selectors for Shopify product price, stock status, or promotional copy.',
  },
  {
    heading: '13 monitor types, none tuned for ecommerce.',
    body: 'Most Shopify stores need three things: competitor prices, competitor page changes, and their own uptime. Hexowatch requires manual configuration across multiple monitor types to cover that use case.',
  },
  {
    heading: 'No consolidated digest.',
    body: 'Hexowatch sends individual alerts per change. There is no Weekly Competitor Report grouping competitor changes into a readable summary for your store.',
  },
  {
    heading: 'Visual monitoring misses specific values.',
    body: 'Visual diffing tells you a region of a page changed. It does not tell you that a price dropped from $89 to $69 or that a promotional banner appeared. CSS-selector targeting gives you the exact value that changed.',
  },
];

const BEACONMON_WINS = [
  {
    heading: 'Free plan included.',
    body: '10 monitors and 1 competitor, free forever. No credit card required. Hexowatch has no free tier.',
  },
  {
    heading: 'Same starting price, more for ecommerce.',
    body: 'Beaconmon Starter is $29/mo, the same as Hexowatch Pro. Starter includes the Weekly Competitor Report, Shopify preset selectors, uptime monitoring, SSL alerts, and domain expiry alerts.',
  },
  {
    heading: 'Shopify and WooCommerce presets.',
    body: 'Point at a competitor product URL. Beaconmon knows which CSS selectors to target for price, stock, and promotional copy on Shopify and WooCommerce stores. No manual selector configuration.',
  },
  {
    heading: 'Weekly Competitor Report.',
    body: 'A Slack or email digest groups every competitor change from the past week. No dashboard to check. Changes land in your inbox or channel on a schedule you control.',
  },
  {
    heading: 'AI significance scoring on Growth.',
    body: 'On Growth plans, an AI reads each change and classifies it: clearance push, margin test, new campaign, or minor copy tweak. You decide what to act on.',
  },
  {
    heading: 'Ecommerce-native onboarding.',
    body: 'Setup asks for your store URL and suggests monitors. Competitor setup is a dedicated wizard step. You are monitoring in minutes, not after configuring 13 monitor types.',
  },
];

const WHERE_HEXOWATCH_WINS = [
  {
    heading: 'More monitor types.',
    body: 'If you need API monitoring, WHOIS change detection, technology stack tracking, or keyword monitoring alongside content watching, Hexowatch covers more in one subscription.',
  },
  {
    heading: 'Visual monitoring catches layout changes.',
    body: 'Visual diffing catches image swaps, layout shifts, and design changes that CSS-selector targeting misses. For non-structured visual changes, Hexowatch is more capable.',
  },
  {
    heading: 'Works for any website type.',
    body: 'Hexowatch is not limited to Shopify and WooCommerce. If you monitor a mix of site types including headless frontends or custom platforms, its broader coverage is useful.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does Hexowatch have a free plan?',
    a: 'No. Hexowatch starts at $29/month with no free tier and no trial without a credit card. Beaconmon offers 10 free monitors and 1 competitor forever, with no card required.',
  },
  {
    q: 'What does Beaconmon do that Hexowatch does not?',
    a: "Beaconmon ships with Shopify preset selectors for price and stock monitoring, delivers a Weekly Competitor Report to Slack or email, and includes an ecommerce-native setup flow. Hexowatch is more general-purpose and does not offer these features.",
  },
  {
    q: 'Can Hexowatch monitor Shopify competitor prices?',
    a: 'Hexowatch can detect that something changed on a page using visual diffing or content monitoring. It does not have preset Shopify selectors, so you have to manually configure what to watch. Beaconmon targets Shopify price and stock elements directly with preset selectors.',
  },
  {
    q: 'Is Beaconmon cheaper than Hexowatch?',
    a: 'The Starter plans are the same price ($29/mo), but Beaconmon Starter includes the Weekly Competitor Report and Shopify presets that Hexowatch Pro does not. Hexowatch higher tiers ($55 to $99/mo) add features like visual monitoring and API checks that Beaconmon does not offer.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/hexowatch',
      name: 'Free Alternative to Hexowatch for Ecommerce Stores (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Free alternative to Hexowatch',
          item: 'https://beaconmon.com/alternatives/hexowatch',
        },
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

export default function HexowatchAlternativePage() {
  return (
    <>
      <JsonLd data={schemaData} />
      <NavBar />

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
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Free alternative to Hexowatch for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            Hexowatch starts at $29/month with no free plan. Beaconmon gives you competitor monitoring and uptime
            for Shopify stores, free to start, with CSS-selector precision and a Weekly Competitor Report.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              What Hexowatch charges
            </h2>
            <p className="text-brand-dim text-[16px]">Hexowatch has no free tier. Beaconmon does.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-4 block">
                Hexowatch
              </span>
              <div className="space-y-3">
                {TOOL_FACTS.map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4 text-[14px]">
                    <span className="text-brand-muted">{label}</span>
                    <span className="text-brand-dim font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-4 block">
                Beaconmon
              </span>
              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Free plan</span>
                  <span className="text-brand-green-ink font-semibold">10 monitors, 1 competitor</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Starter</span>
                  <span className="text-brand-dim font-medium">$29/mo</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Shopify preset selectors</span>
                  <span className="text-brand-green-ink font-semibold">Yes</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Weekly Competitor Report</span>
                  <span className="text-brand-green-ink font-semibold">Starter+</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Uptime monitoring</span>
                  <span className="text-brand-green-ink font-semibold">Included</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">SSL + domain alerts</span>
                  <span className="text-brand-green-ink font-semibold">Included</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">AI significance scoring</span>
                  <span className="text-brand-dim font-medium">Growth+</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Card required for free plan</span>
                  <span className="text-brand-green-ink font-semibold">No</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-brand-muted text-[13px] text-center mt-5">
            See full pricing at{' '}
            <Link href="/pricing" className="text-brand-green-ink hover:underline">
              beaconmon.com/pricing
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Why Shopify stores look for Hexowatch alternatives
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Hexowatch is a capable tool. These are the gaps that make it a poor fit for ecommerce use cases.
            </p>
          </div>
          <div className="space-y-4">
            {REASONS_TO_SWITCH.map(({ heading, body }, i) => (
              <div key={heading} className="reveal flex gap-5 bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(0,229,122,0.1)] border border-[rgba(0,229,122,0.2)] flex items-center justify-center text-[12px] font-bold text-brand-green-ink">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-bold tracking-[-0.01em] mb-1">{heading}</h3>
                  <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              What Beaconmon does instead
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">
              Narrower than Hexowatch, and deeper on the features Shopify stores use.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {BEACONMON_WINS.map(({ heading, body }) => (
              <div
                key={heading}
                className="reveal bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.15)] rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckIcon />
                  <h3 className="text-[15px] font-bold tracking-[-0.01em] text-brand-text">{heading}</h3>
                </div>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Where Hexowatch is still the better choice
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">
              Honest about where Hexowatch wins. Not every store should switch.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_HEXOWATCH_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <h3 className="text-[15px] font-bold tracking-[-0.01em] mb-2">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <p className="text-brand-muted text-[13px] text-center mt-6 leading-[1.65]">
            If you need API monitoring, WHOIS tracking, or visual diffing for non-Shopify sites, Hexowatch is the
            stronger tool. Beaconmon is built for stores on Shopify or WooCommerce that want competitor
            monitoring and uptime in one focused product.
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Common questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <h3 className="text-[15px] font-bold tracking-[-0.01em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
            Try Beaconmon free.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">
              See the Shopify-specific setup →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/hexowatch" className="text-brand-dim hover:text-brand-text transition-colors">
              Beaconmon vs Hexowatch (full comparison)
            </Link>
            <Link href="/alternatives/visualping" className="text-brand-dim hover:text-brand-text transition-colors">
              Free alternative to Visualping
            </Link>
            <Link href="/alternatives/distill" className="text-brand-dim hover:text-brand-text transition-colors">
              Free alternative to Distill.io
            </Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">
              All alternatives
            </Link>
            <Link
              href="/shopify-competitor-monitoring"
              className="text-brand-dim hover:text-brand-text transition-colors"
            >
              Shopify competitor monitoring
            </Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

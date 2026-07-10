import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';
import CheckIcon from '@/components/marketing/CheckIcon';

export const metadata: Metadata = {
  title: 'Free Alternative to Distill.io for Ecommerce Stores (2026)',
  description:
    'Beaconmon monitors competitor prices and page changes for Shopify stores, adds uptime monitoring, and delivers a weekly Intelligence Digest. Free plan.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/distill' },
  openGraph: { url: 'https://beaconmon.com/alternatives/distill' },
};

const REASONS_TO_SWITCH = [
  {
    heading: '30 alerts per month runs out fast.',
    body: 'Track a handful of competitor pages and you hit the free plan cap within days. Every alert after that goes unsent until the next billing cycle.',
  },
  {
    heading: 'Built around a Chrome extension, not a team workflow.',
    body: 'Distill started as a browser extension. Cloud monitoring was added later. The product still reflects that origin: no shared digests, no Slack delivery, no team-first UX.',
  },
  {
    heading: 'You need a second tool for uptime.',
    body: 'Distill monitors content changes only. If your own store goes down, Distill will not tell you. You end up paying for and managing two separate monitoring products.',
  },
  {
    heading: 'No Shopify preset selectors.',
    body: 'Every monitor requires manual CSS selector configuration. For Shopify stores tracking a dozen competitor product pages, setup takes hours instead of minutes.',
  },
  {
    heading: 'No weekly digest.',
    body: 'Alerts arrive one at a time. By Friday you have no clear picture of what competitors did that week, just a cluttered inbox of individual notifications.',
  },
  {
    heading: 'AI summaries are locked to the most expensive tier.',
    body: "Distill's AI features require the $80+/mo Flexi plan. On any lower plan you get raw diffs with no context about what a change means for your business.",
  },
];

const BEACONMON_WINS = [
  {
    heading: 'No Chrome extension required.',
    body: 'Beaconmon is fully cloud-based. Set up monitors in the dashboard and receive alerts in Slack or email. Nothing to install, nothing to update across team machines.',
  },
  {
    heading: 'Preset Shopify selectors.',
    body: 'Add a competitor price monitor in under 2 minutes using built-in presets for Shopify and WooCommerce product pages. No manual CSS selector hunting required.',
  },
  {
    heading: 'No monthly alert count cap.',
    body: "Beaconmon's free plan: 10 monitors, 1 competitor, alerts without a monthly count limit. Distill's free plan cuts off at 30 email alerts per month regardless of how many changes occur.",
  },
  {
    heading: 'Uptime monitoring included on all plans.',
    body: 'HTTP checks, SSL expiry alerts at 30, 14, and 7 days, and domain expiry warnings. All included at no extra cost. One tool instead of two.',
  },
  {
    heading: 'Intelligence Digest on Starter.',
    body: 'A weekly Slack or email summary of every competitor change, written in plain language. Available from $29/mo. No inbox clutter from one-off notifications.',
  },
  {
    heading: 'AI significance scoring on Growth.',
    body: 'Beaconmon classifies each change: clearance push, margin test, new campaign, or minor copy tweak. Available on Growth, not locked behind an $80+/mo tier.',
  },
];

const WHERE_DISTILL_WINS = [
  {
    heading: 'JavaScript rendering.',
    body: 'Distill renders a page in a real browser before capturing it. If a competitor uses a headless or SPA frontend that loads prices via JavaScript, Distill catches changes that Beaconmon will not. Beaconmon uses HTML-only monitoring and is transparent about this limitation.',
  },
  {
    heading: 'More monitors on the free plan.',
    body: "Distill's free plan includes 25 monitors. Beaconmon's includes 10. If monitor count matters more to you than alert limits or ecommerce context, Distill's free tier covers more pages.",
  },
  {
    heading: 'General-purpose flexibility.',
    body: 'For monitoring non-ecommerce content such as forums, government pages, or news sites, Distill is more adaptable. Beaconmon is narrower by design, built around the ecommerce workflow.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does Beaconmon render JavaScript like Distill?',
    a: 'No. Beaconmon uses HTML-only monitoring, which covers the vast majority of Shopify and WooCommerce stores because they serve product prices and stock levels in server-rendered HTML. If a competitor uses a fully client-side SPA frontend that loads prices via JavaScript, Distill will catch changes that Beaconmon does not. We are upfront about this.',
  },
  {
    q: 'Does Beaconmon require a Chrome extension?',
    a: 'No. Beaconmon is fully cloud-based. You set up monitors in the dashboard and alerts arrive in Slack or email. No browser extension is required on any plan.',
  },
  {
    q: "How does Beaconmon's free plan compare to Distill's?",
    a: "Distill's free plan: 25 monitors, 30 email alerts per month, 6-hour minimum check frequency. Beaconmon's free plan: 10 monitors, 1 competitor, no monthly alert count cap. Beaconmon also includes uptime monitoring and SSL expiry alerts on the free plan. The better fit depends on whether monitor count or alert limits are your binding constraint.",
  },
  {
    q: 'What is the Intelligence Digest?',
    a: 'A weekly Slack or email summary of every competitor change detected in the past week, written in plain language. Available on Beaconmon Starter ($29/mo). Distill does not offer a digest feature on any plan.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/distill',
      name: 'Free Alternative to Distill.io for Ecommerce Stores (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Distill.io alternative', item: 'https://beaconmon.com/alternatives/distill' },
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

export default function AlternativesDistillPage() {
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
            Free alternative to Distill.io for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mx-auto mb-4">
            Beaconmon tracks competitor prices and page changes, adds uptime monitoring, and delivers a weekly Intelligence Digest. Built for ecommerce. No Chrome extension. Free plan, no card required.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              What Distill.io charges vs what Beaconmon costs
            </h2>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">Distill.io</span>
              <p className="text-[28px] font-extrabold tracking-[-0.02em] mb-1">Free</p>
              <p className="text-brand-muted text-[13px] mb-6">25 monitors, 30 alerts/month cap, 6h minimum frequency</p>
              <ul className="space-y-2 text-[14px] text-brand-dim">
                <li>$15/mo for 50 pages</li>
                <li>$35/mo Professional plan</li>
                <li>$80+/mo for AI summaries</li>
                <li>Chrome extension required</li>
                <li>No uptime monitoring</li>
                <li>No Intelligence Digest</li>
              </ul>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon</span>
              <p className="text-[28px] font-extrabold tracking-[-0.02em] mb-1">Free</p>
              <p className="text-brand-muted text-[13px] mb-6">10 monitors, 1 competitor, no monthly alert cap</p>
              <ul className="space-y-3 text-[14px] text-brand-dim">
                <li className="flex items-center gap-2">
                  <CheckIcon /> No Chrome extension
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Uptime monitoring included
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> SSL and domain expiry alerts
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Shopify preset selectors
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> Intelligence Digest from $29/mo
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon /> AI scoring on Growth plan
                </li>
              </ul>
            </div>
          </div>
          <p className="text-center text-brand-muted text-[13px] mt-5">
            Full plan details at{' '}
            <Link href="/pricing" className="text-brand-green-ink hover:underline">
              beaconmon.com/pricing
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Why Shopify stores look for Distill.io alternatives
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Six reasons ecommerce store owners outgrow Distill.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-2">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              What Beaconmon does instead
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Built for ecommerce teams, not general-purpose web watching.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {BEACONMON_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-2 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <div className="reveal mt-8 text-center">
            <p className="text-brand-muted text-[14px]">
              For a detailed side-by-side, see the{' '}
              <Link href="/vs/distill" className="text-brand-green-ink hover:underline">
                Beaconmon vs Distill.io full comparison →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Where Distill.io still wins
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">
              We are honest about where Distill is the better choice.
            </p>
          </div>
          <div className="reveal space-y-4">
            {WHERE_DISTILL_WINS.map(({ heading, body }) => (
              <div key={heading} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <h3 className="text-[15px] font-bold tracking-[-0.01em] mb-2">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <div className="reveal mt-8 bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.15)] rounded-2xl p-6 text-center">
            <p className="text-[14px] text-brand-dim leading-[1.65]">
              If JavaScript rendering is essential for your specific competitors, Distill may be a better fit. If your competitors run standard Shopify or WooCommerce stores with server-rendered prices, Beaconmon covers them. See the{' '}
              <Link href="/competitor-price-tracking" className="text-brand-green-ink hover:underline">
                competitor price tracking guide
              </Link>{' '}
              to understand the difference.
            </p>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Frequently asked questions
            </h2>
          </div>
          <div className="reveal space-y-5">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.7]">{a}</p>
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
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">Try Beaconmon free.</h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">See the Shopify-specific setup →</Link>
          </p>
        </div>
      </section>

      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/distill" className="text-brand-dim hover:text-brand-text transition-colors">
              Beaconmon vs Distill.io
            </Link>
            <Link href="/alternatives/visualping" className="text-brand-dim hover:text-brand-text transition-colors">
              Free alternative to Visualping
            </Link>
            <Link href="/alternatives/hexowatch" className="text-brand-dim hover:text-brand-text transition-colors">
              Free alternative to Hexowatch
            </Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">
              All alternatives
            </Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">
              Shopify competitor monitoring
            </Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

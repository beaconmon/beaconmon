import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs changedetection.io for Shopify (2026)',
  description:
    'changedetection.io is free to self-host but needs a server and setup time. Beaconmon is a hosted, Shopify-native alternative with uptime included.',
  alternates: { canonical: 'https://beaconmon.com/vs/changedetection-io' },
  openGraph: { url: 'https://beaconmon.com/vs/changedetection-io' },
};

const TABLE_ROWS = [
  {
    feature: 'Tracks page content changes',
    beaconmon: '✓ CSS-selector targeting',
    competitor: '✓ Full-page or element diff',
    beaconmonGood: false,
  },
  {
    feature: 'JavaScript rendering (headless browser)',
    beaconmon: 'No, HTML-only',
    competitor: '✓ On hosted plan',
    beaconmonGood: false,
  },
  {
    feature: 'Self-hosting required',
    beaconmon: 'No, fully hosted',
    competitor: 'Yes, unless on paid hosted plan',
    beaconmonGood: true,
  },
  {
    feature: 'Shopify / WooCommerce preset selectors',
    beaconmon: '✓ Built in',
    competitor: 'Manual selector setup',
    beaconmonGood: true,
  },
  {
    feature: 'Uptime monitoring',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'SSL + domain expiry alerts',
    beaconmon: '✓ Included',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Weekly Competitor Report (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Notification integrations',
    beaconmon: 'Slack, email',
    competitor: '✓ 100+ via Apprise',
    beaconmonGood: false,
  },
  {
    feature: 'JSON / API / PDF monitoring',
    beaconmon: 'No',
    competitor: '✓ Included',
    beaconmonGood: false,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor, hosted',
    competitor: 'Free if self-hosted, no server included',
    beaconmonGood: false,
  },
  {
    feature: 'Starting paid price',
    beaconmon: '$29/mo',
    competitor: '$8.99/mo hosted',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You already run infrastructure and want full control.',
    body: 'changedetection.io is open source with 30.7k GitHub stars. Self-hosted, it is free indefinitely, and you own the data, the retention, and the deployment. If you have the DevOps capacity, that control is worth something Beaconmon does not offer.',
  },
  {
    title: 'You need to monitor more than web pages.',
    body: 'changedetection.io tracks JSON APIs, PDFs, and renders JavaScript-heavy sites with a real browser on its hosted plan. Beaconmon is HTML-only and built around ecommerce competitor pages specifically.',
  },
  {
    title: 'You want the cheapest possible hosted option and do not need ecommerce presets.',
    body: 'The hosted changedetection.io plan starts at $8.99/mo, cheaper than Beaconmon\'s $29/mo Starter, if you are comfortable configuring selectors yourself and do not need uptime monitoring bundled in.',
  },
];

const SWITCH_REASONS = [
  'You do not want to run a server, manage Docker, or handle uptime for your own monitoring tool. Beaconmon is fully hosted from the start.',
  'Beaconmon ships with preset selectors for Shopify and WooCommerce product pages, so price and stock tracking works without manually inspecting HTML.',
  'You want uptime, SSL, and domain expiry monitoring for your own store in the same subscription as competitor tracking.',
  'You want a Weekly Competitor Report that reads like a digest, not a stream of raw diff notifications to interpret yourself.',
];

const FAQ_ITEMS = [
  {
    q: 'Is changedetection.io really free?',
    a: 'Self-hosted, yes, the core tool is open source and free to run on your own server via Docker or pip. You provide the infrastructure and the setup time. Its hosted SaaS version starts at $8.99/mo and removes the self-hosting requirement.',
  },
  {
    q: 'Why would I pay for Beaconmon if changedetection.io is free?',
    a: 'If you are comfortable running a server, configuring selectors by hand, and maintaining uptime for your own monitoring stack, self-hosted changedetection.io costs nothing but your time. Beaconmon is fully hosted, comes with Shopify and WooCommerce presets, and bundles uptime and SSL monitoring for your own store, which changedetection.io does not do at all.',
  },
  {
    q: 'Does changedetection.io monitor my own store\'s uptime?',
    a: 'No. changedetection.io is a change-detection tool for any URL, including competitor pages, but it has no concept of uptime monitoring, SSL expiry, or domain expiry for your own store. Beaconmon covers both in one subscription.',
  },
  {
    q: 'Does Beaconmon render JavaScript like changedetection.io\'s hosted plan does?',
    a: 'No. Beaconmon monitors server-rendered HTML, which covers most Shopify and WooCommerce stores since prices and inventory are typically present in the initial page load. If a competitor runs a JavaScript-heavy headless storefront, changedetection.io\'s browser rendering will catch changes Beaconmon will not.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/changedetection-io',
      name: 'Beaconmon vs changedetection.io for Shopify (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs changedetection.io', item: 'https://beaconmon.com/vs/changedetection-io' },
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

export default function VsChangeDetectionIoPage() {
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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <Link href="/vs" className="inline-flex items-center gap-2 text-[13px] text-brand-muted hover:text-brand-dim transition-colors mb-6">
            <span>←</span> All comparisons
          </Link>
          <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Comparison</span>
          <h1 className="text-[clamp(36px,4.5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px]">
            Beaconmon vs changedetection.io<br />
            <span className="text-brand-green-ink">for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            changedetection.io is the open-source reference point for web page monitoring, 30.7k GitHub stars and counting. It is free if you run it yourself. Beaconmon is a hosted, ecommerce-specific alternative: no server to run, Shopify and WooCommerce presets out of the box, and uptime monitoring bundled in.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              changedetection.io is the right tool if you want to self-host, need to monitor JSON APIs, PDFs, or JavaScript-heavy pages, and are comfortable configuring selectors by hand. Beaconmon is the right tool if you run a Shopify or WooCommerce store, want it working in minutes with preset selectors, and want competitor tracking and your own store\'s uptime monitoring in one place without standing up infrastructure. Different audiences: one is a general-purpose developer tool, the other is built for ecommerce store owners.
            </p>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">Feature by feature</h2>
          </div>
          <div className="reveal overflow-x-auto border border-brand-line rounded-[14px] bg-brand-bg1 max-w-[900px] mx-auto">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-text font-semibold border-b border-brand-line-soft w-[40%]">Feature</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-green-ink font-semibold border-b border-brand-line-soft bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)]">Beaconmon</th>
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">changedetection.io</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(({ feature, beaconmon, competitor, beaconmonGood }, i) => (
                  <tr key={feature}>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{feature}</td>
                    <td className={`p-4 text-[14px] bg-[rgba(0,229,122,0.04)] border-l border-r border-[rgba(0,229,122,0.2)] font-medium ${beaconmonGood ? 'text-brand-green-ink' : 'text-brand-dim'} ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{beaconmon}</td>
                    <td className={`p-4 text-[14px] text-brand-dim ${i < TABLE_ROWS.length - 1 ? 'border-b border-brand-line-soft' : ''}`}>{competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                When to stay on changedetection.io
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                30.7k GitHub stars is not an accident. Here is where the open-source tool genuinely wins.
              </p>
            </div>
            <div className="space-y-4">
              {STAY_REASONS.map(({ title, body }) => (
                <div key={title} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-xl p-6">
                  <p className="text-[14px] font-semibold text-brand-text mb-1">{title}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.6]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[900px] mx-auto">
            <div>
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Why ecommerce stores choose Beaconmon instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Not every store owner wants to run a Docker container. Most just want it to work.
              </p>
            </div>
            <ul className="space-y-4">
              {SWITCH_REASONS.map((reason, i) => (
                <li key={i} className="reveal flex items-start gap-3 text-[14px] text-brand-dim">
                  <CheckIcon />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-10">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.15]">
                Frequently asked questions
              </h2>
            </div>
            <div className="space-y-6">
              {FAQ_ITEMS.map(({ q, a }) => (
                <div key={q} className="reveal border-b border-brand-line-soft pb-6">
                  <p className="text-[15px] font-semibold text-brand-text mb-2">{q}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.65]">{a}</p>
                </div>
              ))}
            </div>
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
            <Link href="/vs/distill" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Distill.io</Link>
            <Link href="/vs/hexowatch" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Hexowatch</Link>
            <Link href="/alternatives/changedetection-io" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to changedetection.io</Link>
            <Link href="/website-change-detection" className="text-brand-dim hover:text-brand-text transition-colors">Website change detection guide</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

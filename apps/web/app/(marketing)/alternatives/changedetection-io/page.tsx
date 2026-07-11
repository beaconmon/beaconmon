import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import CheckIcon from '@/components/marketing/CheckIcon';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hosted Alternative to changedetection.io for Shopify Stores (2026)',
  description:
    'changedetection.io is free but self-hosted. Beaconmon is a hosted alternative with Shopify presets and uptime monitoring, free to start.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/changedetection-io' },
  openGraph: { url: 'https://beaconmon.com/alternatives/changedetection-io' },
};

const TOOL_FACTS = [
  { label: 'Self-hosted price', value: 'Free (Docker or pip, you provide the server)' },
  { label: 'Hosted SaaS price', value: '$8.99/mo' },
  { label: 'Core feature', value: 'Open-source change detection for any URL: text, JSON, PDF, visual' },
  { label: 'Shopify / WooCommerce presets', value: 'No, selectors are configured manually' },
  { label: 'Uptime monitoring', value: 'No' },
  { label: 'SSL / domain expiry alerts', value: 'No' },
  { label: 'Weekly Competitor Report', value: 'No' },
  { label: 'JavaScript rendering', value: 'Yes on hosted plan, a genuine advantage over Beaconmon' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'Self-hosting is a real cost, even if the software is free.',
    body: 'Running changedetection.io yourself means a server, Docker or a Python environment, and ongoing maintenance. Beaconmon is fully hosted from the first signup.',
  },
  {
    heading: 'Selectors are manual with no ecommerce shortcuts.',
    body: 'changedetection.io is a general-purpose tool. Setting it up to track a Shopify product price means inspecting HTML and writing your own selector. Beaconmon ships with presets for Shopify and WooCommerce product, price, and stock elements.',
  },
  {
    heading: 'Your own store\'s uptime is not covered.',
    body: 'changedetection.io watches URLs you point it at, competitor pages included, but has no concept of monitoring your own store\'s availability, SSL certificate, or domain expiry. Beaconmon covers all three in the same plan.',
  },
  {
    heading: 'There is no ecommerce-specific digest.',
    body: 'changedetection.io sends raw change notifications through its Apprise integration. Beaconmon\'s Weekly Competitor Report rolls every change into one readable summary built for a store owner, not a developer.',
  },
];

const BEACONMON_WINS = [
  'Free plan: 10 monitors, 1 competitor, forever. No card, no server.',
  'Preset selectors for Shopify and WooCommerce price, stock, and content.',
  'Uptime monitoring and SSL expiry alerts included in every plan.',
  'Domain expiry alerts at 30, 14, and 7 days.',
  'Weekly Competitor Report: a weekly Slack or email summary of every competitor change.',
  'Nothing to deploy, update, or keep running yourself.',
];

const WHERE_CHANGEDETECTION_WINS = [
  {
    heading: 'Full control through self-hosting.',
    body: 'With 30.7k GitHub stars, changedetection.io is the most established open-source option in this space. Self-hosted, you own the deployment, retention, and data completely. Beaconmon does not offer a self-hosted option.',
  },
  {
    heading: 'Broader monitor types.',
    body: 'changedetection.io tracks JSON APIs, PDFs, and visual changes, not just HTML content. Beaconmon is HTML-only and focused specifically on ecommerce competitor pages.',
  },
  {
    heading: 'JavaScript rendering on the hosted plan.',
    body: 'changedetection.io\'s hosted SaaS includes a real Chrome browser for JavaScript-heavy sites. Beaconmon monitors server-rendered HTML only, so a headless or client-side-rendered competitor storefront may hide changes from Beaconmon that changedetection.io would catch.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is changedetection.io free?',
    a: 'The self-hosted, open-source version is free. You run it on your own server via Docker or pip and maintain it yourself. A hosted SaaS version exists starting at $8.99/mo if you want to skip the self-hosting.',
  },
  {
    q: 'Why choose Beaconmon over free, self-hosted changedetection.io?',
    a: 'If you do not want to run a server, configure selectors manually, or maintain uptime for your monitoring tool itself, Beaconmon is hosted from the start with Shopify and WooCommerce presets built in. It also monitors your own store\'s uptime and SSL status, which changedetection.io does not do at any tier.',
  },
  {
    q: 'Does Beaconmon support the same broad monitor types as changedetection.io?',
    a: 'No. Beaconmon is HTML-only and purpose-built for ecommerce competitor pages. changedetection.io also monitors JSON APIs, PDFs, and can render JavaScript on its hosted plan. If you need that breadth, changedetection.io covers more ground.',
  },
  {
    q: 'Can I use Beaconmon for competitor pages and changedetection.io for everything else?',
    a: 'Yes. Some teams run changedetection.io for general-purpose monitoring, API endpoints, PDFs, internal tools, and use Beaconmon specifically for ecommerce competitor intelligence and their own store\'s uptime.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/changedetection-io',
      name: 'Hosted Alternative to changedetection.io for Shopify Stores (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'changedetection.io alternative', item: 'https://beaconmon.com/alternatives/changedetection-io' },
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

export default function ChangeDetectionIoAlternativePage() {
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Hosted alternative to changedetection.io
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Competitor monitoring for Shopify stores. Without running a server.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            changedetection.io is excellent open-source software. If you would rather not self-host, configure selectors by hand, or maintain uptime for your own monitoring stack, Beaconmon covers competitor and store monitoring from free.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What changedetection.io costs</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">The pricing facts, without spin.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">changedetection.io</span>
              <div className="text-[36px] font-extrabold tracking-[-0.03em] mb-1">Free<span className="text-[18px] font-semibold text-brand-dim"> self-hosted</span></div>
              <p className="text-brand-dim text-[14px] mb-6">Hosted SaaS from $8.99/mo, includes a Chrome browser for JavaScript sites and EU/US proxies.</p>
              <div className="space-y-2">
                {TOOL_FACTS.map(({ label, value }) => (
                  <div key={label} className="flex gap-3 text-[13px]">
                    <span className="text-brand-muted shrink-0 w-[150px]">{label}</span>
                    <span className="text-brand-dim">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon</span>
              <div className="text-[36px] font-extrabold tracking-[-0.03em] mb-1">Free<span className="text-[18px] font-semibold text-brand-dim"> to start</span></div>
              <p className="text-brand-dim text-[14px] mb-6">10 monitors and 1 competitor free forever. Starter at $29/mo unlocks unlimited competitors and Weekly Competitor Report.</p>
              <div className="space-y-3">
                {[
                  'No card required, no server to run',
                  'Preset Shopify and WooCommerce selectors',
                  'Uptime, SSL, and domain expiry alerts',
                  'Weekly Competitor Report on Starter+',
                  'HTML-only, no JS rendering (changedetection.io wins here)',
                  'See pricing details',
                ].map((item, i) =>
                  i === 5 ? (
                    <Link key={item} href="/pricing" className="flex items-start gap-2 text-[13px] text-brand-green-ink hover:underline">
                      <CheckIcon className="mt-[2px] shrink-0" />
                      {item}
                    </Link>
                  ) : (
                    <div key={item} className="flex items-start gap-2 text-[13px] text-brand-dim">
                      <CheckIcon className="mt-[2px] shrink-0" />
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Why Shopify stores look for a changedetection.io alternative</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">changedetection.io is free but general-purpose. Ecommerce store owners usually want less setup, not more.</p>
          </div>
          <div className="space-y-4">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What Beaconmon covers instead</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Built for stores that want competitor and uptime monitoring working in minutes, not after a Docker deployment.
            </p>
          </div>
          <div className="reveal grid grid-cols-1 gap-3 max-w-[660px] mx-auto">
            {BEACONMON_WINS.map((item) => (
              <div key={item} className="flex items-start gap-3 bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.15)] rounded-xl px-5 py-4">
                <CheckIcon className="mt-[2px] shrink-0 text-brand-green-ink" />
                <p className="text-brand-dim text-[14px] leading-[1.6]">{item}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-center text-brand-muted text-[13px] mt-6">
            Want to see how content change detection works in Beaconmon?{' '}
            <Link href="/website-change-detection" className="text-brand-green-ink hover:underline">
              Read the website change detection guide →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Where changedetection.io still wins</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Be honest about this. If changedetection.io is the right fit, we will say so.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_CHANGEDETECTION_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-center mt-8">
            <Link href="/vs/changedetection-io" className="text-brand-green-ink text-[14px] hover:underline">
              Read the full Beaconmon vs changedetection.io comparison →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Common questions</h2>
          </div>
          <div className="space-y-5">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-3">{q}</h3>
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
            <Link href="/vs/changedetection-io" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs changedetection.io</Link>
            <Link href="/alternatives/distill" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to Distill.io</Link>
            <Link href="/website-change-detection" className="text-brand-dim hover:text-brand-text transition-colors">Website change detection guide</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import CheckIcon from '@/components/marketing/CheckIcon';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cheaper Alternative to Panoramata for Ecommerce Brands (2026)',
  description:
    'Panoramata starts at $89 per month. For competitor website monitoring and uptime, Beaconmon covers that from $29 per month, with a free plan available.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/panoramata' },
  openGraph: { url: 'https://beaconmon.com/alternatives/panoramata' },
};

const TOOL_FACTS = [
  { label: 'Starting price', value: '$89/mo (Startup plan)' },
  { label: 'Free plan', value: 'None' },
  { label: 'Professional plan', value: '$149/mo' },
  { label: 'Unlimited plan', value: '$399/mo' },
  { label: 'Covers', value: 'Email campaigns, ad creatives (Facebook, TikTok, Google), SMS, landing pages, website changes' },
  { label: 'Uptime monitoring', value: 'Not included' },
  { label: 'SSL / domain expiry alerts', value: 'Not included' },
  { label: 'Website change digest', value: 'Not included' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'You are paying for channels you do not use.',
    body: 'Panoramata bundles email, ad, and SMS intelligence into every plan. If your main goal is knowing when a competitor changes their website, you are paying $89-399/mo for capabilities outside your workflow. Beaconmon covers the website monitoring use case from $29/mo.',
  },
  {
    heading: 'No uptime monitoring.',
    body: 'Panoramata does not monitor whether your own store is up. Knowing your checkout is down requires a separate tool, adding another subscription and another dashboard to check.',
  },
  {
    heading: 'Page-level diffing, not selector-level precision.',
    body: "Panoramata's website change tracking works at the landing page level. Beaconmon uses CSS-selector targeting to extract the exact element that changed: the price dropped from $49 to $39, the stock badge switched to 'Sold Out', the promotional banner updated. You see the value, not just a flag.",
  },
  {
    heading: 'No weekly digest for website changes.',
    body: 'Panoramata surfaces marketing channel data across email, ads, and SMS. There is no built-in weekly summary of competitor website changes delivered to Slack or email. Beaconmon ships that as the Intelligence Digest on Starter and above.',
  },
];

const BEACONMON_WINS = [
  {
    heading: '3x cheaper to start.',
    body: 'Beaconmon Starter is $29/mo. Panoramata starts at $89/mo. For teams that need competitor website monitoring, that gap is hard to justify.',
  },
  {
    heading: 'Free plan with no card required.',
    body: '10 monitors, 1 competitor, forever free. Panoramata has no free plan and no trial without a sales conversation.',
  },
  {
    heading: 'CSS-selector targeting.',
    body: 'Set a selector for the price element, the stock badge, or the promotional headline. Beaconmon returns the specific value that changed, not a page-level flag.',
  },
  {
    heading: 'Uptime, SSL, and domain expiry included.',
    body: 'Every Beaconmon plan includes uptime monitoring and SSL / domain expiry alerts at 30, 14, and 7 days. No separate subscription needed.',
  },
  {
    heading: 'Intelligence Digest.',
    body: 'A weekly Slack or email summary grouping every competitor website change into plain language. Available on Starter and above. Panoramata has no equivalent for website changes.',
  },
  {
    heading: 'Shopify-native preset selectors.',
    body: 'Preset CSS selectors for Shopify product price, stock status, and promotional badges ship out of the box. No selector research required for common Shopify themes.',
  },
];

const WHERE_PANORAMATA_WINS = [
  'Panoramata is purpose-built for monitoring competitor email campaigns, email flows, and ad creatives across Facebook, TikTok, and Google. Beaconmon does not do any of this.',
  'For marketing teams and agencies benchmarking across all digital channels, not just websites, Panoramata is the right tool. Beaconmon is website and uptime only.',
  'Panoramata maintains historical email and ad creative archives going back months or years. That long-run record is valuable for understanding competitor strategy over time.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Beaconmon track competitor emails or ads?',
    a: 'No. Beaconmon monitors competitor websites and your own store\'s uptime. Email campaign tracking, email flow monitoring, and ad creative tracking are outside Beaconmon\'s scope. Panoramata is the better fit for those use cases.',
  },
  {
    q: 'What does Beaconmon do that Panoramata does not?',
    a: 'Uptime monitoring, SSL expiry alerts, domain expiry alerts, CSS-selector targeting for exact price and stock values, and the Intelligence Digest: a weekly plain-language Slack or email summary of competitor website changes.',
  },
  {
    q: 'Is Panoramata a replacement for Beaconmon?',
    a: 'No. Panoramata and Beaconmon cover different problems. Panoramata covers marketing channel intelligence: email, ads, SMS. Beaconmon covers website change monitoring and uptime. Many ecommerce brands use both.',
  },
  {
    q: 'Can I use Beaconmon to cover the website monitoring part and skip Panoramata?',
    a: 'If your primary need is knowing when competitors change prices, run promotions, or update their websites, and knowing when your own store goes down, Beaconmon covers that from $29/mo. If you also need to track competitor email flows and ad creatives, Panoramata is still the right tool for those channels.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/panoramata',
      name: 'Cheaper Alternative to Panoramata for Ecommerce Brands (2026)',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Panoramata alternative', item: 'https://beaconmon.com/alternatives/panoramata' },
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

export default function PanoramataAlternativePage() {
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
            Panoramata alternative
          </span>
          <h1 className="text-[clamp(38px,5vw,64px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Cheaper alternative to Panoramata for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mx-auto mb-4">
            Panoramata starts at $89/mo and covers email, ad, and SMS intelligence. If you mainly need competitor website monitoring and uptime, Beaconmon covers that from $29/mo with a free plan included.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[72px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">Panoramata pricing</span>
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
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon pricing</span>
              <div className="space-y-3 text-[14px]">
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Starting price</span>
                  <span className="text-brand-dim font-medium">$29/mo (Starter)</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Free plan</span>
                  <span className="text-brand-green-ink font-medium">10 monitors, 1 competitor</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Uptime monitoring</span>
                  <span className="text-brand-green-ink font-medium">Included on all plans</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">SSL / domain expiry alerts</span>
                  <span className="text-brand-green-ink font-medium">Included on all plans</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Intelligence Digest</span>
                  <span className="text-brand-green-ink font-medium">Starter and above</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-brand-muted">Card required</span>
                  <span className="text-brand-green-ink font-medium">No, for free plan and trial</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-brand-muted text-[13px] text-center mt-5">
            Full pricing details at{' '}
            <Link href="/pricing" className="text-brand-green-ink hover:underline">beaconmon.com/pricing</Link>.
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(26px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Why Shopify stores look for a Panoramata alternative
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Panoramata is comprehensive. That is also the problem for stores that only need part of what it covers.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-3">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(26px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              What Beaconmon covers instead
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Purpose-built for Shopify stores that need competitor website monitoring and uptime in one tool.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {BEACONMON_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.15)] rounded-2xl p-7">
                <div className="mb-3">
                  <CheckIcon />
                </div>
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[13px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <div className="reveal text-center mt-8">
            <Link
              href="/shopify-competitor-monitoring"
              className="text-[14px] text-brand-green-ink hover:underline"
            >
              How Shopify competitor monitoring works in Beaconmon →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[820px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-[640px]:p-7">
            <h2 className="text-[clamp(22px,2.8vw,32px)] tracking-[-0.025em] font-extrabold mb-2">
              Where Panoramata still wins
            </h2>
            <p className="text-brand-dim text-[15px] mb-7">
              Beaconmon does not do everything. Here is where Panoramata is the better tool.
            </p>
            <ul className="space-y-5">
              {WHERE_PANORAMATA_WINS.map((item) => (
                <li key={item} className="flex gap-4 text-[14px] text-brand-dim leading-[1.65]">
                  <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-brand-bg border border-brand-line-soft flex items-center justify-center text-[11px] text-brand-muted font-bold">P</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-brand-muted text-[13px] mt-7">
              If you need email, ad, or SMS competitive intelligence, Panoramata is the right tool. Beaconmon is for Shopify stores that want website changes and uptime covered without the broader marketing intelligence suite.
            </p>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-3">{q}</h3>
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
            <Link href="/vs/panoramata" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Panoramata (full comparison)</Link>
            <Link href="/alternatives/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Visualping alternative</Link>
            <Link href="/alternatives/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Prisync alternative</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

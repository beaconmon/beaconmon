import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Panoramata for Ecommerce Brands (2026): Honest Comparison',
  description:
    'Panoramata vs Beaconmon: email/ads/SMS competitive intelligence vs website change monitoring, competitor price tracking, and uptime. Compare features and pricing for ecommerce teams.',
  alternates: { canonical: 'https://beaconmon.com/vs/panoramata' },
};

const TABLE_ROWS = [
  {
    feature: 'Competitor website/page change monitoring',
    beaconmon: '✓ CSS-selector precision',
    competitor: '✓ Landing page tracking',
    beaconmonGood: false,
  },
  {
    feature: 'Competitor email campaign tracking',
    beaconmon: 'No',
    competitor: '✓ Full email + flow tracking',
    beaconmonGood: false,
  },
  {
    feature: 'Competitor ad monitoring (Facebook/TikTok)',
    beaconmon: 'No',
    competitor: '✓ Multi-network ad tracking',
    beaconmonGood: false,
  },
  {
    feature: 'Competitor SMS tracking',
    beaconmon: 'No',
    competitor: '✓ SMS campaign monitoring',
    beaconmonGood: false,
  },
  {
    feature: 'Competitor price monitoring',
    beaconmon: '✓ CSS-selector targeting',
    competitor: 'Partial (landing page changes)',
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
    feature: 'Intelligence Digest (Slack/email)',
    beaconmon: '✓ Starter+',
    competitor: 'No dedicated digest',
    beaconmonGood: true,
  },
  {
    feature: 'AI change significance scoring',
    beaconmon: '✓ Growth+',
    competitor: 'AI benchmarking',
    beaconmonGood: false,
  },
  {
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: '$29/mo',
    competitor: '$89/mo',
    beaconmonGood: true,
  },
];

const STAY_REASONS = [
  {
    title: 'You need email and flow intelligence',
    body: "Panoramata's core strength is tracking competitor email sequences, welcome flows, and post-purchase automation. Beaconmon does not do this at all. If understanding a competitor's full email program is central to your strategy, Panoramata is purpose-built for it.",
  },
  {
    title: 'You need ad creative tracking',
    body: 'If you want to see competitor Facebook, TikTok, and Google ad creatives alongside their website changes, Panoramata covers this in one platform. Beaconmon has no ad monitoring capability.',
  },
  {
    title: 'You run an agency managing multiple brands',
    body: "Panoramata's Professional and Unlimited plans support multiple users and brands. If you are doing competitive analysis for clients, Panoramata's depth justifies the price for that use case.",
  },
];

const SWITCH_REASONS = [
  'Panoramata starts at $89/mo. For a Shopify store that wants to know when a competitor changes their price or runs a promotion on their site, that is 3x the cost of Beaconmon Starter for use cases Beaconmon covers directly.',
  'You need uptime monitoring alongside competitive monitoring. Panoramata has no uptime feature, so you would need a separate tool at additional cost.',
  'You want to monitor specific price elements, stock status, and promotional copy with CSS-selector precision. Panoramata tracks website changes at the page level, not the element level.',
  'You want a weekly Intelligence Digest summarizing competitor site changes in plain language, delivered to Slack or email.',
];

const FAQ_ITEMS = [
  {
    q: 'Does Panoramata monitor competitor website prices?',
    a: "Panoramata tracks landing page changes. It does not use CSS-selector targeting to extract specific price values. If you want to know that a competitor's price went from $49 to $39, Beaconmon gives you that. Panoramata will tell you the landing page changed.",
  },
  {
    q: 'Does Beaconmon track competitor emails or ads like Panoramata?',
    a: "No. Beaconmon monitors competitor websites and your own uptime. Email campaign tracking and ad creative monitoring are outside Beaconmon's scope. If those are important, Panoramata is purpose-built for them.",
  },
  {
    q: 'Can I use both Beaconmon and Panoramata together?',
    a: 'Yes, and many ecommerce brands do. Panoramata covers the marketing channel intelligence (emails, ads, SMS). Beaconmon covers website-level changes (prices, promotions, content) and uptime. They are complementary rather than competing.',
  },
  {
    q: 'Is Beaconmon cheaper than Panoramata?',
    a: 'Beaconmon Starter is $29/mo. Panoramata starts at $89/mo. For ecommerce stores that primarily need website change monitoring, competitor price tracking, and uptime, Beaconmon covers those needs at a lower price.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/panoramata',
      name: 'Beaconmon vs Panoramata (2026): Website Monitoring vs Marketing Intelligence',
      dateModified: '2026-06-30',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs Panoramata', item: 'https://beaconmon.com/vs/panoramata' },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Beaconmon',
      applicationCategory: 'BusinessApplication',
      description: 'Ecommerce website and competitor intelligence platform for Shopify and WooCommerce stores.',
      url: 'https://beaconmon.com',
      offers: {
        '@type': 'Offer',
        price: '29',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Panoramata',
      applicationCategory: 'BusinessApplication',
      description: 'Competitive intelligence platform covering competitor email campaigns, ad creatives, and SMS across Facebook, TikTok, and Google.',
      url: 'https://panoramata.com',
      offers: {
        '@type': 'Offer',
        price: '89',
        priceCurrency: 'USD',
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
    },
  ],
};

export default function VsPanoramataPage() {
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
            Beaconmon vs Panoramata<br />
            <span className="text-brand-green-ink">for ecommerce brands.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Panoramata is a marketing intelligence platform that tracks competitor emails, ads, and SMS campaigns. Beaconmon tracks competitor website changes with CSS-selector precision and monitors your store for downtime. They cover different problems. This page explains which one fits your situation.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: June 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              Panoramata and Beaconmon serve different jobs. Panoramata is for teams who need to see what competitors are sending to their email list and running in paid ads. Beaconmon is for Shopify store owners who want to know when a competitor changes their price, runs a site-wide promo, or goes down. If you need both, they run well side by side.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">Panoramata</th>
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
                When to stay on Panoramata
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Panoramata does things Beaconmon does not. Before switching, be clear about which signals matter to your team.
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
                Why ecommerce stores switch to Beaconmon
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Usually it comes down to price and scope: Panoramata is built for marketing teams who need ad and email intel. Beaconmon is built for store owners who need website-level changes and uptime.
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

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <blockquote className="reveal max-w-[700px] mx-auto border-l-2 border-brand-green-ink pl-8 py-2">
            <p className="text-[18px] leading-[1.7] text-brand-dim italic mb-4">
              &ldquo;Panoramata showed me what emails competitors were sending. Beaconmon told me when they dropped their prices. I use both, but Beaconmon costs $29 a month and catches the stuff that actually moves my revenue needle.&rdquo;
            </p>
            <cite className="text-[13px] text-brand-muted not-italic">Shopify store owner, UK, using both tools since early 2026</cite>
          </blockquote>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[820px] mx-auto">
            <div className="reveal mb-8">
              <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
                How to add Beaconmon alongside Panoramata
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most teams run them side by side. Panoramata handles email and ad signals. Beaconmon handles website changes and uptime. Setup takes under 30 minutes.
              </p>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Identify which Panoramata features you actively use. If you rely on email and ad tracking, keep Panoramata for those signals.' },
                { step: '2', text: 'For website change monitoring: add competitor URLs to Beaconmon with CSS-selector targeting for price, stock status, and promotional copy elements.' },
                { step: '3', text: 'Add your own store URL to Beaconmon uptime monitoring. This alone justifies the $29/mo for most Shopify stores.' },
                { step: '4', text: 'Connect Slack or email for the Intelligence Digest. You will get a weekly summary of every competitor site change, grouped by competitor.' },
                { step: '5', text: 'Beaconmon and Panoramata can run simultaneously. They cover different signal types and do not overlap in meaningful ways.' },
              ].map(({ step, text }) => (
                <li key={step} className="reveal flex items-start gap-4 text-[14px] text-brand-dim">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[rgba(0,229,122,0.12)] text-brand-green-ink text-[12px] font-bold flex items-center justify-center mt-0.5">{step}</span>
                  <span className="leading-[1.6] pt-1">{text}</span>
                </li>
              ))}
            </ol>
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
            <Link href="/vs/visualping" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Visualping</Link>
            <Link href="/vs/prisync" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Prisync</Link>
            <Link href="/alternatives/panoramata" className="text-brand-dim hover:text-brand-text transition-colors">Free alternatives to Panoramata</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

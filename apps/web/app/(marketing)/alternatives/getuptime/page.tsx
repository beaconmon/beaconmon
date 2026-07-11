import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import CheckIcon from '@/components/marketing/CheckIcon';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to getuptime.co for Shopify Store Monitoring (2026)',
  description:
    'getuptime.co starts at $29/mo with no free plan and no competitor tracking. Beaconmon covers uptime and competitor monitoring free to start.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/getuptime' },
  openGraph: { url: 'https://beaconmon.com/alternatives/getuptime' },
};

const TOOL_FACTS = [
  { label: 'Starting price', value: '$29/mo (Essentials, 2 apps monitored)' },
  { label: 'Free plan', value: 'None' },
  { label: 'Core feature', value: 'Automated UI testing and installed-app monitoring' },
  { label: 'Competitor price monitoring', value: 'No' },
  { label: 'Promotional copy and content monitoring', value: 'No' },
  { label: 'SSL / domain expiry alerts', value: 'Not listed' },
  { label: 'Weekly Competitor Report', value: 'No' },
  { label: 'Scripted checkout flow testing', value: 'Yes, a genuine advantage over Beaconmon' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'There is no free plan.',
    body: 'getuptime.co starts billing at $29/mo from day one. Beaconmon gives you 10 monitors and 1 competitor free, with no time limit and no card required, so you can see how it fits before paying anything.',
  },
  {
    heading: 'Competitors go unwatched.',
    body: 'getuptime.co has no competitor-tracking feature at any tier. It tells you when your own store breaks, not what a competitor changed. Beaconmon does both from the same subscription.',
  },
  {
    heading: 'Promotions and pricing moves are invisible.',
    body: 'If a competitor launches a flash sale or rewrites their homepage, getuptime.co will not surface it because it is not built to look outward. Beaconmon tracks price, promotional copy, and page content on any site you monitor.',
  },
  {
    heading: 'You pay the same price for less scope.',
    body: 'getuptime.co\'s $29/mo Essentials tier covers 2 apps. Beaconmon Starter is also $29/mo and includes competitor price tracking, content monitoring, and a Weekly Competitor Report on top of uptime.',
  },
];

const BEACONMON_WINS = [
  'Free plan: 10 monitors, 1 competitor, forever. No card needed.',
  'Uptime, SSL, and domain expiry alerts included in every plan.',
  'Competitor price and content monitoring at the same $29/mo Starter price.',
  'Weekly Competitor Report: a weekly Slack or email summary of every competitor change.',
  'Domain expiry alerts at 30, 14, and 7 days.',
  'No separate subscription needed to watch competitors alongside your own store.',
];

const WHERE_GETUPTIME_WINS = [
  {
    heading: 'Scripted UI and checkout testing.',
    body: 'getuptime.co is rated a perfect 5.0 across 31 reviews for running automated tests that click through your actual store, add to cart, and checkout. Beaconmon checks that pages respond and content is intact; it does not simulate a shopper\'s full journey.',
  },
  {
    heading: 'Installed Shopify app monitoring.',
    body: 'getuptime.co watches your installed apps directly and flags when one stops functioning. That is a specific, useful capability Beaconmon does not offer.',
  },
  {
    heading: 'Dedicated account support at scale.',
    body: 'getuptime.co\'s $299/mo Plus tier includes test markets and a dedicated account manager for larger operations. Beaconmon does not offer white-glove account management.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does getuptime.co track competitor prices like Beaconmon does?',
    a: 'No. getuptime.co has no competitor-tracking feature at any tier. It is focused entirely on your own store\'s uptime, checkout flow, and installed apps. Beaconmon covers uptime and competitor price, promo, and content monitoring in the same subscription.',
  },
  {
    q: 'Does Beaconmon run scripted checkout tests like getuptime.co?',
    a: 'No. Beaconmon checks that monitored pages respond and watches for content changes. getuptime.co scripts full UI tests through checkout, which is a deeper form of store testing. If that is what you need, getuptime.co is purpose-built for it.',
  },
  {
    q: 'Is Beaconmon a good replacement for getuptime.co if I want competitor tracking too?',
    a: 'Yes, if your priority is uptime plus competitor visibility in one tool. Beaconmon covers both from a free plan up through $29/mo Starter. If scripted checkout testing and app-level monitoring are your priority, getuptime.co goes deeper on that specific problem.',
  },
  {
    q: 'Can I run Beaconmon and getuptime.co together?',
    a: 'Yes. Some stores use getuptime.co for deep checkout testing and app monitoring, and Beaconmon for competitor intelligence plus general uptime and SSL alerts.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/getuptime',
      name: 'Free Alternative to getuptime.co for Shopify Store Monitoring (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'getuptime.co alternative', item: 'https://beaconmon.com/alternatives/getuptime' },
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

export default function GetUptimeAlternativePage() {
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
            Free alternative to getuptime.co
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Store uptime monitoring that also watches your competitors.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            getuptime.co is a strong Shopify uptime and testing tool with no free plan and no competitor tracking. Beaconmon covers uptime, SSL, and competitor price and content monitoring from free.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What getuptime.co costs</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">The pricing facts, without spin.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">getuptime.co</span>
              <div className="text-[36px] font-extrabold tracking-[-0.03em] mb-1">$29<span className="text-[18px] font-semibold text-brand-dim">/mo</span></div>
              <p className="text-brand-dim text-[14px] mb-6">No free plan. Pro at $99/mo adds unlimited apps and 3 UI tests. Plus at $299/mo adds test markets and a dedicated account manager.</p>
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
                  'No card required to start',
                  'Uptime, SSL, and domain expiry alerts',
                  'Competitor price and content monitoring',
                  'Weekly Competitor Report on Starter+',
                  'No app-level or scripted UI testing (getuptime.co goes deeper here)',
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
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Why Shopify stores look for a getuptime.co alternative</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">getuptime.co is built for store testing. It has nothing to say about competitors.</p>
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
              Built for stores that want uptime and competitor visibility in one subscription.
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
            Want to see how uptime monitoring works day to day?{' '}
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-brand-green-ink hover:underline">
              Read the ecommerce uptime monitoring guide →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Where getuptime.co still wins</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Be honest about this. If getuptime.co is the right fit, we will say so.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_GETUPTIME_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-center mt-8">
            <Link href="/vs/getuptime" className="text-brand-green-ink text-[14px] hover:underline">
              Read the full Beaconmon vs getuptime.co comparison →
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
            <Link href="/vs/getuptime" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs getuptime.co</Link>
            <Link href="/alternatives/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to UptimeRobot</Link>
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce uptime monitoring guide</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

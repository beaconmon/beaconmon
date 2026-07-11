import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Uptime (getuptime.co) for Shopify (2026)',
  description:
    'Uptime by getuptime.co tests your Shopify store and apps, no competitor tracking. Beaconmon adds competitor price and content monitoring at the same $29/mo.',
  alternates: { canonical: 'https://beaconmon.com/vs/getuptime' },
  openGraph: { url: 'https://beaconmon.com/vs/getuptime' },
};

const TABLE_ROWS = [
  {
    feature: 'Store uptime monitoring',
    beaconmon: '✓ Included',
    competitor: '✓ Core feature',
    beaconmonGood: false,
  },
  {
    feature: 'Automated UI / checkout flow testing',
    beaconmon: 'No',
    competitor: '✓ Scripted UI tests',
    beaconmonGood: false,
  },
  {
    feature: 'Installed Shopify app monitoring',
    beaconmon: 'No',
    competitor: '✓ Detects broken apps',
    beaconmonGood: false,
  },
  {
    feature: 'Competitor price monitoring',
    beaconmon: '✓ CSS-selector targeting',
    competitor: 'No',
    beaconmonGood: true,
  },
  {
    feature: 'Promotional copy and banner monitoring',
    beaconmon: '✓ Any content element',
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
    feature: 'Free plan',
    beaconmon: '10 monitors, 1 competitor',
    competitor: 'None',
    beaconmonGood: true,
  },
  {
    feature: 'Starting price',
    beaconmon: '$29/mo',
    competitor: '$29/mo (2 apps monitored)',
    beaconmonGood: false,
  },
];

const STAY_REASONS = [
  {
    title: 'You need scripted checkout testing, not just uptime pings.',
    body: 'getuptime.co runs automated UI tests that click through your actual checkout flow, catching things like a broken add-to-cart button or a payment step failure that a simple ping check would miss. Beaconmon checks that your store responds; it does not simulate a shopper\'s journey through it.',
  },
  {
    title: 'You rely on several installed Shopify apps and need to know when one breaks.',
    body: 'getuptime.co monitors your installed apps directly and flags when one stops working. Beaconmon does not have app-level monitoring.',
  },
  {
    title: 'You want a dedicated account manager as you scale.',
    body: 'getuptime.co\'s Plus tier at $299/mo includes test markets and a dedicated account manager. Beaconmon does not offer white-glove account management at any tier.',
  },
];

const SWITCH_REASONS = [
  'getuptime.co has no competitor tracking at any tier. If you want to know when a competitor changes prices, runs a promotion, or edits their homepage, you need a separate tool. Beaconmon bundles that into the same $29/mo Starter price.',
  'getuptime.co has no free plan. Beaconmon gives you 10 monitors and 1 competitor free, with no card required, before you decide to pay anything.',
  'You want a Weekly Competitor Report alongside your uptime alerts, not two separate subscriptions and two separate dashboards.',
  'SSL and domain expiry alerts are included in every Beaconmon plan. A missed SSL renewal breaks checkout just as badly as downtime does.',
];

const FAQ_ITEMS = [
  {
    q: 'What is the main difference between getuptime.co and Beaconmon?',
    a: 'getuptime.co is a Shopify-native uptime and QA testing tool: it monitors your store, runs scripted UI tests through your checkout flow, and flags when an installed app breaks. Beaconmon monitors your store\'s uptime too, but also tracks competitor prices, promotions, and page content, then delivers a Weekly Competitor Report. getuptime.co has no competitor-tracking feature at all.',
  },
  {
    q: 'Does Beaconmon run automated checkout tests like getuptime.co?',
    a: 'No. Beaconmon checks that your monitored pages respond and looks for content or price changes. getuptime.co scripts a full UI test through your checkout flow, which is a different and more thorough kind of testing. If that is what you need, getuptime.co is purpose-built for it.',
  },
  {
    q: 'Is Beaconmon cheaper than getuptime.co?',
    a: 'At the entry tier, both are $29/mo, but Beaconmon includes competitor price and content monitoring at that price and getuptime.co does not. Beaconmon also has a free plan; getuptime.co does not.',
  },
  {
    q: 'Can I use Beaconmon and getuptime.co together?',
    a: 'Yes. Some stores run getuptime.co for deep checkout-flow testing and app monitoring, and Beaconmon for competitor intelligence and general uptime alerts. They overlap on basic uptime but serve different depths of that problem.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/vs/getuptime',
      name: 'Beaconmon vs Uptime (getuptime.co) for Shopify (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://beaconmon.com/vs' },
        { '@type': 'ListItem', position: 3, name: 'Beaconmon vs getuptime.co', item: 'https://beaconmon.com/vs/getuptime' },
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

export default function VsGetUptimePage() {
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
            Beaconmon vs Uptime<br />
            <span className="text-brand-green-ink">(getuptime.co) for Shopify stores.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            getuptime.co, the Shopify App Store app called Uptime, Automated Store Tests, tests your store and installed apps so issues get caught before customers hit them. Beaconmon monitors uptime too, and adds competitor price, promo, and content tracking at the same starting price. Neither replaces the other completely.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-10 max-w-[820px]">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Summary verdict</span>
            <p className="text-[17px] leading-[1.65] text-brand-dim">
              getuptime.co is rated a perfect 5.0 across 31 reviews, and it earns that with scripted UI testing and app-level monitoring that goes deeper than a basic ping check. If your top concern is catching a broken checkout flow or a failing app before customers notice, it is a strong, focused choice. Beaconmon covers uptime at a more general level and adds the competitor side entirely: price changes, promotions, page edits. Stores that want both uptime and competitor visibility in one subscription get more out of Beaconmon at the same $29/mo entry price.
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
                  <th className="p-4 text-left text-[12px] uppercase tracking-[0.06em] text-brand-muted font-semibold border-b border-brand-line-soft">getuptime.co</th>
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
                When to stay on getuptime.co
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                getuptime.co tests your store in ways Beaconmon does not attempt. Here is where the depth matters.
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
                Why stores add Beaconmon instead
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Uptime is half the picture. What your competitors do while your store is fine matters too.
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
            <Link href="/vs/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
            <Link href="/vs/better-uptime" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Better Uptime</Link>
            <Link href="/alternatives/getuptime" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to getuptime.co</Link>
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce uptime monitoring guide</Link>
            <Link href="/vs" className="text-brand-dim hover:text-brand-text transition-colors">All comparisons</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

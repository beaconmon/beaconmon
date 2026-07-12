import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import CheckIcon from '@/components/marketing/CheckIcon';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to Lurk for Shopify Competitor Monitoring (2026)',
  description:
    'Lurk starts at $49/mo and focuses on auto-repricing across any website. Beaconmon covers price, promo, and uptime monitoring free to start, no card needed.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/lurk' },
  openGraph: { url: 'https://beaconmon.com/alternatives/lurk' },
};

const TOOL_FACTS = [
  { label: 'Starting price', value: '$49/mo (paid tier, after free plan)' },
  { label: 'Free plan', value: '5 SKUs' },
  { label: 'Core feature', value: 'Rule-based auto-repricing with "any website" competitor crawling' },
  { label: 'Content change monitoring', value: 'No, promotional copy and banners are not tracked' },
  { label: 'Uptime monitoring', value: 'No' },
  { label: 'SSL / domain expiry alerts', value: 'No' },
  { label: 'Weekly Competitor Report', value: 'No' },
  { label: 'Reviews', value: '8 reviews, 4.6 stars on the Shopify App Store' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'You do not want prices changing on their own.',
    body: 'Lurk is built around automated repricing rules. If you want to see a competitor move and decide your own response, the automation is a feature you will never turn on.',
  },
  {
    heading: 'Promotions and banners go untracked.',
    body: "Lurk watches prices. It has no mechanism for catching a competitor's new sale banner, rewritten product copy, or limited-time campaign. Beaconmon tracks the full page, not just a price field.",
  },
  {
    heading: 'Uptime monitoring is a separate subscription.',
    body: 'Lurk has no uptime monitoring at any tier. You would need a second tool just to know when your own store goes down.',
  },
  {
    heading: 'The free plan caps out fast.',
    body: "Lurk's free plan covers 5 SKUs. Beaconmon's free plan covers 10 monitors and 1 competitor with no time limit, and Starter at $29/mo undercuts Lurk's $49/mo entry paid tier for stores that just want monitoring.",
  },
];

const BEACONMON_WINS = [
  'Free plan: 10 monitors, 1 competitor, forever. No card needed.',
  "Starter at $29/mo, cheaper than Lurk's $49/mo paid entry point.",
  'Monitors promotional copy, sale banners, and content changes alongside price.',
  'Uptime monitoring and SSL expiry alerts included in every plan.',
  'Domain expiry alerts at 30, 14, and 7 days.',
  'Weekly Competitor Report: a weekly Slack or email summary of every competitor change.',
  'No repricing automation. You decide what to do with the information.',
];

const WHERE_LURK_WINS = [
  {
    heading: 'Rule-based auto-repricing.',
    body: 'Lurk is rated 4.6 stars from real merchants using it for repricing. If you want your Shopify prices to adjust automatically when a tracked competitor moves, Lurk does that and Beaconmon does not.',
  },
  {
    heading: '"Any website" price matching.',
    body: "Lurk's crawler is not limited to Shopify-to-Shopify comparisons. It can match and track prices against marketplaces and non-Shopify competitor sites with automated product matching, rather than the manual CSS selectors Beaconmon relies on for each monitored page.",
  },
  {
    heading: 'Purpose-built for repricing at small scale.',
    body: 'For stores that want hands-off price automation without configuring rules across a large catalog platform, Lurk\'s tiering (free at 5 SKUs, up to $199/mo) is scoped for smaller repricing use cases.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does Beaconmon auto-reprice my Shopify products like Lurk does?',
    a: 'No. Beaconmon monitors competitor pages and alerts you when something changes. Lurk automatically adjusts your product prices based on rules you configure. If you want automation, Lurk is the right tool.',
  },
  {
    q: 'Does Beaconmon match competitor products across any website like Lurk does?',
    a: "No. Beaconmon uses CSS-selector targeting you configure per monitored page. Lurk's automated matching across marketplaces and non-Shopify sites saves setup time if your competitors are not all on Shopify.",
  },
  {
    q: 'Is Beaconmon a good replacement for Lurk if I only want monitoring?',
    a: "Yes. If you want to know when a competitor changes their price, runs a promotion, or updates their website without any auto-repricing, Beaconmon covers that from free (or $29/mo for unlimited competitors). Lurk's paid tiers start at $49/mo and are priced around the repricing automation.",
  },
  {
    q: 'Can I run Beaconmon and Lurk together?',
    a: 'Yes. Use Beaconmon to monitor promotions, content changes, and your own store\'s uptime. Use Lurk for automated repricing on your core catalog. They cover different parts of the same workflow.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/lurk',
      name: 'Free Alternative to Lurk for Shopify Competitor Monitoring (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Lurk alternative', item: 'https://beaconmon.com/alternatives/lurk' },
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

export default function LurkAlternativePage() {
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
            Free alternative to Lurk
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Competitor monitoring for Shopify stores. Without the repricing engine.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            Lurk is a small, well-reviewed repricing tool. If you want alerts when competitors change prices, run promotions, or update their pages, without automation touching your own prices, Beaconmon covers that from free.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">What Lurk costs</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">The pricing facts, without spin.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">Lurk</span>
              <div className="text-[36px] font-extrabold tracking-[-0.03em] mb-1">$49<span className="text-[18px] font-semibold text-brand-dim">/mo</span></div>
              <p className="text-brand-dim text-[14px] mb-6">Free plan capped at 5 SKUs. $99 and $199/mo tiers add SKU volume and repricing rules.</p>
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
                  'Competitor content and price monitoring',
                  'Uptime, SSL, and domain expiry alerts',
                  'Weekly Competitor Report on Starter+',
                  'No auto-repricing (you stay in control)',
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
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Why Shopify stores look for a Lurk alternative</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Lurk is built for repricing. Not every store wants automated price changes.</p>
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
              Built for stores that want to watch competitors and stay online, not automate pricing decisions.
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
            Want to track competitor prices specifically?{' '}
            <Link href="/competitor-price-tracking" className="text-brand-green-ink hover:underline">
              See how competitor price tracking works in Beaconmon →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Where Lurk still wins</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Be honest about this. If Lurk is the right fit, we will say so.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_LURK_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-center mt-8">
            <Link href="/vs/lurk" className="text-brand-green-ink text-[14px] hover:underline">
              Read the full Beaconmon vs Lurk comparison →
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
            <Link href="/vs/lurk" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Lurk</Link>
            <Link href="/alternatives/pricefy" className="text-brand-dim hover:text-brand-text transition-colors">Free alternative to Pricefy</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

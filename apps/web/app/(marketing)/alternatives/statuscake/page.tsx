import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to StatusCake for Shopify Stores (2026)',
  description:
    'StatusCake covers basic uptime pings with no competitor or content monitoring. Beaconmon adds free competitor tracking for Shopify stores, plus uptime and SSL.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/statuscake' },
  openGraph: { url: 'https://beaconmon.com/alternatives/statuscake' },
};

const TOOL_FACTS = [
  { label: 'Free plan', value: '10 monitors, no time limit' },
  { label: 'Paid from', value: '$24.99/mo' },
  { label: 'Competitor monitoring', value: 'None' },
  { label: 'Content change monitoring', value: 'None' },
  { label: 'Check frequency (paid)', value: '1 minute' },
  { label: 'SSL + domain expiry', value: 'SSL only' },
  { label: 'Status pages (custom domain)', value: 'Included' },
  { label: 'Weekly Competitor Report', value: 'None' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'No competitor monitoring at all.',
    body: 'StatusCake checks whether a URL responds with a success status code. It has no way to track a competitor changing prices, product listings, or promotional copy. Beaconmon ships with a competitor monitor on the free plan.',
  },
  {
    heading: 'No content change detection.',
    body: 'StatusCake cannot parse HTML or detect changes in page content. If a competitor updates their pricing page overnight, StatusCake has no mechanism to notice. Beaconmon watches content changes on every plan.',
  },
  {
    heading: 'No Weekly Competitor Report.',
    body: 'There is no digest of competitor activity because there is no competitor monitoring to summarize. Beaconmon groups every detected change into a single Weekly Competitor Report on Starter and above.',
  },
  {
    heading: 'SSL expiry only, no domain expiry warnings.',
    body: 'StatusCake covers SSL certificate expiry but not domain expiry. Beaconmon includes both, so a forgotten domain renewal does not take your checkout down without warning.',
  },
  {
    heading: 'Slower check frequency on paid plans.',
    body: "StatusCake's paid plans check every minute. Beaconmon checks every 30 seconds, so you hear about downtime faster.",
  },
];

const BEACONMON_WINS = [
  { point: '10 monitors and 1 competitor monitor free, with no separate tool needed for competitor tracking' },
  { point: 'Content change monitoring included, catching price, stock, and promo copy changes' },
  { point: 'SSL and domain expiry alerts on every plan, StatusCake covers SSL only' },
  { point: '30 second check frequency on paid plans versus StatusCake\'s 1 minute' },
  { point: 'Weekly Competitor Report on Starter ($29/mo)' },
  { point: 'AI significance scoring on Growth, classifying changes as clearance push, margin test, and similar' },
];

const WHERE_STATUSCAKE_WINS = [
  {
    heading: 'Lower entry price for paid plans.',
    body: 'StatusCake paid plans start around $24.99/mo versus Beaconmon Starter at $29/mo. If all you need is uptime monitoring with no competitor or content tracking, StatusCake is the cheaper option.',
  },
  {
    heading: 'A mature, dedicated uptime tool.',
    body: 'StatusCake has been a standalone uptime monitoring product for years. If your only requirement is knowing when a site goes down, and you have no interest in competitor or content monitoring, it is a solid dedicated choice.',
  },
  {
    heading: 'Free plan with no time limit.',
    body: "StatusCake's free plan includes 10 monitors with no trial period or expiration. For basic uptime pings on internal tools, blogs, or non-ecommerce sites where competitor monitoring is irrelevant, that free tier stands on its own.",
  },
];

const FAQ_ITEMS = [
  {
    q: "How does Beaconmon's free plan compare to StatusCake's?",
    a: "StatusCake free gives you 10 monitors with no time limit. Beaconmon free also gives you 10 monitors, plus 1 competitor monitor with content change detection and uptime, SSL, and domain expiry alerts included.",
  },
  {
    q: 'Can StatusCake track competitor prices or content changes?',
    a: 'No. StatusCake checks whether a URL responds with a success status code. It cannot parse HTML, detect content changes, or alert on competitor activity. Beaconmon covers all of that alongside uptime monitoring.',
  },
  {
    q: 'Is StatusCake cheaper than Beaconmon?',
    a: 'StatusCake paid plans start at around $24.99/mo versus Beaconmon Starter at $29/mo. If you are comparing on uptime monitoring alone, StatusCake is slightly cheaper. If you count competitor monitoring, content change detection, and the Weekly Competitor Report, Beaconmon covers more in one tool for Shopify and WooCommerce stores.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/statuscake',
      name: 'Free Alternative to StatusCake for Shopify Stores (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'StatusCake alternative', item: 'https://beaconmon.com/alternatives/statuscake' },
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

export default function StatusCakeAlternativePage() {
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
            Free Alternative
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Free alternative to StatusCake for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            StatusCake checks whether your site is up. Beaconmon does that too, then adds competitor monitoring with Shopify presets and a Weekly Competitor Report. Free plan includes 10 monitors and 1 competitor.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">StatusCake</span>
              <p className="text-[28px] font-extrabold tracking-[-0.025em] mb-1">$24.99<span className="text-[16px] font-normal text-brand-dim">/mo</span></p>
              <p className="text-brand-dim text-[14px] mb-5">Free plan: 10 monitors, no time limit</p>
              <ul className="space-y-2">
                {TOOL_FACTS.map(({ label, value }) => (
                  <li key={label} className="flex gap-3 text-[13px] text-brand-dim">
                    <span className="text-brand-muted shrink-0 w-[140px]">{label}</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon</span>
              <p className="text-[28px] font-extrabold tracking-[-0.025em] mb-1">Free<span className="text-[16px] font-normal text-brand-dim"> forever</span></p>
              <p className="text-brand-dim text-[14px] mb-5">10 monitors, 1 competitor, uptime included</p>
              <ul className="space-y-2">
                {[
                  { label: 'Competitor monitoring', value: 'Included from the free plan' },
                  { label: 'Content change detection', value: 'Included on all plans' },
                  { label: 'SSL + domain alerts', value: 'Included on all plans' },
                  { label: 'Check frequency', value: '30 seconds on paid plans' },
                  { label: 'Weekly Competitor Report', value: 'Starter ($29/mo) and above' },
                  { label: 'Free trial', value: '14-day Growth trial, no card' },
                ].map(({ label, value }) => (
                  <li key={label} className="flex gap-3 text-[13px] text-brand-dim">
                    <span className="text-brand-muted shrink-0 w-[140px]">{label}</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Why Shopify stores look for StatusCake alternatives
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              StatusCake is a dedicated uptime monitoring tool. For Shopify stores that also want to watch competitors, the gaps show up fast.
            </p>
          </div>
          <div className="space-y-4">
            {REASONS_TO_SWITCH.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6 flex gap-5">
                <div className="mt-1 shrink-0">
                  <CheckIcon />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-1">{heading}</h3>
                  <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              What Beaconmon covers instead
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Built for Shopify store owners who want competitor monitoring and uptime in one tool.
            </p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-4">
            {BEACONMON_WINS.map(({ point }) => (
              <div
                key={point}
                className="flex items-start gap-3 bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.15)] rounded-xl p-5"
              >
                <CheckIcon />
                <p className="text-[14px] text-brand-dim leading-[1.55]">{point}</p>
              </div>
            ))}
          </div>
          <p className="reveal text-brand-muted text-[13px] text-center mt-6">
            Need the full feature breakdown?{' '}
            <Link href="/pricing" className="text-brand-green-ink hover:underline">
              See pricing
            </Link>{' '}
            or{' '}
            <Link href="/shopify-competitor-monitoring" className="text-brand-green-ink hover:underline">
              learn about competitor monitoring for Shopify stores.
            </Link>
          </p>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Where StatusCake still wins
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Beaconmon is not the right tool for every use case. Here is where StatusCake has a genuine edge.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_STATUSCAKE_WINS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-2 text-brand-text">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Common questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/vs/statuscake" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs StatusCake</Link>
            <Link href="/alternatives/betterstack" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Better Stack</Link>
            <Link href="/alternatives/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs UptimeRobot</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
            <Link href="/shopify-competitor-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Shopify competitor monitoring</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

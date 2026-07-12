import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Alternative to Pingdom for Shopify Stores (2026)',
  description:
    'Pingdom has no free plan, starting at $15/mo after a 30-day trial. Beaconmon is free forever with competitor monitoring, uptime, and a Weekly Competitor Report.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/pingdom' },
  openGraph: { url: 'https://beaconmon.com/alternatives/pingdom' },
};

const TOOL_FACTS = [
  { label: 'Free plan', value: 'None, 30-day trial only' },
  { label: 'Paid from', value: '$15/mo' },
  { label: 'Real User Monitoring', value: 'Yes' },
  { label: 'Transaction monitoring', value: 'Yes, scripted checkout flows' },
  { label: 'Check locations', value: '70+ worldwide' },
  { label: 'SSL + domain expiry', value: 'SSL only' },
  { label: 'Status pages', value: 'Paid add-on' },
  { label: 'Competitor monitoring', value: 'None' },
];

const REASONS_TO_SWITCH = [
  {
    heading: 'No free plan at all.',
    body: 'Pingdom offers a 30-day trial, then billing starts at $15/mo with no permanent free tier. Beaconmon gives you 10 monitors free forever, with no credit card and no time limit.',
  },
  {
    heading: 'No competitor tracking.',
    body: 'Pingdom checks uptime and load time only. It cannot detect a competitor price change, a new promo banner, or a product listing update. Beaconmon checks those on every monitoring cycle.',
  },
  {
    heading: 'Domain expiry is not covered.',
    body: 'Pingdom monitors SSL certificate expiry but not domain expiry. Beaconmon alerts you at 30, 14, and 7 days before either one lapses.',
  },
  {
    heading: 'Status pages cost extra.',
    body: 'A public status page is a paid add-on in Pingdom. In Beaconmon it is included from the free plan, with custom domain support on paid tiers.',
  },
  {
    heading: 'No weekly digest of what changed.',
    body: 'Pingdom sends individual alerts per incident. The Weekly Competitor Report groups every change detected across your monitored sites into a single plain-language summary, sent to email or Slack.',
  },
];

const BEACONMON_WINS = [
  { point: '10 monitors free forever, no card required, vs Pingdom\'s 30-day trial only' },
  { point: 'Competitor monitoring included, tracking price, stock, and promo changes' },
  { point: 'Content change monitoring on every plan' },
  { point: 'SSL and domain expiry alerts included, not split across add-ons' },
  { point: 'Status pages included from the free plan, custom domain on paid tiers' },
  { point: 'Weekly Competitor Report on Starter ($29/mo) and above' },
];

const WHERE_PINGDOM_WINS = [
  {
    heading: 'Real User Monitoring.',
    body: 'Pingdom collects performance data from actual visitor browsers, not synthetic checks. If you have 100,000 or more monthly visitors and want real-world load times by geography, this is data Beaconmon does not collect.',
  },
  {
    heading: 'Scripted transaction monitoring.',
    body: 'Pingdom can script a multi-step browser flow across add-to-cart, checkout, and payment pages. Beaconmon does not offer scripted transaction monitoring.',
  },
  {
    heading: '70-plus check locations.',
    body: 'Pingdom checks from over 70 locations worldwide. Beaconmon covers 5 regions. For stores with customers spread across many continents at once, that geographic breadth is a real advantage.',
  },
  {
    heading: 'Enterprise SLA reporting.',
    body: 'Pingdom generates exportable uptime SLA reports with audit trails. If a contract requires formal uptime documentation, Pingdom has that built in and Beaconmon does not.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does Pingdom have a free plan?',
    a: 'No. Pingdom offers a 30-day trial and then billing starts at $15/mo for Synthetic Monitoring, with no permanent free tier. Beaconmon has a free plan with 10 monitors and no credit card required.',
  },
  {
    q: 'Can Pingdom track competitor prices or content changes?',
    a: 'No. Pingdom checks availability and load time. It does not parse page content, detect changes, or alert on competitor activity. Beaconmon monitors competitor price, stock, and promo changes as a core feature.',
  },
  {
    q: 'When does Pingdom make more sense than Beaconmon?',
    a: 'Pingdom is the stronger choice when a team needs Real User Monitoring from actual visitor traffic, scripted transaction monitoring across checkout flows, or check coverage from 70-plus global locations. For a high-traffic SaaS product with enterprise SLA reporting requirements, Pingdom has more mature tooling in those areas.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/pingdom',
      name: 'Free Alternative to Pingdom for Shopify Stores (2026)',
      dateModified: '2026-07-11',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Pingdom alternative', item: 'https://beaconmon.com/alternatives/pingdom' },
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

export default function PingdomAlternativePage() {
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
            Free alternative to Pingdom for Shopify stores.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mx-auto mb-4">
            Pingdom has no free plan, only a 30-day trial before billing starts at $15/mo. Beaconmon is free forever, with competitor monitoring, uptime, SSL and domain expiry alerts, and a Weekly Competitor Report built in.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">Pingdom</span>
              <p className="text-[28px] font-extrabold tracking-[-0.025em] mb-1">$15<span className="text-[16px] font-normal text-brand-dim">/mo</span></p>
              <p className="text-brand-dim text-[14px] mb-5">No free plan, 30-day trial only</p>
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
                  { label: 'Uptime monitoring', value: 'Included on all plans' },
                  { label: 'SSL + domain alerts', value: 'Both included on all plans' },
                  { label: 'Status pages', value: 'Included, custom domain on paid tiers' },
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
              Why Shopify stores look for Pingdom alternatives
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Pingdom is built for enterprise DevOps teams. For a Shopify store owner, the gaps and the lack of a free plan add up quickly.
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
              Built for Shopify store owners who want competitor monitoring and uptime in one tool, free to start.
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
              Where Pingdom still wins
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              Beaconmon is not the right tool for every use case. Here is where Pingdom has a genuine edge.
            </p>
          </div>
          <div className="space-y-4">
            {WHERE_PINGDOM_WINS.map(({ heading, body }) => (
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
            <Link href="/vs/pingdom" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Pingdom</Link>
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

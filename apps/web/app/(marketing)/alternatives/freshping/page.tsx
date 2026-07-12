import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freshping Shut Down: Where to Migrate Your Monitors (2026)',
  description:
    'Freshping was discontinued on March 6, 2026. Here is what its free plan offered, what to do this week, and how to move your monitors to Beaconmon for free.',
  alternates: { canonical: 'https://beaconmon.com/alternatives/freshping' },
  openGraph: { url: 'https://beaconmon.com/alternatives/freshping' },
};

const FRESHPING_FACTS = [
  { label: 'Monitors', value: '50 on the free plan' },
  { label: 'Check frequency', value: '1 minute' },
  { label: 'Global check locations', value: '10' },
  { label: 'Public status pages', value: '5' },
  { label: 'Focus', value: 'General-purpose uptime monitoring, not ecommerce-specific' },
  { label: 'Status as of March 6, 2026', value: 'Discontinued, free accounts disabled, data being deleted' },
];

const MIGRATION_STEPS = [
  {
    heading: '1. Write down what you were monitoring.',
    body: 'Freshping\'s dashboard is gone and account data is being deleted as part of the shutdown, so there is nothing left to export. Pull URLs from browser history, old alert emails, status page links, or your team\'s docs.',
  },
  {
    heading: '2. Create a free Beaconmon account.',
    body: 'No card required. You get 10 monitors free forever, which covers most solo stores and small teams. If you were using more than 10 of Freshping\'s 50 free monitors, prioritize the sites that actually mattered.',
  },
  {
    heading: '3. Re-add your monitors and set check frequency.',
    body: 'Add each URL as a monitor and choose how often it checks. Freshping\'s free plan checked every minute; Beaconmon\'s frequency depends on plan tier, so pick the interval that fits how fast you need to know about downtime.',
  },
  {
    heading: '4. Reconnect your alert channels.',
    body: 'Point alerts at Slack, email, or a webhook. Nothing carries over automatically from Freshping, so this needs to be set up fresh, same as the monitors themselves.',
  },
  {
    heading: '5. If you run an ecommerce store, add competitor monitoring too.',
    body: 'Freshping never had this. Beaconmon can track a competitor\'s pricing and promo pages alongside your own uptime, so this is a natural moment to add it rather than sourcing yet another tool.',
  },
];

const BEACONMON_FREE = [
  { label: 'Monitors', value: '10, free forever' },
  { label: 'Check frequency', value: 'Included on every plan, no card required to start' },
  { label: 'SSL + domain expiry alerts', value: 'Included on the free plan' },
  { label: 'Competitor monitoring', value: '1 competitor free, more on paid plans' },
  { label: 'Shopify and WooCommerce presets', value: 'Yes, price, stock, and promo copy' },
  { label: 'Weekly Competitor Report', value: 'Starter ($29/mo) and above' },
];

const FAQ_ITEMS = [
  {
    q: 'Why did Freshping shut down?',
    a: 'Freshworks discontinued Freshping as part of a broader simplification of its product portfolio. That is the extent of what has been confirmed publicly. Beaconmon has no additional insight into Freshworks\' internal reasoning, so we are not going to speculate beyond that.',
  },
  {
    q: 'Is there a way to export my Freshping data?',
    a: 'Freshworks\' shutdown announcement states that free account data is being deleted, and free accounts have already been disabled as of March 6, 2026. We do not know Freshworks\' exact deletion timeline beyond what has been publicly stated, so if you still have any access, act quickly. If access is already gone, the fastest path forward is rebuilding your monitor list from memory, browser history, or old alert emails and setting it up fresh in a new tool.',
  },
  {
    q: 'Does Beaconmon have a free plan like Freshping did?',
    a: 'Yes. Beaconmon\'s free plan includes 10 monitors forever, with no card required. It also includes SSL monitoring, domain expiry alerts, and 1 free competitor monitor, none of which Freshping\'s free plan offered.',
  },
  {
    q: "I had more than 10 monitors on Freshping's free plan. What now?",
    a: "Freshping's free plan allowed up to 50 monitors. Beaconmon's free plan covers 10. If you need more than that, paid plans raise the limit; in the meantime, prioritize the sites where downtime actually costs you money or customers, and add the rest once you have re-set up the essentials.",
  },
  {
    q: 'Is Beaconmon a general-purpose uptime tool like Freshping was?',
    a: 'Beaconmon covers uptime, SSL, and domain expiry monitoring the same way Freshping did, so it works fine as a general replacement. Where it differs is the added focus on ecommerce: Shopify and WooCommerce preset selectors and competitor price and promo tracking, which Freshping never offered.',
  },
];

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      url: 'https://beaconmon.com/alternatives/freshping',
      name: 'Freshping Shut Down: Where to Migrate Your Monitors (2026)',
      dateModified: '2026-07-12',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://beaconmon.com' },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://beaconmon.com/alternatives' },
        { '@type': 'ListItem', position: 3, name: 'Freshping alternative', item: 'https://beaconmon.com/alternatives/freshping' },
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

export default function FreshpingAlternativePage() {
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
          <Link href="/alternatives" className="inline-flex items-center gap-2 text-[13px] text-brand-muted hover:text-brand-dim transition-colors mb-6">
            <span>←</span> All alternatives
          </Link>
          <span className="block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Freshping is shut down</span>
          <h1 className="text-[clamp(34px,4.5vw,58px)] leading-[1.08] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px]">
            Freshping shut down on March 6, 2026.<br />
            <span className="text-brand-green-ink">Here is where to go.</span>
          </h1>
          <p className="text-[17px] leading-[1.6] text-brand-dim max-w-[620px] mb-4">
            Freshworks discontinued Freshping as part of a portfolio simplification. Free accounts have been disabled and account data is being deleted. If you had monitors running there, they are not checking anything anymore, and your setup will not come back. This page covers what Freshping offered, what to do this week, and how to move to Beaconmon for free.
          </p>
          <p className="text-brand-muted text-[13px]">Last updated: July 2026</p>
        </div>
      </section>

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">
              What you are replacing: Freshping&apos;s free plan
            </span>
            <p className="text-brand-dim text-[14px] leading-[1.6] mb-5">
              Freshping was a general-purpose uptime tool, not built for ecommerce. Before shutdown, its free plan offered:
            </p>
            <ul className="space-y-2">
              {FRESHPING_FACTS.map(({ label, value }) => (
                <li key={label} className="flex gap-3 text-[13px] text-brand-dim">
                  <span className="text-brand-muted shrink-0 w-[190px]">{label}</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              What to do this week
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[560px] mx-auto">
              There is no live Freshping dashboard to export from anymore, so the move is a rebuild, not a migration. Here is the fastest path.
            </p>
          </div>
          <div className="space-y-4">
            {MIGRATION_STEPS.map(({ heading, body }) => (
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

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
              Free plan, then vs now
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">
              What Freshping&apos;s free tier used to include, next to what Beaconmon&apos;s free plan includes today.
            </p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-6">
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-3 block">Freshping (discontinued)</span>
              <p className="text-[28px] font-extrabold tracking-[-0.025em] mb-1">Free<span className="text-[16px] font-normal text-brand-dim"> plan, no longer available</span></p>
              <p className="text-brand-dim text-[14px] mb-5">50 monitors, 1-minute checks, 10 locations, 5 status pages</p>
              <p className="text-brand-muted text-[13px]">Shut down March 6, 2026. Account data being deleted.</p>
            </div>
            <div className="bg-[rgba(0,229,122,0.04)] border border-[rgba(0,229,122,0.2)] rounded-2xl p-8">
              <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-green-ink mb-3 block">Beaconmon</span>
              <p className="text-[28px] font-extrabold tracking-[-0.025em] mb-1">Free<span className="text-[16px] font-normal text-brand-dim"> forever</span></p>
              <p className="text-brand-dim text-[14px] mb-5">10 monitors, 1 competitor, uptime included, no card required</p>
              <ul className="space-y-2">
                {BEACONMON_FREE.map(({ label, value }) => (
                  <li key={label} className="flex gap-3 text-[13px] text-brand-dim">
                    <span className="text-brand-muted shrink-0 w-[150px]">{label}</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="reveal text-brand-muted text-[13px] text-center mt-6">
            Need more than 10 monitors?{' '}
            <Link href="/pricing" className="text-brand-green-ink hover:underline">
              See paid plan limits
            </Link>{' '}
            or{' '}
            <Link href="/shopify-competitor-monitoring" className="text-brand-green-ink hover:underline">
              learn about competitor monitoring for Shopify stores.
            </Link>
          </p>
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
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">Rebuild your monitoring in minutes.</h2>
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
            <Link href="/alternatives/uptimerobot" className="text-brand-dim hover:text-brand-text transition-colors">Alternative to UptimeRobot</Link>
            <Link href="/alternatives/betterstack" className="text-brand-dim hover:text-brand-text transition-colors">Alternative to BetterStack</Link>
            <Link href="/alternatives" className="text-brand-dim hover:text-brand-text transition-colors">All alternatives</Link>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

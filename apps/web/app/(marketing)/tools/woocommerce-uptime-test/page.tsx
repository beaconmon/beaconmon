import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import UptimeTester from '@/components/tools/UptimeTester';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free WooCommerce Uptime Checker | Beaconmon',
  description:
    'Instant uptime check for any WooCommerce store. See response time, SSL status, redirect health, and whether the store is live right now. Free, no signup.',
  alternates: { canonical: 'https://beaconmon.com/tools/woocommerce-uptime-test' },
  openGraph: { url: 'https://beaconmon.com/tools/woocommerce-uptime-test' },
};

const WHAT_IT_CHECKS = [
  {
    title: 'Response time',
    body: 'How fast your store responds to a request. WooCommerce on shared hosting often sits well above 800ms under normal load.',
  },
  {
    title: 'SSL certificate',
    body: 'Whether your SSL cert is valid and how many days before it expires.',
  },
  {
    title: 'Redirect chain',
    body: 'Whether your store has redirect loops or unusual hop counts that slow down loading.',
  },
];

const ONE_TEST = [
  'Checks right now, one result',
  'You have to remember to come back and check again',
  'No alert when the store goes down at 2am',
  'No history of past incidents',
];

const CONTINUOUS = [
  'Checks every minute, 24/7',
  'Alerts you within 2 minutes of any problem',
  'Works while you sleep, no one needs to watch',
  'Incident history and uptime reports',
];

const FAQS = [
  {
    q: 'How do I check if my WooCommerce store is down?',
    a: 'Paste your store URL into the tool above and it runs an instant check from our servers, returning a result in under 10 seconds. You see whether the store is responding, its HTTP status code, the response time in milliseconds, and whether the SSL certificate is valid, so you can tell at a glance if the store is live.',
  },
  {
    q: 'Why is my WooCommerce site slow?',
    a: 'WooCommerce runs on WordPress, so slowness usually traces to shared hosting, an overloaded database, too many active plugins, or an unoptimized theme. Stores running 30 or more plugins frequently see response times climb past 2,000ms. The test above shows your real response time so you know whether speed, not just uptime, is the problem.',
  },
  {
    q: 'Does WooCommerce have uptime monitoring?',
    a: 'WooCommerce and WordPress do not include uptime monitoring out of the box. You either rely on a hosting provider status page or add a dedicated monitor. Beaconmon checks your store every minute from outside your server and alerts you within about 2 minutes of an outage, which a server-side plugin cannot do when the whole server is down.',
  },
  {
    q: 'How often do WooCommerce stores go down?',
    a: 'Because WooCommerce stores run on your own hosting rather than a managed platform, individual outages are more common than on hosted platforms. Plugin conflicts, PHP errors, and hosting resource limits are the usual causes. Without monitoring, the undetected window averages 4 or more hours, since most owners only find out when a customer complains.',
  },
  {
    q: 'What is a good response time for a WooCommerce store?',
    a: 'Under 800ms is good for a WooCommerce store and 800 to 1,500ms is acceptable but worth improving. Above 1,500ms is a risk, especially during a sale, because response times that are fine under normal load often become timeouts under concurrent traffic. Caching and a trimmed plugin list are the fastest ways to bring it down.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WooCommerce Uptime Tester',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/woocommerce-uptime-test',
  dateModified: '2026-06-29',
  description:
    'Free instant uptime test for any WooCommerce store. Check response time, SSL certificate status, and redirect chain health with no install required.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

export default function WooCommerceUptimeTestPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Tools', path: '/tools' },
          { name: 'WooCommerce Uptime Tester', path: '/tools/woocommerce-uptime-test' }
        )}
      />
      <NavBar />

      {/* Hero */}
      <section className="relative pt-[88px] pb-[72px] max-[640px]:pt-16 max-[640px]:pb-12 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            right: '-8%',
            width: 680,
            height: 680,
            background: 'radial-gradient(circle, rgba(0,229,122,0.13), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Free tool
          </span>
          <h1 className="text-[clamp(38px,5vw,64px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5 max-w-[860px] [overflow-wrap:anywhere]">
            Check if any WooCommerce store is up right now
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-6">
            Instant uptime test from our servers. Check response time, SSL status, and redirect health in seconds. No plugin install, no signup.
          </p>
          <div className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-5 py-4 mb-8 max-w-[620px]">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              <span className="text-brand-text font-medium">The WooCommerce Uptime Tester checks whether any WooCommerce store is responding right now and returns its HTTP status, response time, SSL validity, and redirect health in under 10 seconds.</span>{' '}
              WooCommerce runs on your own hosting, so checking from outside your server is the only way to catch a full outage.
            </p>
          </div>
          <UptimeTester />
        </div>
      </section>

      {/* What the test checks */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[640px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              What the test checks
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              Three signals that tell you not just whether your store is reachable, but how healthy it is.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-5">
            {WHAT_IT_CHECKS.map((item) => (
              <div key={item.title} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{item.title}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One test vs. continuous monitoring */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[720px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              One test vs. continuous monitoring
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              A manual test tells you if the store is up right now. It cannot tell you when it went down at 2am.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-5">
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-5">
                This free test
              </h3>
              <ul className="space-y-3">
                {ONE_TEST.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-brand-text leading-[1.5]">
                    <span className="shrink-0 mt-[2px] text-brand-muted">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.3" />
                        <path d="M5 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal bg-brand-bg1 border border-brand-green-border-25 rounded-2xl p-8 relative overflow-hidden">
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{ top: '-40%', right: '-20%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(0,229,122,0.10), transparent 60%)', filter: 'blur(30px)' }}
              />
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-green-ink mb-5 relative">
                Beaconmon monitoring
              </h3>
              <ul className="space-y-3 relative">
                {CONTINUOUS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-brand-text leading-[1.5]">
                    <span className="shrink-0 mt-[2px]">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">
              Frequently asked questions
            </h2>
          </div>
          <div className="reveal max-w-[760px] mx-auto space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/ecommerce-website-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce website monitoring</Link>
            <Link href="/tools/monitoring-coverage" className="text-brand-dim hover:text-brand-text transition-colors">Store monitoring coverage auditor</Link>
            <Link href="/tools/downtime-detection-calculator" className="text-brand-dim hover:text-brand-text transition-colors">Downtime detection calculator</Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
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
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">
            Stop checking manually.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Beaconmon watches your WooCommerce store every minute and alerts you the moment something breaks. Free forever for 10 monitors, no card required.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

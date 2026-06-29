import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import BfcmReadiness from '@/components/tools/BfcmReadiness';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peak Sale Readiness Checker: BFCM, Prime Day, Flash Sales | Beaconmon',
  description:
    'Free technical readiness check for any peak sale event. Score your store on uptime, SSL, speed, redirects, and monitoring coverage before BFCM, Prime Day, Valentine\'s, or any flash sale.',
  alternates: { canonical: 'https://beaconmon.com/tools/bfcm-readiness' },
};

const WHAT_IT_CHECKS = [
  {
    title: 'Uptime',
    body: 'Is your store responding right now? A store that is slow under normal load is a store that goes down under BFCM traffic.',
  },
  {
    title: 'SSL certificate',
    body: 'Is your SSL cert valid and not expiring before BFCM? An expired cert means customers see a security warning instead of your store.',
  },
  {
    title: 'Response speed',
    body: 'Is your response time fast enough to handle a traffic spike? Above 1,500ms under normal load is a risk on Black Friday.',
  },
  {
    title: 'Redirects',
    body: 'Is your redirect chain clean and free of loops? Redirect chains add latency and confuse search engines.',
  },
  {
    title: 'Monitoring',
    body: 'Will you know within minutes if your store goes down on Black Friday? Without monitoring, customers tell you before you know.',
  },
];

const STATS = [
  {
    stat: '34%',
    label: 'of ecommerce outages happen during peak events',
    detail: 'Black Friday and Cyber Monday put more traffic through your store in hours than a typical week.',
  },
  {
    stat: '2 min',
    label: 'average time to first alert with Beaconmon',
    detail: 'Checks run every minute. You get an alert before most customers notice a problem.',
  },
  {
    stat: '$5,600',
    label: 'average cost per minute of downtime for mid-size stores',
    detail: 'For stores doing real volume on BFCM, every minute of downtime is direct revenue loss.',
  },
];

const FAQS = [
  {
    q: 'How do I check if my Shopify store is ready for a peak sale event?',
    a: 'Use the free checker above. It tests your store\'s response time against the Shopify median of 380ms, your SSL certificate, your redirect health, and asks whether you have uptime monitoring in place. Each check is scored and you get a total readiness score from 0 to 100, so you know exactly what to fix before BFCM, Prime Day, or any flash sale.',
  },
  {
    q: 'Is this only for Black Friday?',
    a: 'No. The same technical risks apply to every high-traffic event: Prime Day, Valentine\'s Day, a product launch, an influencer feature, or a one-day flash sale. Around 34% of ecommerce outages happen during peak events, so it is worth running this check before any traffic spike, not just once a year in November.',
  },
  {
    q: 'When should I run a store readiness check?',
    a: 'Run it at least 1 to 2 weeks before any peak sale event, which leaves time to renew an SSL certificate, fix a slow page, or set up monitoring before traffic arrives. Re-run it the day before the event as a final confirmation, and any time you install a new app or change your theme.',
  },
  {
    q: 'What should I test on my Shopify store before a sale?',
    a: 'At a minimum: confirm your store loads in under 2 seconds, your SSL cert is not expiring within 30 days, your redirects are clean with no loops, and you have monitoring set up so you know within about 2 minutes if the store goes down during peak traffic instead of hearing it from a customer.',
  },
  {
    q: 'What do I do if my store fails the readiness check?',
    a: 'Fix the lowest-scoring items first. A slow response time usually means trimming apps or heavy theme scripts; an expiring SSL cert needs renewal within 30 days; redirect loops need cleaning up in your URL settings. Then set up monitoring so the one risk you cannot test in advance, an outage during the event, is covered within 2 minutes.',
  },
  {
    q: 'How do Shopify stores handle peak traffic?',
    a: 'Shopify\'s infrastructure is designed for high traffic and rarely fails platform-wide. Individual store outages during peak events are typically caused by third-party app failures, theme errors after recent edits, or DNS problems, not Shopify itself, and roughly 60% of these localized failures trace back to an app or theme conflict.',
  },
  {
    q: 'What is a good response time for a Shopify store?',
    a: 'Under 800ms is good and 800 to 1,500ms is acceptable but worth improving before a traffic spike. Above 1,500ms is a real risk: response times that are fine under normal load often become timeouts under peak-event concurrent requests, well above the Shopify median of 380ms.',
  },
  {
    q: 'How do I get alerted if my Shopify store goes down during a sale?',
    a: 'Set up uptime monitoring before the event. Beaconmon checks every minute and sends an alert via email or Slack within about 2 minutes of any outage. The free tier covers 10 monitors at no cost, enough to watch your homepage, cart, checkout, and key product pages through the entire sale.',
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
  name: 'Peak Sale Readiness Checker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/bfcm-readiness',
  dateModified: '2026-06-29',
  description:
    'Free technical readiness check for any peak sale event. Score your Shopify store on uptime, SSL certificate, response speed, redirects, and monitoring coverage before BFCM, Prime Day, or any flash sale.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

export default function BfcmReadinessPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Tools', path: '/tools' },
          { name: 'Peak Sale Readiness Checker', path: '/tools/bfcm-readiness' }
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
            Is your Shopify store ready for your next peak sale event?
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-6">
            Run a free technical check on your store's uptime, SSL, speed, and redirect health before your next peak sale
            event (BFCM, Prime Day, flash sales). No app install, no signup.
          </p>
          <div className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-5 py-4 mb-8 max-w-[620px]">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              <span className="text-brand-text font-medium">The Peak Sale Readiness Checker scores your Shopify store on uptime, SSL, response speed, redirects, and monitoring coverage before any high-traffic event.</span>{' '}
              Around 34% of ecommerce outages happen during peak events, when a slow store becomes a down store.
            </p>
          </div>
          <BfcmReadiness />
        </div>
      </section>

      {/* What the check covers */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[640px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              What the check covers
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              Five signals that tell you whether your store can handle the demands of peak traffic season.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-5">
            {WHAT_IT_CHECKS.map((item) => (
              <div key={item.title} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{item.title}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why this matters for BFCM */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[640px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              Why this matters for BFCM
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              Black Friday is not the time to find out your store has a problem.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-5">
            {STATS.map((s) => (
              <div key={s.stat} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <div className="text-[clamp(36px,4vw,52px)] font-extrabold tracking-[-0.03em] text-brand-green-ink mb-2 leading-none">
                  {s.stat}
                </div>
                <div className="text-[15px] font-semibold mb-2 leading-[1.3]">{s.label}</div>
                <p className="text-brand-dim text-[13px] leading-[1.6]">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* One test vs. continuous */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[720px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              A one-time check vs. watching all day
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              This tool tells you your store is healthy right now. It cannot tell you what happens at 3am on Black Friday when you are asleep.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-5">
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-5">This free check</h3>
              <ul className="space-y-3">
                {[
                  'Snapshot of your store right now',
                  'You have to come back and run it again',
                  'No alert when the store goes down',
                  'No incident history',
                ].map((item) => (
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
                {[
                  'Checks every minute, 24/7 through BFCM',
                  'Alerts you within 2 minutes of any outage',
                  'Watches while you sleep or handle orders',
                  'Full incident history and uptime reports',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-brand-text leading-[1.5]">
                    <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
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
            <Link href="/ecommerce-uptime-monitoring-guide" className="text-brand-dim hover:text-brand-text transition-colors">
              Ecommerce uptime monitoring guide
            </Link>
            <Link href="/tools/shopify-uptime-test" className="text-brand-dim hover:text-brand-text transition-colors">
              Shopify Uptime Tester
            </Link>
            <Link href="/tools/downtime-detection-calculator" className="text-brand-dim hover:text-brand-text transition-colors">
              Downtime detection calculator
            </Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
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
            BFCM is not the time to find out your store went down.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Set up monitoring before the rush. Beaconmon watches your store every minute and alerts you within 2 minutes of any outage. Free forever for 10 monitors.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

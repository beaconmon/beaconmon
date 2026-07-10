import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import DetectionCalculator from '@/components/tools/DetectionCalculator';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Downtime Detection Speed Calculator | Beaconmon',
  description:
    'Free calculator, how long would it take to detect a Shopify store outage? Enter your revenue and monitoring setup to see your real mean time to detect.',
  alternates: { canonical: 'https://beaconmon.com/tools/downtime-detection-calculator' },
  openGraph: { url: 'https://beaconmon.com/tools/downtime-detection-calculator' },
};

const STAT_CARDS = [
  {
    setup: 'Without monitoring',
    stat: '4 hours',
    detail: 'Average detection time. Most store owners find out when a customer reports an error, or when they personally try to visit the site.',
  },
  {
    setup: 'Generic 5-min monitoring',
    stat: '2.5 minutes',
    detail: 'To detect, assuming someone reads the alert immediately. If an outage happens at 2am and nobody is watching, add hours.',
  },
  {
    setup: 'Beaconmon',
    stat: 'Under 2 minutes',
    detail: '1-minute checks, alert fires within about 2 minutes. Any hour, any day. No one needs to be watching.',
    green: true,
  },
];

const FAQS = [
  {
    q: 'What is mean time to detect (MTTD) for website downtime?',
    a: 'MTTD is how long it takes from when your store goes offline to when your team actually knows about it. For stores with no monitoring, the average is 4 or more hours, because detection depends on someone happening to notice. With 1-minute monitoring, MTTD drops to about 2 minutes regardless of the time of day.',
  },
  {
    q: 'How long does it take to detect Shopify downtime without monitoring?',
    a: 'Without active monitoring, most store owners find out when a customer reports an error or when they personally try to visit the site. That typically means 2 to 6 hours of undetected downtime, and the gap is worst overnight or on weekends when no one is actively looking at the storefront.',
  },
  {
    q: 'How often do Shopify stores go down?',
    a: "Shopify itself is extremely reliable, but individual stores can still go down from theme conflicts, app errors, DNS problems, or third-party service outages, none of which show up on Shopify's platform status. Individual store incidents occur a few times per year on average, but when they do, the undetected window without monitoring averages 4 or more hours.",
  },
  {
    q: 'What is a good uptime monitoring check interval?',
    a: 'For ecommerce, 1-minute checks are the standard. A 5-minute interval means you could lose 2.5 minutes of revenue on average before detection, and up to 5 minutes in the worst case. On a normal day that is minor, but during a Black Friday spike worth 5 to 8 times normal hourly revenue, those minutes add up fast.',
  },
  {
    q: 'Does Beaconmon monitor Shopify stores?',
    a: 'Yes. Beaconmon checks your store every minute from multiple locations and alerts you within about 2 minutes of any outage, via email or Slack. The free tier covers 10 monitors at no cost, so you can watch your homepage, cart, checkout, and key product pages without paying anything to start.',
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
  name: 'Downtime Detection Speed Calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/downtime-detection-calculator',
  dateModified: '2026-06-29',
  description:
    'Free calculator that shows how long it would take you to find out your Shopify store is down, and how much revenue you lose in that window.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to calculate your downtime detection time',
  step: [
    { '@type': 'HowToStep', name: 'Enter your revenue', text: 'Enter your store estimated hourly revenue.' },
    { '@type': 'HowToStep', name: 'Select your check interval', text: 'Choose your current monitoring setup: no monitoring, 5-minute checks, or 1-minute checks.' },
    { '@type': 'HowToStep', name: 'See your detection window', text: 'The calculator shows your mean time to detect and estimated revenue lost per incident.' },
  ],
};

export default function DowntimeDetectionCalculatorPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Tools', path: '/tools' },
          { name: 'Downtime Detection Calculator', path: '/tools/downtime-detection-calculator' },
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
            Free calculator
          </span>
          <h1 className="text-[clamp(38px,5vw,64px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5 max-w-[860px] [overflow-wrap:anywhere]">
            How fast would you know if your Shopify store went down?
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-6">
            Most store owners find out from a customer complaint. Calculate your real detection time and the revenue you
            lose in that window.
          </p>
          <div className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-5 py-4 mb-8 max-w-[620px]">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              <span className="text-brand-text font-medium">The Downtime Detection Speed Calculator shows how long it would take your team to notice a store outage given your current monitoring setup.</span>{' '}
              Without any monitoring, the average detection time is 4 or more hours.
            </p>
          </div>
          <DetectionCalculator />
        </div>
      </section>

      {/* How monitoring changes the math */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-10 max-w-[680px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              How monitoring changes the math
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              Detection time varies by orders of magnitude depending on how you have monitoring set up. The gap is
              largest when outages happen at night.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-5">
            {STAT_CARDS.map((card) => (
              <div
                key={card.setup}
                className={`reveal rounded-2xl border p-7 ${
                  card.green
                    ? 'bg-brand-bg1 border-brand-green-border-25 relative overflow-hidden'
                    : 'bg-brand-bg1 border-brand-line-soft'
                }`}
              >
                {card.green && (
                  <div
                    aria-hidden
                    className="absolute pointer-events-none"
                    style={{
                      top: '-40%',
                      right: '-20%',
                      width: 280,
                      height: 280,
                      background: 'radial-gradient(circle, rgba(0,229,122,0.10), transparent 60%)',
                      filter: 'blur(30px)',
                    }}
                  />
                )}
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-brand-muted mb-3 relative">
                  {card.setup}
                </p>
                <p
                  className={`text-[36px] font-extrabold tracking-[-0.02em] leading-none mb-3 relative ${
                    card.green ? 'text-brand-green-ink' : 'text-brand-text'
                  }`}
                >
                  {card.stat}
                </p>
                <p className="text-[14px] text-brand-dim leading-[1.6] relative">{card.detail}</p>
              </div>
            ))}
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
            <Link
              href="/ecommerce-uptime-monitoring-guide"
              className="text-brand-dim hover:text-brand-text transition-colors"
            >
              Ecommerce uptime monitoring guide
            </Link>
            <Link
              href="/tools/shopify-uptime-test"
              className="text-brand-dim hover:text-brand-text transition-colors"
            >
              Shopify uptime tester
            </Link>
            <Link
              href="/tools/shopify-competitor-changes"
              className="text-brand-dim hover:text-brand-text transition-colors"
            >
              Competitor change checker
            </Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">
              Pricing
            </Link>
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
            Know in 2 minutes, not 4 hours.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Beaconmon monitors your store every minute and alerts you instantly. Free forever for 10 monitors, no card
            required.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

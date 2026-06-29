import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import IntelligenceReportForm from '@/components/tools/IntelligenceReportForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free 7-Day Competitor Intelligence Report for Any Shopify Store | Beaconmon',
  description:
    'Free 7-day competitor intelligence report for any Shopify store. Track price changes, promotions, and product launches. Report delivered by email, no signup required.',
  alternates: { canonical: 'https://beaconmon.com/tools/competitor-intelligence-report' },
};

const REPORT_INCLUDES = [
  {
    label: 'Price changes',
    body: 'Every product price drop or markdown detected over the 7-day window.',
  },
  {
    label: 'Promotions',
    body: 'New sale events, compare-at price changes, and discount patterns.',
  },
  {
    label: 'New products',
    body: 'Products added to the catalog during the monitoring period.',
  },
  {
    label: 'Content updates',
    body: 'Homepage banner and copy changes detected by our content scanner.',
  },
];

const WHAT_HAPPENS = [
  'Enter a competitor store URL and your email. Beaconmon starts monitoring immediately.',
  'We watch prices, promotions, and catalog changes on their public storefront.',
  'On day 7 you receive a full report of every change we detected, by email.',
  'Want to keep watching? Sign up and Beaconmon monitors indefinitely with instant alerts.',
];

const FAQS = [
  {
    q: 'How does the free competitor intelligence report work?',
    a: 'Enter a competitor Shopify URL and your email. Beaconmon starts monitoring the store immediately. After 7 days, we email you a summary of every price change, promo launch, product addition, and content update we detected.',
  },
  {
    q: 'Is the 7-day report really free?',
    a: 'Yes, completely free with no credit card and no account creation. After the 7-day window the report is delivered by email and monitoring stops unless you sign up for a paid plan. Each email address can request up to 2 reports per week, so you can run a free trial on a couple of competitors before deciding to continue.',
  },
  {
    q: 'What if no changes are detected in 7 days?',
    a: 'You still get a report confirming that the store held steady. That is also useful intelligence: it means your competitor did not run any promotions or make pricing changes that week.',
  },
  {
    q: 'Can I request reports on multiple competitors?',
    a: 'Each email address can request up to 2 reports per week. For ongoing tracking of multiple competitors, Beaconmon paid plans support unlimited competitor monitoring with instant alerts.',
  },
  {
    q: 'Do I need a Shopify account or admin access?',
    a: 'No. The tool reads only publicly available storefront data, the same information any of the store visitors would see. No admin access, no app install, and no Shopify account is required. Around 9 in 10 Shopify stores expose a public product feed, which is all the report needs to track price and catalog changes.',
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
  name: 'Free 7-Day Competitor Intelligence Report',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/competitor-intelligence-report',
  dateModified: '2026-06-29',
  description:
    'Enter a competitor Shopify URL and your email. Beaconmon monitors the store for 7 days and emails you a report of every price change, promotion, and product update detected.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

export default function CompetitorIntelligenceReportPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Tools', path: '/tools' },
          { name: 'Free 7-Day Competitor Intelligence Report', path: '/tools/competitor-intelligence-report' }
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
          <h1 className="text-[clamp(36px,5vw,62px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5 max-w-[840px] [overflow-wrap:anywhere]">
            Get a free 7-day intelligence report on any Shopify competitor
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-6">
            Enter a competitor store URL and your email. We watch the store for 7 days and send you a report of every
            price drop, promo launch, and product change we detected.
          </p>
          <div className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-5 py-4 mb-8 max-w-[620px]">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              <span className="text-brand-text font-medium">The Free 7-Day Competitor Intelligence Report monitors any Shopify store for a full week and emails you a summary of every price change, promotion, and product update detected.</span>{' '}
              Each email address can request up to 2 reports per week, with no account required.
            </p>
          </div>
          <IntelligenceReportForm />
        </div>
      </section>

      {/* What's in the report */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-10 max-w-[720px]">
            <h2 className="text-[clamp(26px,3.2vw,40px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              What is in the report
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              Seven days of active monitoring, compiled into one email with every change ranked by type.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {REPORT_INCLUDES.map((item) => (
              <div
                key={item.label}
                className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7 flex items-start gap-4"
              >
                <span className="shrink-0 mt-[3px]">
                  <CheckIcon />
                </span>
                <div>
                  <p className="text-[15px] font-bold text-brand-text mb-1">{item.label}</p>
                  <p className="text-[14px] text-brand-dim leading-[1.6]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[980px] mx-auto">
            <div>
              <h2 className="text-[clamp(26px,3.2vw,40px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                How the 7-day report works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Beaconmon reads only public storefront data, the same information any visitor would see. No admin
                access, no app install, and no Shopify account required.
              </p>
            </div>
            <ul className="space-y-4">
              {WHAT_HAPPENS.map((item, i) => (
                <li
                  key={i}
                  className="reveal flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5"
                >
                  <span className="shrink-0 font-mono text-[13px] font-semibold text-brand-green-ink mt-[1px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[15px] text-brand-dim leading-[1.6]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What happens after 7 days */}
      <section className="py-[72px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px] mx-auto">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              What happens after 7 days
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <span className="shrink-0 font-mono text-[13px] font-semibold text-brand-green-ink mt-[2px]">01</span>
                <p className="text-[15px] text-brand-dim leading-[1.65]">
                  You receive the report by email with every change we detected, grouped by type.
                </p>
              </div>
              <div className="flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                <span className="shrink-0 font-mono text-[13px] font-semibold text-brand-green-ink mt-[2px]">02</span>
                <p className="text-[15px] text-brand-dim leading-[1.65]">
                  If you want to keep watching, sign up for Beaconmon. The same competitor is waiting in the onboarding
                  flow, pre-filled.
                </p>
              </div>
              <div className="flex items-start gap-4 bg-brand-bg1 border border-brand-green-border-25 rounded-2xl p-6 relative overflow-hidden">
                <div
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    top: '-60%',
                    right: '-20%',
                    width: 280,
                    height: 280,
                    background: 'radial-gradient(circle, rgba(0,229,122,0.10), transparent 60%)',
                    filter: 'blur(25px)',
                  }}
                />
                <span className="shrink-0 font-mono text-[13px] font-semibold text-brand-green-ink mt-[2px] relative">
                  03
                </span>
                <p className="text-[15px] text-brand-dim leading-[1.65] relative">
                  Your competitor will have moved again by day 8. Continuous monitoring catches it the moment it
                  happens, not a week later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(26px,3.2vw,40px)] tracking-[-0.03em] font-extrabold mb-3">
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
            <Link href="/tools/shopify-competitor-changes" className="text-brand-dim hover:text-brand-text transition-colors">
              Competitor change checker
            </Link>
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-dim hover:text-brand-text transition-colors">
              Ecommerce competitor intelligence
            </Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">
              Competitor price tracking
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
          <h2 className="text-[clamp(30px,4vw,50px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">
            7 days gives you a taste. Continuous monitoring gives you the edge, permanently.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Beaconmon watches your competitors and alerts you the moment prices or promos change. Free forever for 10
            monitors, no card required.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

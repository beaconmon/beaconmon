import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CompetitorRoiCalculator from '@/components/tools/CompetitorRoiCalculator';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';
import { TrendingDown, Truck, PackagePlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Competitor Intelligence ROI Calculator | Beaconmon',
  description:
    'Free ROI calculator for ecommerce competitor intelligence. See how much revenue you recover by reacting faster to competitor price drops and promotions.',
  alternates: { canonical: 'https://beaconmon.com/tools/competitor-intelligence-roi' },
  openGraph: { url: 'https://beaconmon.com/tools/competitor-intelligence-roi' },
};

const MOVE_EXAMPLES = [
  {
    icon: TrendingDown,
    heading: 'Competitor drops prices 20% for a flash sale',
    detail:
      'You find out 3 days later. Customers already converted to their offer. Your ads spent the whole weekend competing against a price you did not know existed.',
  },
  {
    icon: Truck,
    heading: 'Competitor launches free shipping for the weekend',
    detail:
      'You find out Monday. Your conversion rate dipped and you did not know why. The promotion ended before you had a chance to respond.',
  },
  {
    icon: PackagePlus,
    heading: 'Competitor adds a new product in your category',
    detail:
      'You find out when a customer mentions it. You missed 2 weeks of comparison shopping traffic while they captured the early buyers.',
  },
];

const HOW_IT_HELPS = [
  {
    heading: 'Instant alerts on price drops and promos',
    detail: 'Get notified within minutes when a competitor changes a price, marks down products, or launches a sale.',
  },
  {
    heading: 'Daily intelligence digest',
    detail: 'A morning summary of every competitor move from the past 24 hours, so nothing slips through overnight.',
  },
  {
    heading: 'React the same day, every time',
    detail: 'Not when a customer mentions it, not on Monday morning. The same day the move happens.',
  },
];

const FAQS = [
  {
    q: 'How does competitor monitoring increase revenue?',
    a: 'When a competitor drops prices or launches a promo, customers comparison shop. If you know within 24 hours, you can match, counter, or simply keep your ads and messaging competitive. Reacting the same day instead of a week later recovers most of the exposed revenue, since a typical promotion peaks in its first 48 to 72 hours before you would otherwise notice.',
  },
  {
    q: 'What is a good reaction time for competitor pricing changes?',
    a: 'Same-day reaction is the standard for stores actively managing competitive pricing. Reacting within 24 hours to a competitor price drop means you can adjust before the promotion peaks and most of the comparison shopping traffic has already converted.',
  },
  {
    q: 'How many competitor pricing moves happen per month?',
    a: 'For most ecommerce niches, meaningful pricing or promotion changes happen 2 to 5 times per month per competitor. Commodity and fashion niches see more frequent moves; specialty products with strong brand differentiation see fewer.',
  },
  {
    q: 'Is this calculator accurate for my store?',
    a: 'The calculator uses industry benchmarks across 3 niche types as inputs. Your actual results depend on your specific niche competitiveness and customer price sensitivity, which vary by product category and market. Use the figure as a directional estimate of the revenue gap between reacting same-day and reacting a week later, not a precise forecast.',
  },
  {
    q: 'What does Beaconmon track for competitor intelligence?',
    a: 'Beaconmon monitors competitor websites for price changes, promotional markdowns, new product launches, and content updates. You get an alert within minutes of any change, plus a weekly digest summarizing competitor activity.',
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
  name: 'Competitor Intelligence ROI Calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/competitor-intelligence-roi',
  dateModified: '2026-06-29',
  description:
    'Free ROI calculator for ecommerce competitor intelligence. See how much revenue you recover by reacting faster to competitor price drops and promotions.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to calculate competitor intelligence ROI for your store',
  step: [
    { '@type': 'HowToStep', name: 'Enter your monthly revenue', text: 'Enter your store monthly revenue.' },
    { '@type': 'HowToStep', name: 'Select your niche', text: 'Choose how competitive your niche is: commodity, mid-market, or differentiated.' },
    { '@type': 'HowToStep', name: 'Enter competitor count', text: 'Enter how many direct competitors you want to track.' },
    { '@type': 'HowToStep', name: 'See the revenue gap', text: 'The calculator shows how much revenue you recover by reacting the same day versus a week later.' },
  ],
};

export default function CompetitorRoiPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Tools', path: '/tools' },
          { name: 'Competitor Intelligence ROI Calculator', path: '/tools/competitor-intelligence-roi' },
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
          <h1 className="text-[clamp(36px,4.8vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5 max-w-[860px] [overflow-wrap:anywhere]">
            How much revenue are you losing by reacting slowly to competitor moves?
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-6">
            Calculate how much faster competitor intelligence could recover for your store. Based on your revenue, niche, and
            how many competitors you track.
          </p>
          <div className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-5 py-4 mb-8 max-w-[620px]">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              <span className="text-brand-text font-medium">The Competitor Intelligence ROI Calculator estimates how much revenue your store recovers by reacting to competitor price drops and promotions the same day instead of a week later.</span>{' '}
              Same-day reaction recovers a large share of revenue that a typical promotion peaks within its first 48 to 72 hours.
            </p>
          </div>
          <CompetitorRoiCalculator />
        </div>
      </section>

      {/* What counts as a competitor move */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-10 max-w-[680px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              What counts as a competitor move?
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              A competitor move is any change that affects which store a comparison shopper chooses. Here are three that
              happen every week.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-5">
            {MOVE_EXAMPLES.map((ex) => (
              <div key={ex.heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <div className="mb-4 w-10 h-10 rounded-lg bg-brand-bg2 flex items-center justify-center">
                  <ex.icon size={20} className="text-brand-dim" />
                </div>
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{ex.heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{ex.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Beaconmon changes the math */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-10 max-w-[680px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              How Beaconmon changes the math
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              The gap between slow and fast reaction is not a few dollars. It is your conversion rate for an entire weekend.
            </p>
          </div>
          <div className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-5">
            {HOW_IT_HELPS.map((item) => (
              <div key={item.heading} className="reveal bg-brand-bg1 border border-brand-green-border-25 rounded-2xl p-7 relative overflow-hidden">
                <div
                  aria-hidden
                  className="absolute pointer-events-none"
                  style={{
                    top: '-40%',
                    right: '-20%',
                    width: 220,
                    height: 220,
                    background: 'radial-gradient(circle, rgba(0,229,122,0.09), transparent 60%)',
                    filter: 'blur(24px)',
                  }}
                />
                <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2 text-brand-green-ink relative">{item.heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65] relative">{item.detail}</p>
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
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-dim hover:text-brand-text transition-colors">
              Ecommerce competitor intelligence
            </Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">
              Competitor price tracking
            </Link>
            <Link href="/tools/shopify-competitor-changes" className="text-brand-dim hover:text-brand-text transition-colors">
              Competitor change checker
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
            Stop reacting a week late.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Beaconmon alerts you the moment a competitor drops prices or launches a sale. Free forever for 10 monitors, no
            card required.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

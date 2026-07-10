import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Competitor Homepage Monitoring | Beaconmon',
  description:
    'Know when competitors change their hero, launch a sale banner, or update pricing messaging. Beaconmon alerts your team the moment anything changes.',
  alternates: { canonical: 'https://beaconmon.com/homepage-monitoring' },
  openGraph: { url: 'https://beaconmon.com/homepage-monitoring' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How is this different from manually checking competitor sites?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Manual checks happen once a day at best, and only when someone remembers. Beaconmon checks competitor homepages every hour or every few hours and sends an alert the moment a change is detected. You find out about a competitor sale within minutes, not the next morning.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I monitor multiple competitor homepages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Add as many competitor URLs as your plan allows. Each gets its own monitor with independent check intervals, CSS selectors, and alert channels. A single dashboard shows all of them.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does competitor homepage monitoring work on Shopify stores?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes. Beaconmon uses server-side HTML fetching, which works on the vast majority of Shopify storefronts. Most Shopify homepage content including hero banners, promotional text, and navigation is server-rendered and captured correctly.",
      },
    },
    {
      '@type': 'Question',
      name: 'How do I monitor just the promo banner and not the whole page?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Set a CSS selector on the monitor to target a specific element, such as the announcement bar or hero section. Beaconmon compares only the content within that selector, filtering out changes elsewhere on the page.',
      },
    },
    {
      '@type': 'Question',
      name: 'How fast does Beaconmon detect homepage changes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Detection speed depends on the check interval you configure. Content monitors can be set to check as frequently as every hour. Most pricing and promotion changes are detected and alerted within 1 to 2 hours of the competitor making the change.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the change alert look like?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Alerts include a before-and-after diff showing exactly what changed in the HTML. On Growth plan and above, Beaconmon also generates an AI summary in plain English, such as "The homepage hero changed from free shipping over $75 to free shipping on all orders."',
      },
    },
  ],
};

const WHAT_CHANGES = [
  {
    heading: 'Sale and promotion banners',
    body: 'Announcement bars and hero banners are where competitors announce flash sales, site-wide discounts, and limited-time offers. Catching these in the first hour lets you respond before customers start comparing prices.',
  },
  {
    heading: 'Hero copy and value propositions',
    body: 'Competitors test headlines and value props continuously. A shift in their hero messaging often signals a positioning change or a response to customer feedback. Knowing when it happens keeps your messaging competitive.',
  },
  {
    heading: 'Free shipping thresholds',
    body: 'Shipping policy changes appear in the homepage header on most ecommerce stores. When a competitor drops their free shipping threshold, customers notice immediately. You should too.',
  },
  {
    heading: 'New product or category launches',
    body: 'Homepage navigation and featured product sections update when a competitor enters a new category or launches a major product. Beaconmon surfaces these changes so you are not caught off guard.',
  },
];

const FEATURES = [
  {
    heading: 'CSS selector targeting',
    body: 'Target just the announcement bar, hero section, or navigation menu. Monitoring the entire page generates noise from timestamps and dynamic content. CSS selectors keep alerts focused on the changes that matter.',
  },
  {
    heading: 'AI summaries of what changed',
    body: 'Growth plan and above: instead of reading a raw HTML diff, you get a plain-English summary of what changed. "The hero headline changed from 20% off to 30% off site-wide, ending Sunday."',
  },
  {
    heading: 'Snapshot history',
    body: 'Every version of a monitored homepage is stored with a timestamp. Scroll back through a competitor\'s homepage history over the past 90 or 365 days to see their full promotional calendar.',
  },
  {
    heading: 'Slack and email alerts',
    body: 'Alerts reach your team on the channels they already use. Configure separate alert destinations per monitor, so pricing team alerts go to one Slack channel and brand team alerts go to another.',
  },
];

const HOW_IT_WORKS = [
  'Add a competitor homepage URL as a content monitor',
  'Set a CSS selector to target the promo banner, hero, or navigation section you want to watch',
  'Choose a check interval: hourly is enough for most promotional tracking',
  'When the page changes, receive an alert with a before-and-after diff and an AI summary of what shifted',
  'Review snapshot history to understand how competitor messaging has evolved over time',
];

const FAQS = [
  {
    q: 'How is this different from manually checking competitor sites?',
    a: 'Manual checks happen once a day at best, and only when someone remembers. Beaconmon checks competitor homepages every hour or every few hours and sends an alert the moment a change is detected. You find out about a competitor sale within minutes, not the next morning.',
  },
  {
    q: 'Can I monitor multiple competitor homepages?',
    a: 'Yes. Add as many competitor URLs as your plan allows. Each gets its own monitor with independent check intervals, CSS selectors, and alert channels. A single dashboard shows all of them.',
  },
  {
    q: 'Does competitor homepage monitoring work on Shopify stores?',
    a: "Yes. Beaconmon uses server-side HTML fetching, which works on the vast majority of Shopify storefronts. Most Shopify homepage content including hero banners, promotional text, and navigation is server-rendered and captured correctly.",
  },
  {
    q: 'How do I monitor just the promo banner and not the whole page?',
    a: 'Set a CSS selector on the monitor to target a specific element, such as the announcement bar or hero section. Beaconmon compares only the content within that selector, filtering out changes elsewhere on the page.',
  },
  {
    q: 'How fast does Beaconmon detect homepage changes?',
    a: 'Detection speed depends on the check interval you configure. Content monitors can be set to check as frequently as every hour. Most pricing and promotion changes are detected and alerted within 1 to 2 hours of the competitor making the change.',
  },
  {
    q: 'What does the change alert look like?',
    a: 'Alerts include a before-and-after diff showing exactly what changed in the HTML. On Growth plan and above, Beaconmon also generates an AI summary in plain English, such as "The homepage hero changed from free shipping over $75 to free shipping on all orders."',
  },
];

export default function HomepageMonitoringPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Competitor Homepage Monitoring', path: '/homepage-monitoring' })} />
      <NavBar />

      {/* Hero */}
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Competitor Homepage Monitoring</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Be First to See Every Sale, Promotion, and Messaging Change on Competitor Homepages
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-8">
            Beaconmon tracks competitor homepages and alerts your team the moment a sale banner goes up, a shipping threshold changes, or a hero message shifts. No more finding out from customers.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* What changes on competitor homepages */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">What changes on competitor homepages</h2>
            <p className="text-brand-dim text-[16px] max-w-[540px] mx-auto">Competitors update their homepages constantly. Most of those changes are worth knowing about.</p>
          </div>
          <div className="reveal grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 max-w-[900px] mx-auto">
            {WHAT_CHANGES.map(({ heading, body }) => (
              <div key={heading} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-2 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use case: responding to a competitor sale */}
      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg1">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px] mx-auto">
            <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              From change detected to response in the same business day
            </h2>
            <div className="space-y-4 text-brand-dim text-[16px] leading-[1.7]">
              <p>
                A competitor launches a 25% off sale at 8am. Without monitoring, your team finds out at 3pm when a customer emails asking why your prices are higher. By then, you have lost most of a business day.
              </p>
              <p>
                With Beaconmon watching their homepage, your Slack channel gets an alert at 8:07am with a summary: &quot;Hero changed to announce 25% off site-wide through Sunday.&quot; Your team can decide within the hour whether to match, respond differently, or hold position.
              </p>
              <p>
                That seven-minute window versus a seven-hour lag is the difference between a reactive posture and a competitive one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for tracking competitor moves, not just page uptime</h2>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FEATURES.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
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
              <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                How competitor homepage monitoring works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Set up a competitor monitor in minutes with no code required.
              </p>
            </div>
            <ul className="space-y-4">
              {HOW_IT_WORKS.map((item, i) => (
                <li key={i} className="reveal flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5">
                  <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
                  <span className="text-[15px] text-brand-dim leading-[1.6]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Frequently asked questions</h2>
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
            <Link href="/ecommerce-competitor-intelligence" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce competitor intelligence</Link>
            <Link href="/competitor-price-tracking" className="text-brand-dim hover:text-brand-text transition-colors">Competitor price tracking</Link>
            <Link href="/website-change-detection" className="text-brand-dim hover:text-brand-text transition-colors">Website change detection</Link>
            <Link href="/for/shopify" className="text-brand-dim hover:text-brand-text transition-colors">Shopify monitoring</Link>
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
            Know about competitor sales before your customers ask about them.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

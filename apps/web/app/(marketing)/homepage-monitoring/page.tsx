import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Homepage Monitoring | Beaconmon',
  description: 'Never miss the moment your homepage goes down. Multi-region checks, keyword verification, incident history, and instant Slack and email alerts.',
  alternates: { canonical: 'https://beaconmon.com/homepage-monitoring' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How fast does Beaconmon detect homepage downtime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A homepage failure is confirmed after 2 consecutive failed checks. On the Scale plan with 30-second intervals, that is within 60 seconds of the outage starting.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is keyword verification?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Keyword monitoring checks that a specific word or phrase is present in the page response. For a homepage, you might verify your brand name or a key headline is present, catching cases where the server is up but the page is rendering blank.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Beaconmon monitor from multiple locations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Growth and Scale plans check from 5 geographic regions. If your homepage is slow or down in one region, you see which one, eliminating false positives from single-location monitoring.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does Beaconmon retain incident history?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Incidents are retained for the lifetime of your account. Check result data (individual HTTP check records) is retained for 7 to 365 days depending on your plan.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I get SMS alerts for homepage downtime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SMS alerts are on the Scale plan roadmap. Email, Slack, and webhook alerts are available on all paid plans today.',
      },
    },
  ],
};

const FEATURES = [
  {
    heading: 'Multi-region homepage checks',
    body: 'Growth and Scale plans check your homepage from 5 regions simultaneously. If your homepage is down in one region only, you see exactly where, not a false global alarm.',
  },
  {
    heading: 'Keyword verification',
    body: 'Verify that your homepage is not just returning a 200 status but actually rendering the correct content. Use keyword monitoring to check for your brand name, hero copy, or a critical CTA button.',
  },
  {
    heading: 'Incident history',
    body: 'Every homepage outage is logged with start time, duration, root cause (if resolved manually), and alert history. Use it in post-mortems or share it with your hosting provider.',
  },
  {
    heading: 'Instant Slack and email alerts',
    body: 'The moment your homepage fails two consecutive checks, Beaconmon fires to all configured alert channels simultaneously. Recovery alerts close the loop when the homepage comes back.',
  },
];

const HOW_IT_WORKS = [
  'Add your homepage URL as an HTTP monitor in Beaconmon',
  'Optionally add a keyword check to verify the page content, not just the status code',
  'Set up email, Slack, or webhook alerts for your team',
  'Beaconmon checks every 30 seconds and alerts within 60 seconds of a confirmed failure',
];

const FAQS = [
  {
    q: 'How fast does Beaconmon detect homepage downtime?',
    a: 'A homepage failure is confirmed after 2 consecutive failed checks. On the Scale plan with 30-second intervals, that is within 60 seconds of the outage starting.',
  },
  {
    q: 'What is keyword verification?',
    a: 'Keyword monitoring checks that a specific word or phrase is present in the page response. For a homepage, you might verify your brand name or a key headline is present, catching cases where the server is up but the page is rendering blank.',
  },
  {
    q: 'Does Beaconmon monitor from multiple locations?',
    a: 'Yes. Growth and Scale plans check from 5 geographic regions. If your homepage is slow or down in one region, you see which one, eliminating false positives from single-location monitoring.',
  },
  {
    q: 'How long does Beaconmon retain incident history?',
    a: 'Incidents are retained for the lifetime of your account. Check result data (individual HTTP check records) is retained for 7 to 365 days depending on your plan.',
  },
  {
    q: 'Can I get SMS alerts for homepage downtime?',
    a: 'SMS alerts are on the Scale plan roadmap. Email, Slack, and webhook alerts are available on all paid plans today.',
  },
];

export default function HomepageMonitoringPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Homepage Monitoring</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Homepage Monitoring: Never Miss the Moment Your Homepage Goes Down
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Multi-region uptime checks every 30 seconds, keyword verification to catch broken deploys, and instant alerts to email and Slack the moment your homepage fails.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. 14-day Growth trial, no card required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Everything you need to protect your homepage</h2>
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
                How homepage monitoring works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Set up in under 5 minutes. Alerts reach your team before customers notice.
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
            <Link href="/ecommerce-website-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce website monitoring</Link>
            <Link href="/website-change-detection" className="text-brand-dim hover:text-brand-text transition-colors">Website change detection</Link>
            <Link href="/for/ecommerce" className="text-brand-dim hover:text-brand-text transition-colors">E-commerce monitoring</Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
            <Link href="/vs/pingdom" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs Pingdom</Link>
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
            Know the moment your homepage goes down.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

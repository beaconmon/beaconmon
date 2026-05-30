import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Change Detection | Beaconmon',
  description: 'Be the first to know when any page changes. HTML-based change detection, snapshot history, diff viewer, AI summaries, and deploy-aware monitoring.',
  alternates: { canonical: 'https://beaconmon.com/website-change-detection' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is HTML-based change detection?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Beaconmon fetches a page's HTML source and compares it to a stored snapshot. Any addition, removal, or modification in the HTML is detected. CSS selectors narrow the comparison to a specific element.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does website change detection work on JavaScript-rendered pages?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon uses server-side HTML fetching without a browser. Pages that require JavaScript to render content will not show the JavaScript-rendered content. Most pricing, product, and landing pages are server-rendered and work correctly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long is change history stored?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Free: 7 days. Starter: 30 days. Growth: 90 days. Scale: 365 days.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the AI change summary look like?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instead of a raw HTML diff, you see a sentence like: "The price changed from $49 to $39. A new FAQ item was added about free shipping." Available on the Growth plan and above.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is deploy-aware monitoring?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'When you trigger a deployment in Beaconmon (via webhook or the dashboard), content monitors suppress alerts for 30 minutes. This prevents planned code changes from generating noise.',
      },
    },
  ],
};

const FEATURES = [
  {
    heading: 'HTML-based change detection',
    body: 'Beaconmon fetches the page HTML and compares it to the previous snapshot. CSS selectors let you monitor just a price, a shipping cost, or a specific section, not the entire page.',
  },
  {
    heading: 'Snapshot history and diff viewer',
    body: 'Every version of a monitored page is stored with a timestamp. Open any two snapshots side by side to see exactly what changed and when. Up to 365 days of history on the Scale plan.',
  },
  {
    heading: 'AI change summaries',
    body: 'Growth plan and above: when a change is detected, Beaconmon generates a plain-English summary of what changed. No reading raw HTML diffs.',
  },
  {
    heading: 'Deploy-aware monitoring',
    body: 'Mark a deployment in Beaconmon and all monitors suppress alerts for 30 minutes. Planned changes do not generate noise.',
  },
];

const HOW_IT_WORKS = [
  'Add any URL as a content monitor in Beaconmon',
  'Optionally set a CSS selector to target a specific section of the page',
  'Beaconmon fetches the page on your chosen interval and compares it to the previous snapshot',
  'Get an alert with a diff showing exactly what changed, and optionally an AI summary',
];

const FAQS = [
  {
    q: 'What is HTML-based change detection?',
    a: "Beaconmon fetches a page's HTML source and compares it to a stored snapshot. Any addition, removal, or modification in the HTML is detected. CSS selectors narrow the comparison to a specific element.",
  },
  {
    q: 'Does website change detection work on JavaScript-rendered pages?',
    a: 'Beaconmon uses server-side HTML fetching without a browser. Pages that require JavaScript to render content will not show the JavaScript-rendered content. Most pricing, product, and landing pages are server-rendered and work correctly.',
  },
  {
    q: 'How long is change history stored?',
    a: 'Free: 7 days. Starter: 30 days. Growth: 90 days. Scale: 365 days.',
  },
  {
    q: 'What does the AI change summary look like?',
    a: 'Instead of a raw HTML diff, you see a sentence like: "The price changed from $49 to $39. A new FAQ item was added about free shipping." Available on the Growth plan and above.',
  },
  {
    q: 'What is deploy-aware monitoring?',
    a: 'When you trigger a deployment in Beaconmon (via webhook or the dashboard), content monitors suppress alerts for 30 minutes. This prevents planned code changes from generating noise.',
  },
];

export default function WebsiteChangeDetectionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <JsonLd data={breadcrumbSchema({ name: 'Website Change Detection', path: '/website-change-detection' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Change Detection</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Website Change Detection: Be the First to Know When Any Page Changes
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Monitor any page for content changes using HTML-based parsing. Every change is logged with a before-and-after diff, and AI summaries explain what changed in plain English.
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
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Every change, captured and explained</h2>
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
                How website change detection works
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Set up a content monitor in minutes with no code required.
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
            <Link href="/homepage-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Homepage monitoring</Link>
            <Link href="/for/ecommerce" className="text-brand-dim hover:text-brand-text transition-colors">E-commerce monitoring</Link>
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
            <Link href="/vs/statuscake" className="text-brand-dim hover:text-brand-text transition-colors">Beaconmon vs StatusCake</Link>
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
            Be the first to know when any page changes.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

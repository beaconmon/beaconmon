import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import SslChecker from '@/components/tools/SslChecker';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free SSL Certificate Checker: Check Any Website SSL Status | Beaconmon',
  description:
    'Check any website\'s SSL certificate instantly. See if the cert is valid, when it expires, and how many days remain. Free, no signup required.',
  alternates: { canonical: 'https://beaconmon.com/tools/ssl-checker' },
};

const WHAT_IT_CHECKS = [
  {
    title: 'Validity',
    body: 'Whether the certificate is trusted by browsers and not expired or self-signed.',
  },
  {
    title: 'Days remaining',
    body: 'Exactly how many days until the certificate expires, color-coded so you know if renewal is urgent.',
  },
  {
    title: 'Issuer and name',
    body: 'Which authority issued the cert and the common name it was issued for.',
  },
];

const MANUAL_CHECK = [
  'Tells you the status right now, once',
  'You have to remember to check again before expiry',
  'No warning the week before it lapses',
  'A missed renewal means a security warning for every visitor',
];

const CONTINUOUS = [
  'Tracks expiry continuously, 24/7',
  'Alerts you well before the certificate lapses',
  'Watches SSL alongside uptime and content',
  'No spreadsheet of renewal dates to maintain',
];

const FAQS = [
  {
    q: 'How do I check if my SSL certificate is expired?',
    a: 'Paste your domain into the tool above and it reads the live certificate from port 443 in under 10 seconds, returning whether it is valid and exactly how many days remain. A negative number means it has already expired, and visitors are seeing a browser security warning instead of your store.',
  },
  {
    q: 'What happens when an SSL certificate expires on a Shopify store?',
    a: 'Browsers show a full-page security warning that most shoppers will not click past, so conversions drop to near zero until it is fixed. Shopify auto-manages SSL for stores on its domains, but custom domains and subdomains can still lapse. An expired cert can cost a busy store thousands of dollars per hour during a sale.',
  },
  {
    q: 'How often should I check my SSL certificate?',
    a: 'Manually, at least once a month, and always after a domain or hosting change. A certificate that looks fine today can still lapse in 30 days if auto-renewal silently failed. Continuous monitoring removes the guesswork by checking every day and alerting you before the 15-day danger window.',
  },
  {
    q: 'What is a good SSL certificate renewal window?',
    a: 'Renew at least 30 days before expiry. That leaves time to fix a failed auto-renewal, update DNS validation, or contact your host before customers ever see a warning. This tool flags any certificate with fewer than 60 days left in amber and fewer than 15 days in red so you can act early.',
  },
  {
    q: 'Does Beaconmon monitor SSL expiry automatically?',
    a: 'Yes. Beaconmon tracks your certificate expiry continuously and sends an alert well before it lapses, alongside uptime and content monitoring. The free tier includes 10 monitors at no cost, so you can watch SSL on your main domain and key subdomains without paying anything to start.',
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
  name: 'SSL Certificate Checker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://beaconmon.com/tools/ssl-checker',
  dateModified: '2026-06-29',
  description:
    'Free tool to check any website SSL certificate. See if the certificate is valid, when it expires, how many days remain, and which authority issued it.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  provider: { '@type': 'Organization', name: 'Beaconmon', url: 'https://beaconmon.com' },
};

export default function SslCheckerPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Tools', path: '/tools' },
          { name: 'SSL Certificate Checker', path: '/tools/ssl-checker' }
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
            Check any website&apos;s SSL certificate
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px] mb-6">
            Instant SSL check from our servers. See if the certificate is valid, when it expires, and how many days remain. No app install, no signup.
          </p>
          <div className="bg-brand-bg1 border border-brand-line-soft rounded-xl px-5 py-4 mb-8 max-w-[620px]">
            <p className="text-[14px] text-brand-dim leading-[1.6]">
              <span className="text-brand-text font-medium">The SSL Certificate Checker reads any website&apos;s live certificate and returns whether it is valid, its expiry date, the days remaining, and the issuer, in under 10 seconds.</span>{' '}
              A safe renewal window is at least 30 days before expiry, so anything inside that is worth acting on.
            </p>
          </div>
          <SslChecker />
        </div>
      </section>

      {/* What the check shows */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[640px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              What the check shows
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              Three signals that tell you whether your certificate is healthy or about to become a problem.
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

      {/* One check vs. continuous monitoring */}
      <section className="py-[88px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-12 max-w-[720px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3 leading-[1.1]">
              One check vs. continuous monitoring
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.6]">
              A manual check tells you the status today. It cannot warn you the week before the certificate lapses.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-5">
            <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-brand-dim mb-5">
                This free check
              </h3>
              <ul className="space-y-3">
                {MANUAL_CHECK.map((item) => (
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
            <Link href="/tools/shopify-uptime-test" className="text-brand-dim hover:text-brand-text transition-colors">Shopify uptime tester</Link>
            <Link href="/ecommerce-website-monitoring" className="text-brand-dim hover:text-brand-text transition-colors">Ecommerce website monitoring</Link>
            <Link href="/tools/monitoring-coverage" className="text-brand-dim hover:text-brand-text transition-colors">Store monitoring coverage auditor</Link>
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
            Never get caught by an expired certificate.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Beaconmon watches your SSL expiry and alerts you well before it lapses, alongside uptime and content. Free forever for 10 monitors, no card required.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

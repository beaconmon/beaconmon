import NavBar from '@/components/marketing/NavBar';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Beaconmon | Support, Billing & Feature Requests',
  description: 'Questions about your monitors, billing, or a feature request? Email the Beaconmon team at hello@beaconmon.com. We read every message and respond within one business day.',
  alternates: { canonical: 'https://beaconmon.com/contact' },
};

const CONTACT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Beaconmon',
  description: 'Get in touch with the Beaconmon team. We read every message.',
  url: 'https://beaconmon.com/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'Beaconmon',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@beaconmon.com',
      contactType: 'customer support',
      availableLanguage: ['en'],
    },
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={CONTACT_SCHEMA} />
      <NavBar />

      <section className="py-[120px] max-[640px]:py-[72px]">
        <div className="max-w-[600px] mx-auto px-8 max-[640px]:px-5 text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-5">Contact</span>
          <h1 className="text-[clamp(36px,4.5vw,56px)] leading-[1.08] tracking-[-0.035em] font-extrabold mb-6">
            We read every message.
          </h1>
          <p className="text-[17px] text-brand-dim leading-[1.65] mb-10">
            Have a question, a bug report, a feature idea, or just want to say hi? Send us an email. You&apos;ll hear back from a real person, usually within one business day.
          </p>
          <a
            href="mailto:hello@beaconmon.com"
            className="inline-flex items-center justify-center h-14 px-8 text-[17px] font-semibold rounded-[12px] bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] hover:scale-[1.02] hover:bg-[#00ff8a] transition-all duration-[120ms]"
          >
            hello@beaconmon.com
          </a>
          <p className="mt-6 text-[13px] text-brand-muted">
            Typical response time: within 1 business day.
          </p>
          <p className="mt-3 text-[12px] text-brand-muted opacity-60">
            Beaconmon is operated by Haimanot Getu. For data protection enquiries, email{' '}
            <a href="mailto:privacy@beaconmon.com" className="underline hover:opacity-100 transition-opacity">privacy@beaconmon.com</a>.
          </p>
        </div>
      </section>

      {/* What to write about */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[900px] mx-auto px-8 max-[640px]:px-5">
          <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-10 text-center leading-[1.2]">What can we help with?</h2>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {[
              {
                heading: 'Bug reports',
                body: 'If something in the dashboard is broken, an alert fired incorrectly, or a monitor isn\'t behaving as expected, tell us exactly what happened. Include your monitor URL and the time if you can.',
              },
              {
                heading: 'Feature requests',
                body: 'We prioritise based on what users actually ask for. If you need a new alert channel, a different monitor type, or a workflow that doesn\'t exist yet, we want to hear it.',
              },
              {
                heading: 'Billing and plan questions',
                body: 'Upgrading, downgrading, cancelling, or confused about what a plan includes? Email us and we\'ll sort it out, usually faster than digging through a billing portal.',
              },
              {
                heading: 'Anything else',
                body: 'Partnership ideas, press enquiries, general feedback, or just to say hello. We read everything and reply to everything worth replying to.',
              },
            ].map(({ heading, body }) => (
              <div key={heading} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-10 text-center leading-[1.2]">Common questions</h2>
          <div className="space-y-8">
            {[
              {
                q: 'Is there a live chat or phone support?',
                a: 'No. We\'re a small bootstrapped team, and email lets us give every question the attention it deserves. We respond within one business day, often sooner.',
              },
              {
                q: 'Can I get a refund if I cancel?',
                a: 'Yes. If you\'re on a paid plan and it isn\'t working for you, email us within 30 days of your last charge and we\'ll refund it, no questions asked.',
              },
              {
                q: 'My monitor is showing the wrong status. What should I do?',
                a: 'Email us the monitor URL, what status it\'s showing, and roughly when it started. We can check the raw check logs on our end and figure out what\'s happening.',
              },
              {
                q: 'Do you offer custom plans or volume pricing for large agencies?',
                a: 'Reach out with the number of monitors you need. Business plan pricing scales to unlimited monitors, but if your situation is unusual we\'re open to talking.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-brand-line-soft pb-8 last:border-b-0 last:pb-0">
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.7]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

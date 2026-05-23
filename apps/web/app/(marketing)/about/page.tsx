import NavBar from '@/components/marketing/NavBar';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Beaconmon — Uptime Monitoring Built for Freelancers',
  description:
    'We built Beaconmon because the tools we used were either too expensive, too complex, or too slow. Simple, reliable uptime monitoring for freelancers and agencies.',
  alternates: { canonical: 'https://beaconmon.com/about' },
};

const ABOUT_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Beaconmon',
    description:
      'We built Beaconmon because the tools we used were either too expensive, too complex, or too slow. Simple, reliable uptime monitoring for freelancers and agencies.',
    url: 'https://beaconmon.com/about',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Beaconmon',
    url: 'https://beaconmon.com',
    description: 'Website uptime and performance monitoring for freelancers and agencies.',
    email: 'hello@beaconmon.com',
    founder: { '@type': 'Person', name: 'Haimanot Getu' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Haimanot Getu',
    jobTitle: 'Founder',
    url: 'https://www.linkedin.com/in/haimanot-getu/',
    sameAs: ['https://www.linkedin.com/in/haimanot-getu/'],
    worksFor: {
      '@type': 'Organization',
      name: 'Beaconmon',
      url: 'https://beaconmon.com',
    },
  },
];

const PHILOSOPHY = [
  {
    heading: 'Reliability is not optional.',
    body: 'Every minute your client\'s site is down costs them money and costs you trust. We built Beaconmon to make professional-grade monitoring accessible to freelancers and small teams — not just enterprise teams with dedicated DevOps.',
  },
  {
    heading: 'Simple tools get used.',
    body: 'The best monitoring tool is the one that\'s actually set up. Beaconmon is designed to be running in five minutes. No agents to install, no complex configuration, no steep learning curve.',
  },
  {
    heading: 'Alerts should mean something.',
    body: 'Alert fatigue is real. We confirm failures from multiple locations before waking you up. When Beaconmon sends an alert, you can trust that something is actually wrong.',
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={ABOUT_SCHEMA} />
      <NavBar />

      {/* Hero */}
      <section className="relative py-[120px] max-[640px]:py-[72px] overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-20%',
            right: '-5%',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(0,229,122,0.08) 0%, rgba(0,229,122,0.03) 40%, transparent 70%)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-5">About</span>
          <h1 className="text-[clamp(40px,5.5vw,76px)] leading-[1.02] tracking-[-0.04em] font-extrabold mb-7 max-w-[820px]">
            Built by people who got paged at 2am for sites that were already up.
          </h1>
          <p className="text-[18px] leading-[1.6] text-brand-dim max-w-[600px]">
            Beaconmon exists because the tools we used were either too noisy, too expensive, or too slow. We wanted something that just worked — and sent alerts only when they meant something.
          </p>
        </div>
      </section>

      {/* Philosophy cards */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="grid grid-cols-3 max-[880px]:grid-cols-1 gap-5">
            {PHILOSOPHY.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <div className="w-2 h-2 rounded-full bg-brand-green mb-6" />
                <h3 className="text-[20px] font-bold tracking-[-0.02em] mb-4 leading-[1.2]">{heading}</h3>
                <p className="text-brand-dim text-[15px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we believe */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[760px]">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-8 leading-[1.15]">What we believe</h2>
            <div className="space-y-6 text-[16px] text-brand-dim leading-[1.75]">
              <p>
                Most uptime monitoring tools were built for enterprise teams. They charge enterprise prices, require enterprise setup, and generate enterprise volumes of alerts — most of which are meaningless by the time someone looks at them.
              </p>
              <p>
                We believe the freelancers and small agencies who build and manage most of the web deserve better. A tool that checks your sites every 30 seconds, confirms failures before crying wolf, and sends one clear, actionable alert to the right channel.
              </p>
              <p>
                We&apos;re a small team obsessed with reliability — and with the idea that monitoring should be something you set up once and forget about, until it matters.
              </p>
              <p>
                Beaconmon is bootstrapped. We don&apos;t have venture capital or growth targets pressuring us to make the product more complex. Our incentive is simple: build something good enough that you tell a colleague about it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal flex items-center gap-6 max-[640px]:flex-col max-[640px]:items-start">
            <div className="w-14 h-14 rounded-full bg-brand-bg2 border border-brand-line flex items-center justify-center shrink-0 text-[20px] font-bold text-brand-green select-none">
              HG
            </div>
            <div>
              <p className="text-[17px] font-bold tracking-[-0.02em] leading-[1.2]">Haimanot Getu</p>
              <p className="text-brand-dim text-[14px] mb-2">Founder, Beaconmon</p>
              <p className="text-brand-dim text-[15px] leading-[1.65] max-w-[540px]">
                Built Beaconmon after getting burned by false-positive alerts on client stores.
              </p>
              <a
                href="https://www.linkedin.com/in/haimanot-getu/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-medium text-brand-green hover:underline"
              >
                LinkedIn &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal flex items-center justify-between max-[640px]:flex-col max-[640px]:gap-6 max-[640px]:text-center">
            <div>
              <p className="text-[20px] font-bold tracking-[-0.02em] mb-2">Ready to try it?</p>
              <p className="text-brand-dim text-[15px]">Free for 10 monitors. No card required.</p>
            </div>
            <div className="flex gap-4 flex-wrap max-[640px]:justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-12 px-6 text-[15px] font-semibold rounded-[10px] bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] hover:scale-[1.02] hover:bg-[#00ff8a] transition-all duration-[120ms]"
              >
                Start free
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center h-12 px-6 text-[15px] font-semibold rounded-[10px] bg-brand-bg2 text-brand-text border border-brand-line hover:bg-brand-bg3 transition-all"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

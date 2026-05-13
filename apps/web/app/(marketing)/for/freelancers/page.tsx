import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uptime Monitoring for Freelancers — Beaconmon',
  description: 'Beaconmon helps freelancers catch downtime before their clients do — with instant alerts, SSL expiry warnings, and domain tracking on every site you manage.',
  alternates: { canonical: 'https://beaconmon.com/for/freelancers' },
};

const FEATURES = [
  {
    heading: 'Instant alerts for every site you manage',
    body: 'Set up a monitor in 30 seconds per site. The moment anything goes down, you\'ll know via email or Slack — before your client checks their site in the morning.',
  },
  {
    heading: 'SSL and domain expiry tracking',
    body: 'Both included on all plans. You\'ll get warnings 30, 14, and 7 days before a certificate or domain expires. The most avoidable downtime you\'ll ever prevent.',
  },
  {
    heading: 'Status page for each client',
    body: 'Give your clients a status page at their own domain. It looks professional, answers "is the site down?" without them calling you, and takes two minutes to set up.',
  },
  {
    heading: 'Affordable from the start',
    body: 'Free plan covers 10 monitors — enough to get started. Pro is $15/mo. Most freelancers find the Pro plan covers all their client work comfortably.',
  },
];

const HOW_IT_HELPS = [
  'Stop being the last to know when a client site goes down.',
  'Catch expiring SSL certificates weeks in advance — before the padlock disappears.',
  'Track domain renewals for every domain you manage, even ones on auto-renew.',
  'Show clients a live status page instead of "I\'ll look into it" when they ask.',
];

export default function ForFreelancersPage() {
  return (
    <>
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">For Freelancers</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px]">
            Your clients hired you to keep things running.<br />
            <span className="text-brand-green">Beaconmon makes sure you do.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Website downtime is a client-trust emergency. Beaconmon monitors every site you manage and alerts you instantly — so you can act before your client notices.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. No credit card required.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-[radial-gradient(ellipse_at_top,rgba(255,68,68,0.04),transparent_60%),#0E0E14] border border-brand-line rounded-[20px] px-[60px] py-20 max-[640px]:px-6 max-[640px]:py-12 text-center max-w-[920px] mx-auto relative overflow-hidden">
            <span aria-hidden className="absolute top-[10px] left-10 font-serif text-[160px] text-brand-line leading-none select-none">&ldquo;</span>
            <blockquote className="relative m-0 text-[clamp(22px,2.8vw,32px)] leading-[1.3] font-semibold tracking-[-0.02em] max-w-[720px] mx-auto mb-6">
              My client&apos;s site had been down for six hours before I found out. They had already called their old agency.
            </blockquote>
            <p className="text-brand-dim text-[15px] max-w-[560px] mx-auto mb-7 leading-[1.6]">
              For freelancers, one bad downtime event can cost you the client. You can&apos;t watch every site manually. You need monitoring that runs in the background and alerts you the moment something breaks.
            </p>
            <span className="text-brand-green text-[15px] font-semibold inline-flex items-center gap-[10px]">
              <span aria-hidden className="block w-6 h-px bg-brand-green" />
              Know within 60 seconds. Always.
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Everything a freelancer actually needs</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">No enterprise complexity. No per-monitor pricing. Just the tools that matter for client work.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {FEATURES.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it helps */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.2fr] max-[880px]:grid-cols-1 gap-16 items-start max-w-[980px] mx-auto">
            <div>
              <h2 className="text-[clamp(28px,3.4vw,40px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                What it actually changes
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most freelancers start with Beaconmon after a bad downtime incident. Within a week it becomes something they add to every new client setup automatically.
              </p>
              <Link href="/pricing" className="inline-flex items-center gap-2 mt-6 text-[14px] text-brand-green hover:underline">
                See pricing →
              </Link>
            </div>
            <ul className="space-y-5">
              {HOW_IT_HELPS.map((item, i) => (
                <li key={i} className="reveal flex items-start gap-4 bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5">
                  <span className="shrink-0 mt-[2px]"><CheckIcon /></span>
                  <span className="text-[15px] text-brand-dim leading-[1.6]">{item}</span>
                </li>
              ))}
            </ul>
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
            Set up in 5 minutes. Free to start.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. Pro plan at $15/mo for up to 210 monitors.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon Alternatives & Comparisons — How Beaconmon Stacks Up',
  description: 'Honest, side-by-side comparisons of Beaconmon vs UptimeRobot, Pingdom, Better Uptime, and StatusCake. Find the right uptime monitoring tool for your needs.',
  alternates: { canonical: 'https://beaconmon.com/vs' },
};

const COMPETITORS = [
  {
    name: 'UptimeRobot',
    slug: 'uptimerobot',
    tagline: 'Popular free tier, but feature-limited on paid plans.',
    verdict: 'Great for basic ping checks. Beaconmon adds domain expiry, content monitoring, and faster check intervals at the same Pro price.',
    icon: '🤖',
  },
  {
    name: 'Pingdom',
    slug: 'pingdom',
    tagline: 'Enterprise-grade — and enterprise-priced.',
    verdict: 'No free plan, status pages cost extra, and domain monitoring isn\'t included. Beaconmon covers all of it starting at $15/mo.',
    icon: '📡',
  },
  {
    name: 'Better Uptime',
    slug: 'better-uptime',
    tagline: 'Strong on-call scheduling for large teams.',
    verdict: 'Excellent if you run an on-call rotation. Overkill for freelancers and small agencies — and $10/mo more expensive for comparable features.',
    icon: '⏱️',
  },
  {
    name: 'StatusCake',
    slug: 'statuscake',
    tagline: 'Generous free tier, but paid plans get expensive.',
    verdict: 'Ten free monitors is hard to beat. But paid plans start at $24.99 and content change monitoring is absent entirely.',
    icon: '🎂',
  },
];

const DIFFERENTIATORS = [
  {
    heading: '30-second checks on all paid plans.',
    body: 'Most competitors reserve sub-minute checks for their most expensive tier. Beaconmon\'s $15 Pro plan checks every 30 seconds.',
  },
  {
    heading: 'Domain expiry tracking, included.',
    body: 'Only Beaconmon and a handful of tools track WHOIS-based domain renewals. We include it on every plan because a forgotten domain renewal is the most avoidable downtime there is.',
  },
  {
    heading: 'Content change monitoring.',
    body: 'Track competitor pricing pages, legal terms, and product listings. Get alerted the instant the content at a CSS selector changes. No other tool in this list offers this.',
  },
  {
    heading: 'Built for freelancers and agencies.',
    body: 'Every UX decision was made with people managing multiple client sites in mind — not enterprise DevOps teams with dedicated SRE budgets.',
  },
];

export default function VsHubPage() {
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
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Compare</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            How Beaconmon compares to the alternatives.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[560px] mx-auto">
            Honest, opinionated comparisons. We don&apos;t hide our weaknesses — but we do think we&apos;re the best fit for most freelancers and agencies.
          </p>
        </div>
      </section>

      {/* Competitor cards */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Pick a comparison</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Each page goes deep on features, pricing, and who each tool is actually built for.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {COMPETITORS.map(({ name, slug, tagline, verdict, icon }) => (
              <Link
                key={slug}
                href={`/vs/${slug}`}
                className="reveal group bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 hover:border-[rgba(0,229,122,0.3)] transition-colors"
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span className="text-[32px] leading-none">{icon}</span>
                  </div>
                  <span className="text-brand-green text-[13px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Compare →
                  </span>
                </div>
                <h3 className="text-[20px] font-bold tracking-[-0.02em] mb-2">
                  Beaconmon vs {name}
                </h3>
                <p className="text-brand-green text-[13px] font-semibold mb-3">{tagline}</p>
                <p className="text-brand-dim text-[14px] leading-[1.6]">{verdict}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">
              What makes Beaconmon different
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">
              A few things we do that none of the alternatives do quite as well.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {DIFFERENTIATORS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Common questions</h2>
          </div>
          <div className="space-y-8">
            {[
              {
                q: 'Is Beaconmon cheaper than the alternatives?',
                a: 'On a per-feature basis, yes. UptimeRobot\'s paid plan starts at $7/mo but lacks domain expiry and content monitoring. Pingdom has no free plan and starts at $15/mo for fewer monitors. Better Uptime starts at $25/mo. Beaconmon Pro is $15/mo with all monitor types, 5 regions, and custom-domain status pages included.',
              },
              {
                q: 'Which tool should I choose if I just need basic ping checks?',
                a: 'If you only need simple HTTP uptime monitoring for personal projects and you want the most monitors for free, UptimeRobot\'s 50-monitor free tier is hard to beat. Beaconmon\'s free tier (10 monitors) is better suited to people who will outgrow it and need the paid features.',
              },
              {
                q: 'Does Beaconmon have on-call scheduling like Better Uptime?',
                a: 'Not yet. Better Uptime and PagerDuty are strong choices if you run on-call rotations with escalation policies. Beaconmon is designed for freelancers and small agencies where a Slack alert to the team is sufficient.',
              },
              {
                q: 'Can I migrate my monitors from UptimeRobot or Pingdom?',
                a: 'There\'s no one-click importer, but setup is fast — each monitor takes about 30 seconds to configure. Most users are fully migrated in under 20 minutes.',
              },
              {
                q: 'What makes content change monitoring unique to Beaconmon?',
                a: 'None of the competitors in this list — UptimeRobot, Pingdom, Better Uptime, or StatusCake — offer content change detection. Beaconmon takes an HTML snapshot on first run and alerts you the moment a CSS-selector target changes. It\'s purpose-built for tracking competitor pricing, product availability, and legal terms.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="reveal border-b border-brand-line-soft pb-8 last:border-b-0 last:pb-0">
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.7]">{a}</p>
              </div>
            ))}
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
            See for yourself.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. No credit card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

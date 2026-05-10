import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uptime Monitoring for Agencies — Beaconmon',
  description: 'Beaconmon helps agencies monitor every client site from one dashboard, with instant alerts, custom status pages, and domain expiry tracking.',
};

const FEATURES = [
  {
    heading: 'One dashboard for all your clients',
    body: 'Monitor every site you manage — your own and your clients\' — from a single Beaconmon workspace. No juggling multiple accounts or logins.',
  },
  {
    heading: 'White-label status pages',
    body: 'Give each client a status page at their own domain (status.theirdomain.com). Looks like yours. Takes two minutes to configure. Clients feel taken care of without calling you.',
  },
  {
    heading: 'Domain expiry tracking',
    body: 'You registered that domain for a client three years ago and it auto-renews to a card that might not work. Beaconmon watches every domain and alerts you 30, 14, and 7 days before expiry.',
  },
  {
    heading: 'Instant Slack alerts',
    body: 'Get alerted in your team\'s Slack channel the moment a client site goes down. The whole team sees it together. No one has to forward emails.',
  },
];

const HOW_IT_HELPS = [
  'Know about client downtime before the client calls — usually within 60 seconds of failure.',
  'Catch SSL and domain expirations before they cause outages and uncomfortable conversations.',
  'Give clients a professional status page instead of radio silence during incidents.',
  'Monitor site content for unexpected changes — a broken deploy can serve the wrong page even on a 200.',
];

export default function ForAgenciesPage() {
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">For Agencies</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px]">
            Monitor every client site.<br />
            <span className="text-brand-green">Know before they do.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            Beaconmon lets you watch every site you manage from one place — with instant alerts, client-facing status pages, and the domain expiry tracking that saves you from the worst kind of phone call.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 5 monitors. 14-day Business trial, no card required.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal bg-[radial-gradient(ellipse_at_top,rgba(255,68,68,0.04),transparent_60%),#0E0E14] border border-brand-line rounded-[20px] px-[60px] py-20 max-[640px]:px-6 max-[640px]:py-12 text-center max-w-[920px] mx-auto relative overflow-hidden">
            <span aria-hidden className="absolute top-[10px] left-10 font-serif text-[160px] text-brand-line leading-none select-none">&ldquo;</span>
            <blockquote className="relative m-0 text-[clamp(22px,2.8vw,32px)] leading-[1.3] font-semibold tracking-[-0.02em] max-w-[720px] mx-auto mb-6">
              I found out my client&apos;s e-commerce store was down because they called me at 7am on a Saturday.
            </blockquote>
            <p className="text-brand-dim text-[15px] max-w-[560px] mx-auto mb-7 leading-[1.6]">
              It happens to every agency eventually. The site goes down overnight. The client wakes up, tries to check their store, and calls you in a panic. By the time you&apos;re up to speed, they&apos;ve already formed an opinion about how well you&apos;re managing their infrastructure.
            </p>
            <span className="text-brand-green text-[15px] font-semibold inline-flex items-center gap-[10px]">
              <span aria-hidden className="block w-6 h-px bg-brand-green" />
              Beaconmon makes sure you&apos;re the one making that call, not receiving it.
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for the way agencies work</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Managing multiple clients means needing different things than a solo dev watching their own project.</p>
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
                How agencies use Beaconmon
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                Most agencies add Beaconmon to every new client retainer. It takes five minutes per site and pays for itself the first time it catches a late-night outage before the client does.
              </p>
              <Link href="/pricing" className="inline-flex items-center gap-2 mt-6 text-[14px] text-brand-green hover:underline">
                See Business plan pricing →
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
            Add monitoring to every retainer.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Start with 5 monitors free. Business plan starts at $59/mo for unlimited monitors.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

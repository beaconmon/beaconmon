import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import IntelligenceMockup from '@/components/marketing/IntelligenceMockup';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Monitoring for Solo Founders | Beaconmon',
  description: 'Website monitoring built for solo founders. Instant Slack and email alerts while you sleep, smart anomaly detection so you stop getting paged for nothing, and a free tier for 10 monitors.',
  alternates: { canonical: 'https://beaconmon.com/for/solo-founders' },
};

const TEMPLATE_MONITORS = [
  { name: 'Main site', type: 'HTTP', interval: '1 min', detail: 'Status code + response time threshold' },
  { name: 'Payment / checkout page', type: 'HTTP + Keyword', interval: '1 min', detail: 'Keyword: "Pay" or "Subscribe"' },
  { name: 'Critical API endpoint', type: 'HTTP', interval: '1 min', detail: 'Public health endpoint' },
  { name: 'Competitor pricing page', type: 'Content', interval: '15 min', detail: 'CSS selector: .price' },
];

const FEATURES = [
  {
    heading: 'Instant alerts to where you already are',
    body: 'Slack DMs, email, and webhooks. No new app to install, no dashboard to babysit. The alert finds you whether you are heads-down coding or at dinner.',
  },
  {
    heading: 'Free forever for 10 monitors',
    body: 'No card required, no time-limited "free trial" that quietly turns into a $29/mo bill. Ten monitors on a 5-minute interval is enough to cover the site, checkout, API, and a few competitor pages.',
  },
  {
    heading: 'Smart anomaly detection so no alert fatigue',
    body: 'Beaconmon uses z-score outlier detection on response time. You get an alert when something actually changes, not every time a page is 200ms slow at 3 AM. One founder, one notification.',
  },
  {
    heading: 'Competitor tracking out of the box',
    body: 'Add competitor pricing and homepages as content monitors. Know when a competitor moves before a customer asks you why your price is higher.',
  },
];

export default function ForSoloFoundersPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema({ name: 'For Solo Founders', path: '/for/solo-founders' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">For Solo Founders</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Monitoring for the Founder Who Cannot Watch Their Site 24/7<br />
            <span className="text-brand-green-ink">Instant alerts while you sleep. Free for 10 monitors.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            You are the support team, the engineer, and the salesperson. Beaconmon is the night watch. Get a Slack ping the moment something breaks, with smart noise filtering so you only hear about what matters.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 10 monitors. No card required.
          </p>
        </div>
      </section>

      {/* Intelligence mockup */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-12">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">One feed for everything you care about</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Site changes, smart alerts, and competitor moves, summarized so you can act in two minutes a day.</p>
          </div>
          <div className="reveal">
            <IntelligenceMockup
              storeLabel="yourstartup.com"
              stats={{ competitorMoves: 1, storeChanges: 1, storeChangesLabel: 'deploy detected', smartAlerts: 1, smartAlertsLabel: 'slow response' }}
              events={[
                { type: 'competitor', icon: '↓', label: 'Competitor lowered price', detail: 'Competitor cut Pro plan from $49 to $39', timeAgo: '20 min ago' },
                { type: 'store', icon: '⚡', label: 'Deploy detected', detail: 'Homepage hash changed, 200 OK confirmed', timeAgo: '2 hr ago' },
                { type: 'alert', icon: '⚠', label: 'Smart alert', detail: '/api/health p95 climbed to 1.8s', timeAgo: '4 hr ago' },
              ]}
              slackNotification={{ title: 'Site is up', body: 'Deploy went through cleanly. No errors detected on main pages.', timeAgo: '2 hr ago', channel: '#alerts' }}
            />
          </div>
        </div>
      </section>

      {/* Template monitors */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">A solo founder monitoring template</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Four monitors that cover everything that actually matters for a one-person company.</p>
          </div>
          <div className="reveal grid grid-cols-1 gap-3 max-w-[700px] mx-auto">
            {TEMPLATE_MONITORS.map((monitor) => (
              <div key={monitor.name} className="bg-brand-bg1 border border-brand-line-soft rounded-[14px] p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-bold text-[15px] text-brand-text">{monitor.name}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        monitor.type === 'Content'
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-[rgba(0,229,122,0.1)] text-brand-green-ink'
                      }`}
                    >
                      {monitor.type}
                    </span>
                    <span className="text-[12px] text-brand-muted">{monitor.interval}</span>
                  </div>
                  <p className="text-[13px] text-brand-dim">{monitor.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Built for one-person companies</h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">Less noise. More signal. Generous free tier.</p>
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

      {/* Internal links */}
      <section className="py-12 border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center">
          <p className="text-brand-muted text-[13px] tracking-[0.06em] uppercase mb-4">See also</p>
          <div className="flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/pricing" className="text-brand-dim hover:text-brand-text transition-colors">Pricing</Link>
            <Link href="/for/ecommerce" className="text-brand-dim hover:text-brand-text transition-colors">E-commerce monitoring</Link>
            <Link href="/features" className="text-brand-dim hover:text-brand-text transition-colors">All features</Link>
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
            Sleep better. Let Beaconmon watch the site.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. No card required.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

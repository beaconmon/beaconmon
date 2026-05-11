import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations — Beaconmon',
  description: 'Beaconmon sends alerts via email, Slack, and webhooks. Connect your monitoring to the tools you already use.',
};

interface PreviewLine {
  label: string | null;
  value: string;
  red?: boolean;
  bold?: boolean;
}

interface IntegrationPreview {
  subject: string | null;
  lines: PreviewLine[];
  footer: string | null;
}

interface Integration {
  name: string;
  description: string;
  available: boolean;
  plan: string;
  preview: IntegrationPreview;
}

function getLineClassName(line: PreviewLine): string {
  if (line.red) return 'text-red-400';
  if (line.bold) return 'text-brand-text font-semibold';
  return 'text-brand-dim';
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Email',
    description: 'Instant alert emails the moment a monitor goes down or recovers. Formatted to be clear at a glance — no digging through paragraphs to understand what happened.',
    available: true,
    plan: 'All plans',
    preview: {
      subject: '🔴 [DOWN] acme-storefront.com',
      lines: [
        { label: 'Monitor', value: 'acme-storefront.com (HTTP)' },
        { label: 'Status', value: '503 Service Unavailable', red: true },
        { label: 'Location', value: 'US East + EU West' },
        { label: 'Started', value: '2026-05-08 14:23:07 UTC' },
        { label: 'Response time', value: '—' },
      ],
      footer: 'View incident → Acknowledge → Suppress for 30 min',
    },
  },
  {
    name: 'Slack',
    description: 'Beaconmon posts to any Slack channel when a monitor changes state. Your team sees it together — no more "did you get the email?" conversations.',
    available: true,
    plan: 'Pro & Business',
    preview: {
      subject: null,
      lines: [
        { label: 'app', value: 'Beaconmon', bold: true },
        { label: null, value: '🔴 acme-storefront.com is DOWN', bold: true },
        { label: null, value: 'Status: 503 · US East + EU West confirmed' },
        { label: null, value: 'Down for 2 min 14 sec · View incident →' },
      ],
      footer: null,
    },
  },
  {
    name: 'Webhooks',
    description: 'Send a JSON payload to any URL when a monitor event fires. Build custom automations — auto-create a Jira ticket, post to Discord, trigger a PagerDuty alert, or anything else your stack needs.',
    available: true,
    plan: 'Pro & Business',
    preview: {
      subject: 'POST https://your-endpoint.com/webhook',
      lines: [
        { label: 'event', value: '"monitor.down"' },
        { label: 'monitor_id', value: '"mon_abc123"' },
        { label: 'url', value: '"https://acme-storefront.com"' },
        { label: 'status_code', value: '503' },
        { label: 'confirmed_locations', value: '["us-east", "eu-west"]' },
        { label: 'incident_id', value: '"inc_xyz789"' },
      ],
      footer: null,
    },
  },
];

const COMING_SOON = [
  {
    name: 'SMS',
    description: 'Text alerts for when email and Slack aren\'t enough. Ideal for on-call scenarios or critical production monitors. Business plan only.',
    plan: 'Business',
  },
];

export default function IntegrationsPage() {
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Integrations</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px] mx-auto">
            Get alerted wherever your team works.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[560px] mx-auto">
            Email, Slack, and webhooks — so you can plug Beaconmon into the tools you already use, or build your own automation on top.
          </p>
        </div>
      </section>

      {/* Integration cards */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="space-y-6">
            {INTEGRATIONS.map(({ name, description, plan, preview }) => (
              <div key={name} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1">
                  {/* Left */}
                  <div className="p-10 max-[880px]:p-8 border-r border-brand-line-soft max-[880px]:border-r-0 max-[880px]:border-b">
                    <div className="inline-block text-[11px] font-semibold px-2 py-[3px] rounded bg-[rgba(0,229,122,0.1)] text-brand-green border border-[rgba(0,229,122,0.2)] mb-5">
                      {plan}
                    </div>
                    <h2 className="text-[26px] font-bold tracking-[-0.025em] mb-4">{name}</h2>
                    <p className="text-brand-dim text-[15px] leading-[1.65]">{description}</p>
                  </div>
                  {/* Right — preview */}
                  <div className="p-8 max-[880px]:p-6 flex items-center">
                    <div className="w-full bg-brand-bg2 border border-brand-line rounded-[10px] overflow-hidden text-[12px] font-mono">
                      {preview.subject && (
                        <div className="px-4 py-3 border-b border-brand-line text-brand-muted text-[11px]">
                          {preview.subject}
                        </div>
                      )}
                      <div className="p-4 space-y-[6px]">
                        {preview.lines.map((line, i) => (
                          <div key={i} className="flex gap-3">
                            {line.label && (
                              <span className="text-brand-muted shrink-0 w-[120px]">{line.label}:</span>
                            )}
                            <span className={getLineClassName(line)}>
                              {line.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      {preview.footer && (
                        <div className="px-4 py-3 border-t border-brand-line text-brand-green text-[11px]">
                          {preview.footer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Coming soon</h2>
            <p className="text-brand-dim text-[15px]">More ways to get alerted, without leaving this page to check your monitoring tool.</p>
          </div>
          <div className="grid grid-cols-3 max-[640px]:grid-cols-1 gap-5 max-w-[780px] mx-auto">
            {COMING_SOON.map(({ name, description, plan }) => (
              <div key={name} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7 opacity-70">
                <div className="inline-block text-[11px] font-semibold px-2 py-[3px] rounded bg-brand-bg3 text-brand-muted border border-brand-line mb-4">
                  {plan}
                </div>
                <h3 className="text-[17px] font-bold tracking-[-0.015em] mb-2">{name}</h3>
                <p className="text-brand-dim text-[13px] leading-[1.6]">{description}</p>
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
            Ready to get alerted in the right place?
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Set up monitoring in 5 minutes. Free forever for 10 monitors.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

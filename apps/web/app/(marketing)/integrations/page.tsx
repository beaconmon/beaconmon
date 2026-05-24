import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Alert Integrations: Email, Slack & Webhooks | Beaconmon',
  description: 'Beaconmon sends downtime alerts via email, Slack, and webhooks. Route alerts to the tools your team already uses, or build your own automation on top of the JSON payload.',
  alternates: { canonical: 'https://beaconmon.com/integrations' },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I send alerts to multiple channels at the same time?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can add as many alert channels as your plan allows and each monitor can notify any combination of them.' },
    },
    {
      '@type': 'Question',
      name: 'What events trigger an alert?',
      acceptedAnswer: { '@type': 'Answer', text: 'Beaconmon fires an alert when a monitor transitions to DOWN (after 2 consecutive failed checks) and again when it recovers to UP. SSL and domain expiry warnings fire at 30, 14, and 7 days before expiry.' },
    },
    {
      '@type': 'Question',
      name: 'How do I connect Beaconmon to Slack?',
      acceptedAnswer: { '@type': 'Answer', text: 'In the dashboard, go to Alert Channels, Add Channel, then Slack. Authorise via Slack OAuth and pick a channel. No webhook URL to copy-paste.' },
    },
    {
      '@type': 'Question',
      name: 'What does the webhook payload look like?',
      acceptedAnswer: { '@type': 'Answer', text: 'The POST body is a JSON object with event, monitor_id, url, status_code, confirmed_locations, incident_id, started_at, and optionally duration_ms on recovery. HTTPS only.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use webhooks to connect to PagerDuty, Discord, or Jira?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Point the channel at a PagerDuty Events API URL, a Discord channel webhook URL, or your own function to open a Jira ticket.' },
    },
    {
      '@type': 'Question',
      name: 'Is there a retry policy if my webhook endpoint is down?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Beaconmon retries failed webhook deliveries up to 5 times with exponential backoff.' },
    },
  ],
};

const INTEGRATIONS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Beaconmon Alert Integrations',
  description: 'Beaconmon sends alerts via email, Slack, and webhooks. Connect your monitoring to the tools you already use.',
  url: 'https://beaconmon.com/integrations',
  numberOfItems: 3,
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Email', description: 'Instant alert emails the moment a monitor goes down or recovers.' },
    { '@type': 'ListItem', position: 2, name: 'Slack', description: 'Beaconmon posts to any Slack channel when a monitor changes state.' },
    { '@type': 'ListItem', position: 3, name: 'Webhooks', description: 'Send a JSON payload to any URL when a monitor event fires.' },
  ],
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
    description: 'Instant alert emails the moment a monitor goes down or recovers. Formatted to be clear at a glance, with no digging through paragraphs to understand what happened.',
    available: true,
    plan: 'All plans',
    preview: {
      subject: '🔴 [DOWN] acme-storefront.com',
      lines: [
        { label: 'Monitor', value: 'acme-storefront.com (HTTP)' },
        { label: 'Status', value: '503 Service Unavailable', red: true },
        { label: 'Location', value: 'US East + EU West' },
        { label: 'Started', value: '2026-05-08 14:23:07 UTC' },
        { label: 'Response time', value: 'N/A' },
      ],
      footer: 'View incident → Acknowledge → Suppress for 30 min',
    },
  },
  {
    name: 'Slack',
    description: 'Beaconmon posts to any Slack channel when a monitor changes state. Your team sees it together. No more "did you get the email?" conversations.',
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
    description: 'Send a JSON payload to any URL when a monitor event fires. Build custom automations: auto-create a Jira ticket, post to Discord, trigger a PagerDuty alert, or anything else your stack needs.',
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
      <JsonLd data={[INTEGRATIONS_SCHEMA, FAQ_SCHEMA]} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Integrations</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px] mx-auto">
            Get alerted wherever your team works.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[560px] mx-auto">
            Email, Slack, and webhooks, so you can plug Beaconmon into the tools you already use, or build your own automation on top.
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
                    <div className="inline-block text-[11px] font-semibold px-2 py-[3px] rounded bg-[rgba(0,229,122,0.1)] text-brand-green-ink border border-[rgba(0,229,122,0.2)] mb-5">
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
                        <div className="px-4 py-3 border-t border-brand-line text-brand-green-ink text-[11px]">
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

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Alert integration FAQ</h2>
          </div>
          <div className="space-y-8">
            {[
              {
                q: 'Can I send alerts to multiple channels at the same time?',
                a: 'Yes. You can add as many alert channels as your plan allows (Pro: up to 5, Business: unlimited) and each monitor can notify any combination of them. Use email for your own inbox, Slack for your team, and a webhook for your ticketing system, all from the same monitor.',
              },
              {
                q: 'What events trigger an alert?',
                a: 'Beaconmon fires an alert when a monitor transitions to DOWN (after 2 consecutive failed checks from multiple locations) and again when it recovers to UP. SSL and domain expiry warnings fire on a tiered schedule at 30, 14, and 7 days before expiry. You can choose to receive only DOWN alerts, only recovery alerts, or both.',
              },
              {
                q: 'How do I connect Beaconmon to Slack?',
                a: 'In the dashboard, go to Alert Channels → Add Channel → Slack. You\'ll be prompted to authorise via Slack OAuth and pick a channel. No webhook URL to copy-paste. It\'s a single click.',
              },
              {
                q: 'What does the webhook payload look like?',
                a: 'The POST body is a JSON object with event (monitor.down or monitor.up), monitor_id, url, status_code, confirmed_locations (array of region slugs), incident_id, started_at, and optionally duration_ms on recovery. HTTPS only; Beaconmon does not follow redirects for security reasons.',
              },
              {
                q: 'Can I use webhooks to connect to PagerDuty, Discord, or Jira?',
                a: 'Yes. Webhooks are designed for exactly this. Point the channel at a PagerDuty Events API URL to auto-create incidents, a Discord channel webhook URL for team notifications, or your own serverless function to open a Jira ticket. Any service that accepts an inbound HTTP POST will work.',
              },
              {
                q: 'Is there a retry policy if my webhook endpoint is down?',
                a: 'Yes. Beaconmon retries failed webhook deliveries up to 5 times with exponential backoff. If all retries fail, the failure is logged and visible in the channel\'s delivery history so you can investigate.',
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

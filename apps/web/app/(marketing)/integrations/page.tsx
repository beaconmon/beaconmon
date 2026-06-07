import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations: Shopify, Alerts & Webhooks | Beaconmon',
  description:
    'Beaconmon connects to Shopify product feeds for competitor price and inventory tracking, and sends alerts via email, Slack, and webhooks.',
  alternates: { canonical: 'https://beaconmon.com/integrations' },
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does Beaconmon have a Shopify App Store app?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Not yet. Beaconmon connects directly to public Shopify store URLs. There is nothing to install in your Shopify admin panel.',
      },
    },
    {
      '@type': 'Question',
      name: 'What Shopify data can Beaconmon track?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We monitor the public /products.json feed, which includes product titles, variants, prices, and availability. We also monitor any page on a Shopify store for content changes, including homepages, collection pages, and promotional banners.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I send alerts to multiple channels at the same time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can add as many alert channels as your plan allows and each monitor can notify any combination of them.',
      },
    },
    {
      '@type': 'Question',
      name: 'What events trigger an alert?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Beaconmon fires an alert when a monitor transitions to DOWN (after 2 consecutive failed checks) and again when it recovers to UP. Content change monitors fire when a tracked HTML element changes. SSL and domain expiry warnings fire at 30, 14, and 7 days before expiry.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I connect Beaconmon to Slack?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In the dashboard, go to Alert Channels, Add Channel, then Slack. Authorise via Slack OAuth and pick a channel. No webhook URL to copy-paste.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the webhook payload look like?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The POST body is a JSON object with event, monitor_id, url, status_code, confirmed_locations, incident_id, started_at, and optionally duration_ms on recovery. HTTPS only.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a retry policy if my webhook endpoint is down?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Beaconmon retries failed webhook deliveries up to 5 times with exponential backoff.',
      },
    },
  ],
};

const INTEGRATIONS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Beaconmon Integrations',
  description:
    'Beaconmon connects to Shopify product feeds for competitor tracking and sends alerts via email, Slack, and webhooks.',
  url: 'https://beaconmon.com/integrations',
  numberOfItems: 4,
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Shopify product feed',
      description:
        'Monitor any public Shopify store product catalog for price changes, new product launches, and inventory updates.',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Email',
      description: 'Instant alert emails the moment a monitor goes down or recovers.',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Slack',
      description: 'Beaconmon posts to any Slack channel when a monitor changes state.',
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Webhooks',
      description: 'Send a JSON payload to any URL when a monitor event fires.',
    },
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
  plan: string;
  preview: IntegrationPreview;
  disclosure?: string;
}

function getLineClassName(line: PreviewLine): string {
  if (line.red) return 'text-red-400';
  if (line.bold) return 'text-brand-text font-semibold';
  return 'text-brand-dim';
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const { name, description, plan, preview, disclosure } = integration;
  return (
    <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1">
        <div className="p-10 max-[880px]:p-8 border-r border-brand-line-soft max-[880px]:border-r-0 max-[880px]:border-b">
          <div className="inline-block text-[11px] font-semibold px-2 py-[3px] rounded bg-[rgba(0,229,122,0.1)] text-brand-green-ink border border-[rgba(0,229,122,0.2)] mb-5">
            {plan}
          </div>
          <h3 className="text-[26px] font-bold tracking-[-0.025em] mb-4">{name}</h3>
          <p className="text-brand-dim text-[15px] leading-[1.65]">{description}</p>
          {disclosure && (
            <div className="mt-5 px-4 py-3 rounded-lg bg-[rgba(255,200,0,0.05)] border border-[rgba(255,200,0,0.18)] text-[13px] text-brand-dim leading-[1.6]">
              <span className="font-semibold text-brand-text">Note: </span>
              {disclosure}
            </div>
          )}
        </div>
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
                  <span className={getLineClassName(line)}>{line.value}</span>
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
  );
}

const STORE_CONNECTIONS: Integration[] = [
  {
    name: 'Shopify product feed',
    description:
      'Monitor any public Shopify store\'s product catalog for price changes, new product launches, inventory updates, and promotional copy changes. Beaconmon polls the /products.json feed automatically. No API keys or Shopify credentials needed.',
    plan: 'All plans',
    disclosure:
      'Beaconmon is not yet available in the Shopify App Store. You connect by entering a store URL directly. Nothing installs in your Shopify admin panel.',
    preview: {
      subject: 'competitor-brand.myshopify.com',
      lines: [
        { label: 'Event', value: 'Price change detected', bold: true },
        { label: 'Product', value: '"Summer Dress - Blue / M"' },
        { label: 'Before', value: '$45.00' },
        { label: 'After', value: '$38.00 (-15%)', red: true },
        { label: 'Detected', value: '2026-06-07 09:12 UTC' },
      ],
      footer: 'View change → Set alert threshold →',
    },
  },
];

const ALERT_CHANNELS: Integration[] = [
  {
    name: 'Email',
    description:
      'Instant alert emails the moment a monitor goes down or recovers. Formatted to be clear at a glance, with no digging through paragraphs to understand what happened.',
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
    description:
      'Beaconmon posts to any Slack channel when a monitor changes state. Your team sees it together. No more "did you get the email?" conversations.',
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
    description:
      'Send a JSON payload to any URL when a monitor event fires. Build custom automations: auto-create a Jira ticket, post to Discord, trigger a PagerDuty alert, or anything else your stack needs.',
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

export default function IntegrationsPage() {
  return (
    <>
      <JsonLd data={[INTEGRATIONS_SCHEMA, FAQ_SCHEMA]} />
      <JsonLd data={breadcrumbSchema({ name: 'Integrations', path: '/integrations' })} />
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Integrations
          </span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[860px] mx-auto">
            Connect to Shopify stores and get alerted where your team works.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mx-auto">
            Beaconmon reads public Shopify product feeds for competitor tracking, and routes alerts to email, Slack, or any webhook endpoint you choose.
          </p>
        </div>
      </section>

      {/* Store connections */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <h2 className="text-[clamp(20px,2.4vw,28px)] font-bold tracking-[-0.02em] mb-8 text-brand-green-ink">
            Store connections
          </h2>
          <div className="space-y-6">
            {STORE_CONNECTIONS.map((integration) => (
              <IntegrationCard key={integration.name} integration={integration} />
            ))}
          </div>
        </div>
      </section>

      {/* Alert channels */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <h2 className="text-[clamp(20px,2.4vw,28px)] font-bold tracking-[-0.02em] mb-8 text-brand-green-ink">
            Alert channels
          </h2>
          <div className="space-y-6">
            {ALERT_CHANNELS.map((integration) => (
              <IntegrationCard key={integration.name} integration={integration} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">
              Integration FAQ
            </h2>
          </div>
          <div className="space-y-8">
            {[
              {
                q: 'Does Beaconmon have a Shopify App Store app?',
                a: 'Not yet. Beaconmon connects directly to public Shopify store URLs. There is nothing to install in your Shopify admin panel. You enter a competitor or your own store URL in the dashboard and monitoring starts immediately.',
              },
              {
                q: 'What Shopify data can Beaconmon track?',
                a: 'We monitor the public /products.json feed, which includes product titles, variants, prices, and availability for any public Shopify store. We also watch any page on a Shopify store for content changes, including homepages, collection pages, and promotional banners. Monitoring happens at the HTML source level.',
              },
              {
                q: 'Can I send alerts to multiple channels at the same time?',
                a: 'Yes. You can add as many alert channels as your plan allows (Pro: up to 5, Business: unlimited) and each monitor can notify any combination of them. Use email for your own inbox, Slack for your team, and a webhook for your ticketing system, all from the same monitor.',
              },
              {
                q: 'What events trigger an alert?',
                a: 'Beaconmon fires an alert when a monitor transitions to DOWN (after 2 consecutive failed checks from multiple locations) and again when it recovers to UP. Content change monitors fire when a tracked HTML element changes. SSL and domain expiry warnings fire at 30, 14, and 7 days before expiry.',
              },
              {
                q: 'How do I connect Beaconmon to Slack?',
                a: "In the dashboard, go to Alert Channels, Add Channel, then Slack. You'll be prompted to authorise via Slack OAuth and pick a channel. No webhook URL to copy-paste.",
              },
              {
                q: 'What does the webhook payload look like?',
                a: 'The POST body is a JSON object with event (monitor.down or monitor.up), monitor_id, url, status_code, confirmed_locations (array of region slugs), incident_id, started_at, and optionally duration_ms on recovery. HTTPS only; Beaconmon does not follow redirects for security reasons.',
              },
              {
                q: 'Is there a retry policy if my webhook endpoint is down?',
                a: "Yes. Beaconmon retries failed webhook deliveries up to 5 times with exponential backoff. If all retries fail, the failure is logged and visible in the channel's delivery history so you can investigate.",
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
            Ready to track competitors and get alerted where it matters?
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">
            Set up Shopify competitor monitoring in 5 minutes. Free forever for 1 competitor.
          </p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

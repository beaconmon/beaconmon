import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import CheckIcon from '@/components/marketing/CheckIcon';
import { RevealObserver } from '@/components/reveal-observer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uptime Monitoring for Developers — Beaconmon',
  description: 'Beaconmon gives developers webhook alerts, TCP port monitoring, heartbeat checks for cron jobs, and an API to integrate monitoring into their workflow.',
};

const FEATURES = [
  {
    heading: 'TCP port monitoring',
    body: 'Monitor any service that speaks TCP — databases, Redis instances, mail servers, game servers. If the port becomes unreachable, you know within 60 seconds. No dashboard logins required.',
  },
  {
    heading: 'Heartbeat monitoring for cron jobs',
    body: 'Have your cron jobs and scheduled tasks ping a Beaconmon heartbeat URL on completion. Miss a ping and you get alerted. Configurable grace periods for jobs that occasionally run long.',
  },
  {
    heading: 'Webhook alerts to any endpoint',
    body: 'Send a structured JSON payload to any URL on monitor state changes. Wire it into your incident management system, create Jira tickets automatically, or post to whatever internal tool your team uses.',
  },
  {
    heading: 'Keyword monitoring for deploys',
    body: 'A 200 response doesn\'t mean your app is working. Keyword monitoring verifies that specific content is present in the response body — catch broken deploys that serve an empty page or an error message with a 200 status.',
  },
  {
    heading: 'Multi-location false alarm elimination',
    body: 'Beaconmon only fires an alert when two or more geographic regions confirm the failure. Single-location blips don\'t page you. When you get an alert, it\'s real.',
  },
  {
    heading: 'SLO tracking with burn-rate alerts',
    body: 'Set per-monitor uptime targets. Beaconmon tracks your error budget in real time and fires burn-rate alerts before your SLO period is blown. Fast and slow burn thresholds are both configurable.',
  },
];

const WEBHOOK_PREVIEW = {
  lines: [
    '// POST to your endpoint on every status change',
    '{',
    '  "event": "monitor.down",',
    '  "monitor_id": "mon_abc123",',
    '  "url": "https://api.yourdomain.com",',
    '  "type": "http",',
    '  "status_code": 503,',
    '  "response_time_ms": null,',
    '  "confirmed_locations": ["us-east", "eu-west"],',
    '  "incident_id": "inc_xyz789",',
    '  "started_at": "2026-05-08T14:23:07Z"',
    '}',
  ],
};

const WEBHOOK_PAYLOAD_FIELDS = [
  { id: 'monitor-details', label: 'Monitor ID, URL, type, status code' },
  { id: 'locations', label: 'Confirmed check locations' },
  { id: 'incident-id', label: 'Incident ID for correlation' },
  { id: 'response-time', label: 'Response time (when available)' },
];

const HOW_IT_HELPS = [
  'Know when production breaks before users file a bug report.',
  'Monitor every layer of your stack — HTTP APIs, TCP services, and scheduled jobs.',
  'Build custom alerting pipelines using webhook payloads.',
  'Suppress false alerts during planned deployments with deploy-aware monitoring.',
];

export default function ForDevelopersPage() {
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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">For Developers</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Monitoring that fits how developers actually work.<br />
            <span className="text-brand-green">Not just ping checks.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px] mb-8">
            TCP monitoring, heartbeats for cron jobs, webhook alerts you can pipe into anything, and keyword checks that catch broken deploys before users do.
          </p>
          <CtaForm />
          <p className="mt-[14px] text-[13px] text-brand-muted">
            Free forever for 5 monitors. No credit card required.
          </p>
        </div>
      </section>

      {/* Webhook preview */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal grid grid-cols-[1fr_1.1fr] max-[880px]:grid-cols-1 gap-16 items-center max-w-[1000px] mx-auto">
            <div>
              <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-4">Webhooks</span>
              <h2 className="text-[clamp(26px,3vw,38px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.15]">
                Pipe alerts into anything.
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65] mb-5">
                Every monitor state change fires a structured JSON payload to your endpoint. Wire it into PagerDuty, create Jira tickets, post to Discord, or build whatever automation your team needs.
              </p>
              <ul className="space-y-3">
                {WEBHOOK_PAYLOAD_FIELDS.map(({ id, label }) => (
                  <li key={id} className="flex items-start gap-3 text-[14px] text-brand-dim">
                    <span className="mt-[5px] w-[5px] h-[5px] rounded-full bg-brand-green shrink-0" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-bg1 border border-brand-line-soft rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-brand-line-soft text-[11px] font-mono text-brand-muted flex items-center gap-2">
                <span className="w-[8px] h-[8px] rounded-full bg-brand-red" />
                <span className="w-[8px] h-[8px] rounded-full bg-yellow-500" />
                <span className="w-[8px] h-[8px] rounded-full bg-brand-green" />
                <span className="ml-2">webhook payload</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-[1.8] text-brand-dim space-y-0">
                {WEBHOOK_PREVIEW.lines.map((line, i) => (
                  <div key={i} className={line.startsWith('//') ? 'text-brand-muted' : line === '{' || line === '}' ? 'text-brand-text' : ''}>
                    {line.startsWith('  "event"') || line.startsWith('  "type"') || line.startsWith('  "status_code"') ? (
                      <span>
                        <span className="text-brand-green">{line.split(':')[0]}</span>
                        {':' + line.split(':').slice(1).join(':')}
                      </span>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">Monitor more than just HTTP endpoints</h2>
            <p className="text-brand-dim text-[16px] max-w-[520px] mx-auto">Six monitor types so you can watch every part of your stack, not just the public-facing URLs.</p>
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
                Stop finding out from users
              </h2>
              <p className="text-brand-dim text-[15px] leading-[1.65]">
                The worst way to find out production is broken is a GitHub issue or a Slack message from a user. Beaconmon catches failures in under 60 seconds and tells you before anyone else.
              </p>
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
            Add monitoring to your stack today.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 5 monitors. No credit card. No agents to install.</p>
          <CtaForm className="mx-auto mb-5" />
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

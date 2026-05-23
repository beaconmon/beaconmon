import NavBar from '@/components/marketing/NavBar';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security | Beaconmon',
  description: 'How Beaconmon handles your data: infrastructure, encryption, access controls, GDPR, and responsible disclosure.',
  alternates: { canonical: 'https://beaconmon.com/security' },
};

const SECTIONS = [
  {
    id: 'infrastructure',
    heading: 'Infrastructure',
    items: [
      {
        title: 'Compute: Hetzner Cloud',
        body: 'Beaconmon runs on Hetzner Cloud servers located in Nuremberg, Germany (EU). Hetzner is ISO 27001 certified and operates its own data centers. We use dedicated VPS instances with no shared CPU resources.',
      },
      {
        title: 'Database: Neon (PostgreSQL)',
        body: 'All persistent data is stored in Neon, a serverless PostgreSQL provider running on AWS us-east-2. Neon encrypts data at rest using AES-256 and provides point-in-time recovery. We use connection pooling and separate direct/pooled URLs. Migrations only run from controlled environments.',
      },
      {
        title: 'Edge & DDoS protection: Cloudflare',
        body: 'All traffic to beaconmon.com passes through Cloudflare. Cloudflare handles TLS termination (TLS 1.2 minimum, TLS 1.3 preferred), DDoS mitigation, and bot protection. The origin IP is not publicly exposed.',
      },
      {
        title: 'Cache: Redis (self-hosted)',
        body: 'Redis is self-hosted in the same stack as the application, used for job queues and status page caching. It is not exposed to the internet. AOF persistence is enabled. Redis is configured with noeviction policy. Queue jobs are never silently dropped under memory pressure.',
      },
    ],
  },
  {
    id: 'encryption',
    heading: 'Encryption',
    items: [
      {
        title: 'In transit',
        body: 'All connections between your browser and Beaconmon are encrypted via TLS 1.2+. Internal service-to-service communication happens within the same private network and does not traverse the public internet. Database connections from workers to Neon use TLS.',
      },
      {
        title: 'At rest',
        body: 'Database data at rest is encrypted by Neon (AES-256). Session tokens are stored as hashed values; the raw token is never persisted. Alert channel credentials (Slack webhook URLs, custom webhook secrets) are stored encrypted in the database.',
      },
      {
        title: 'Passwords',
        body: 'Beaconmon supports email magic links (no passwords) and optional password-based login. All passwords are hashed with bcrypt (cost factor 12) and the plaintext is never logged or stored.',
      },
    ],
  },
  {
    id: 'access',
    heading: 'Access controls',
    items: [
      {
        title: 'Tenant isolation',
        body: 'Every database query that touches user data is scoped to a team ID. There is no code path that allows one team to read another team\'s monitors, check results, or alert channels. This is enforced at the repository layer, not the API layer, so it cannot be bypassed by route bugs.',
      },
      {
        title: 'Role-based access',
        body: 'Teams have three roles: Owner (full access + billing), Admin (full access, no billing), and Viewer (read-only). Role is checked on every mutation. Viewers cannot create, edit, or delete anything.',
      },
      {
        title: 'Rate limiting',
        body: 'Monitor creation is rate-limited to 20 requests per hour per team. Auth endpoints are rate-limited to 10 requests per 15 minutes per IP. Rate limit state is stored in Redis. If Redis is unavailable, limits fail open rather than blocking legitimate traffic.',
      },
      {
        title: 'Internal access',
        body: 'No Beaconmon employee has routine access to customer monitor data. Database access for debugging requires an explicit, time-limited connection from a developer machine. We do not have a customer support portal that exposes raw data.',
      },
    ],
  },
  {
    id: 'gdpr',
    heading: 'GDPR & data privacy',
    items: [
      {
        title: 'Data location',
        body: 'Primary compute is in Germany (EU). Database is on Neon (AWS us-east-2, US). If your data residency requirements mandate EU-only storage, Beaconmon may not be the right fit today. We\'re working on an EU database option.',
      },
      {
        title: 'What we store',
        body: 'We store your email address, team name, monitor configurations, check results, incidents, and alert channel configs. We do not store the content of the sites you monitor beyond what is needed for content change detection (one snapshot per change event).',
      },
      {
        title: 'Data retention',
        body: 'Check results are retained for 365 days for all plans. If you delete your account, all associated data is deleted within 30 days. We do not sell your data to third parties.',
      },
      {
        title: 'Cookies',
        body: 'We use one session cookie for authentication. No tracking cookies, no third-party ad cookies. We use Sentry for error tracking (which may capture browser metadata on exceptions) and that\'s it.',
      },
    ],
  },
];

export default function SecurityPage() {
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
            left: '-10%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(0,229,122,0.12), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Security</span>
          <h1 className="text-[clamp(40px,5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[700px]">
            How we handle your data.
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[580px]">
            A plain-English overview of the infrastructure, encryption, and practices behind Beaconmon. No marketing fluff. Just what we actually do.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-[120px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="space-y-16 pt-16">
            {SECTIONS.map(({ id, heading, items }) => (
              <div key={id} className="reveal">
                <h2 className="text-[clamp(22px,2.8vw,30px)] font-bold tracking-[-0.025em] mb-8 pb-4 border-b border-brand-line-soft text-brand-green-ink">
                  {heading}
                </h2>
                <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
                  {items.map(({ title, body }) => (
                    <div key={title} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-7">
                      <h3 className="text-[16px] font-bold tracking-[-0.015em] mb-3">{title}</h3>
                      <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible disclosure */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal max-w-[720px]">
            <h2 className="text-[clamp(24px,3vw,36px)] font-bold tracking-[-0.025em] mb-5">Responsible disclosure</h2>
            <p className="text-brand-dim text-[15px] leading-[1.65] mb-5">
              If you discover a security vulnerability in Beaconmon, please report it to us before making it public. We take security reports seriously and will respond within 48 hours.
            </p>
            <p className="text-brand-dim text-[15px] leading-[1.65] mb-6">
              Email:{' '}
              <Link href="mailto:security@beaconmon.com" className="text-brand-green-ink border-b border-[rgba(0,229,122,0.4)] hover:border-brand-green transition-colors">
                security@beaconmon.com
              </Link>
            </p>
            <p className="text-brand-dim text-[15px] leading-[1.65]">
              We do not have a bug bounty program at this time, but we will acknowledge your contribution publicly if you wish.
            </p>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

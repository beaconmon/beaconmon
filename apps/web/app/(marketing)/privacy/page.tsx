import NavBar from '@/components/marketing/NavBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Beaconmon',
  description: 'How Beaconmon collects, uses, and protects your personal data.',
  alternates: { canonical: 'https://beaconmon.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <>
      <NavBar />

      <section className="py-[80px] max-[640px]:py-12">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <h1 className="text-[clamp(32px,4vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-brand-muted text-[14px] mb-12">Last updated: June 2026</p>

          <div className="prose-legal">

            <h2>1. Who we are</h2>
            <p>
              Beaconmon is operated by Haimanot Getu (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), trading as Beaconmon. For the purposes of the GDPR and other applicable data protection laws, Haimanot Getu is the data controller for personal data collected through beaconmon.com.
            </p>
            <p>
              We provide website uptime and performance monitoring services accessible at beaconmon.com. This policy explains what personal data we collect, why we collect it, how we use it, and your rights in relation to it.
            </p>

            <h2>2. What data we collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li><strong>Account data:</strong> Email address, name (optional), and hashed password when you create an account.</li>
              <li><strong>Billing data:</strong> Payment and subscription information is processed by Freemius, Inc. (our Merchant of Record). We do not store full card numbers; we receive and store only a customer reference, subscription status, and plan tier from Freemius.</li>
              <li><strong>Usage data:</strong> Monitor configurations (URLs, check settings), check results, alert channel configurations, and status page settings you create.</li>
              <li><strong>Log data:</strong> Server logs including IP addresses, browser user agents, and request timestamps, retained for up to 30 days for security and debugging purposes.</li>
              <li><strong>Cookies:</strong> We use a single session cookie to keep you logged in. We do not use advertising or tracking cookies.</li>
              <li><strong>Chrome extension data:</strong> If you install the Beaconmon Chrome extension, the extension reads DOM signals (HTML tags and asset URLs) on HTTPS pages you visit to detect Shopify storefronts. This detection happens entirely in your browser and the full content of pages you visit is never transmitted to our servers. Only the bare domain name (e.g. <em>example.com</em>) of a store you explicitly choose to track is sent to Beaconmon. A bearer token is stored in Chrome&apos;s local storage to authenticate your account; reconnecting the extension revokes the previous token.</li>
            </ul>

            <h2>3. How we use your data</h2>
            <p>We use your personal data only to:</p>
            <ul>
              <li>Provide and operate the monitoring service you signed up for.</li>
              <li>Send you transactional emails (alerts, account notifications, billing receipts). We do not send marketing emails without your explicit opt-in.</li>
              <li>Diagnose and fix technical issues.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>

            <h2>4. Third-party processors</h2>
            <p>We share data with the following sub-processors, each bound by a data processing agreement:</p>
            <ul>
              <li><strong>Freemius, Inc.</strong>: payment processing and subscription management (Merchant of Record). Freemius may be the data controller for billing data in certain jurisdictions.</li>
              <li><strong>Resend</strong>: transactional email delivery (alert and account emails).</li>
              <li><strong>Cloudflare</strong>: CDN, DDoS protection, and edge caching for status pages.</li>
              <li><strong>Neon</strong>: managed PostgreSQL database hosting (your monitor data, check results, and account data are stored here).</li>
              <li><strong>Sentry</strong>: error tracking. Error events may include request context but are stripped of payment or full authentication data.</li>
              <li><strong>PostHog</strong>: product analytics. When you track a competitor via the Chrome extension or the web app, an event is sent to PostHog containing your anonymised team identifier and the competitor domain. No personal data (name, email, IP) is included in these events.</li>
            </ul>

            <h2>5. Data retention</h2>
            <ul>
              <li>Check result data is retained for up to 365 days and then deleted. Access within the app is limited to your plan&apos;s history window (7, 90, or 365 days).</li>
              <li>Account data is retained for as long as your account is active. If you delete your account, we will delete or anonymise your personal data within 30 days, except where we are required by law to retain it longer.</li>
              <li>Server logs are retained for up to 30 days.</li>
            </ul>

            <h2>6. Your rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, export, or delete your personal data. To exercise any of these rights, email us at{' '}
              <a href="mailto:privacy@beaconmon.com">privacy@beaconmon.com</a>. We will respond within 30 days.
            </p>
            <p>
              If you are in the European Economic Area, you have rights under the GDPR including the right to lodge a complaint with your local supervisory authority.
            </p>

            <h2>7. Security</h2>
            <p>
              We use industry-standard security practices: encrypted connections (TLS), hashed passwords (bcrypt), and access controls that restrict employee access to production data. No method of transmission or storage is 100% secure; we cannot guarantee absolute security.
            </p>

            <h2>8. Children</h2>
            <p>
              Beaconmon is not directed at children under 16. We do not knowingly collect personal data from children.
            </p>

            <h2>9. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. If we make material changes, we will notify you by email or by a prominent notice on the site before the changes take effect.
            </p>

            <h2>10. Contact</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:privacy@beaconmon.com">privacy@beaconmon.com</a>.
            </p>
            <p>
              Data controller: Haimanot Getu, operating as Beaconmon (beaconmon.com).
            </p>
          </div>
        </div>
      </section>

      <style>{`
        .prose-legal h2 {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 2.5rem 0 0.75rem;
          color: var(--brand-text, #f0f0f0);
        }
        .prose-legal p, .prose-legal li {
          font-size: 15px;
          line-height: 1.75;
          color: var(--brand-dim, #a0a0b0);
          margin-bottom: 0.75rem;
        }
        .prose-legal ul {
          padding-left: 1.25rem;
          margin-bottom: 1rem;
          list-style: disc;
        }
        .prose-legal li {
          padding-left: 0.25rem;
          margin-bottom: 0.35rem;
        }
        .prose-legal strong {
          color: var(--brand-text, #f0f0f0);
          font-weight: 600;
        }
        .prose-legal a {
          color: var(--brand-green, #00e57a);
          text-decoration: underline;
          text-decoration-color: rgba(0,229,122,0.4);
        }
        .prose-legal a:hover {
          text-decoration-color: var(--brand-green, #00e57a);
        }
      `}</style>
    </>
  );
}

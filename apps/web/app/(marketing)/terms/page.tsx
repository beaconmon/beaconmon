import NavBar from '@/components/marketing/NavBar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Beaconmon',
  description: "Terms and conditions for using Beaconmon's uptime, SSL, and competitor monitoring service, including billing, cancellation, and acceptable use.",
  alternates: { canonical: 'https://beaconmon.com/terms' },
  openGraph: { url: 'https://beaconmon.com/terms' },
};

export default function TermsPage() {
  return (
    <>
      <NavBar />

      <section className="py-[80px] max-[640px]:py-12">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <h1 className="text-[clamp(32px,4vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Terms of Service</h1>
          <p className="text-brand-muted text-[14px] mb-12">Last updated: May 8, 2026</p>

          <div className="prose-legal">

            <h2>1. Acceptance</h2>
            <p>
              By creating an account or using the Beaconmon service (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service. These Terms form a binding agreement between you and Beaconmon (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
            </p>

            <h2>2. Account terms</h2>
            <ul>
              <li>You must be at least 16 years old to create an account.</li>
              <li>You are responsible for maintaining the security of your account credentials. We are not liable for any loss arising from unauthorised access to your account.</li>
              <li>You must provide accurate account information and keep it up to date.</li>
              <li>One person or legal entity may not maintain more than one free account.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>

            <h2>3. Acceptable use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Monitor URLs or services you do not own or have explicit permission to monitor.</li>
              <li>Conduct denial-of-service attacks, stress testing, or load testing on third-party systems.</li>
              <li>Circumvent, disable, or otherwise interfere with security features of any website.</li>
              <li>Violate any applicable law, regulation, or third-party right.</li>
              <li>Attempt to probe, scan, or test the vulnerability of Beaconmon systems.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
            </p>

            <h2>4. Billing and payment</h2>
            <p>
              Paid plans are billed through Freemius, Inc., our Merchant of Record. Freemius handles payment processing, invoicing, and tax compliance on our behalf. By subscribing to a paid plan, you agree to Freemius&apos;s{' '}
              <a href="https://freemius.com/terms/" target="_blank" rel="noopener noreferrer">Terms of Service</a>.
            </p>
            <ul>
              <li>All prices are in USD. Annual prices are charged upfront.</li>
              <li>Upgrades take effect immediately and are prorated. Downgrades take effect at the end of the current billing period.</li>
              <li>Refunds are handled by Freemius in accordance with their refund policy. New subscriptions are covered by a 14-day money-back guarantee. See our <Link href="/refund-policy">Refund Policy</Link> for full details.</li>
            </ul>

            <h2>5. Cancellation</h2>
            <p>
              You may cancel your subscription at any time from the billing settings in your dashboard. Cancellation takes effect at the end of the current billing period. You retain full access until then. We do not charge cancellation fees. Upon cancellation, your account reverts to the Free plan.
            </p>
            <p>
              To delete your account entirely, contact us at{' '}<a href="mailto:hello@beaconmon.com">hello@beaconmon.com</a>. We will delete your account and associated data within 30 days.
            </p>

            <h2>6. Service availability</h2>
            <p>
              We aim for high availability but do not guarantee any specific uptime SLA. We will make reasonable efforts to notify you in advance of scheduled maintenance. We are not liable for losses arising from service interruptions.
            </p>
            <p>
              Check results and historical data may occasionally be delayed or incomplete due to infrastructure issues. We do not guarantee that every check will execute on schedule.
            </p>

            <h2>7. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, our total liability to you for any claims arising out of or related to these Terms or the Service shall not exceed the greater of (a) the fees you paid to us in the three months preceding the claim or (b) $50 USD.
            </p>
            <p>
              We are not liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, data, or business opportunity, arising out of your use of or inability to use the Service.
            </p>

            <h2>8. Intellectual property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Beaconmon and are protected by intellectual property laws. You retain ownership of all monitor configurations, alert settings, and other data you create using the Service.
            </p>

            <h2>9. Governing law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of England and Wales, without regard to conflict of law principles. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2>10. Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. If we make material changes, we will notify you by email at least 14 days before the changes take effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
            </p>

            <h2>11. Contact</h2>
            <p>
              Questions about these Terms? Email us at{' '}
              <a href="mailto:hello@beaconmon.com">hello@beaconmon.com</a>.
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

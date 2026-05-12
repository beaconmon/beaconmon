import NavBar from '@/components/marketing/NavBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy — Beaconmon',
  description: 'Beaconmon refund and cancellation policy for paid subscriptions.',
};

export default function RefundPolicyPage() {
  return (
    <>
      <NavBar />

      <section className="py-[80px] max-[640px]:py-12">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <h1 className="text-[clamp(32px,4vw,48px)] tracking-[-0.03em] font-extrabold mb-3">Refund Policy</h1>
          <p className="text-brand-muted text-[14px] mb-12">Last updated: May 10, 2026</p>

          <div className="prose-legal">

            <h2>1. 14-day money-back guarantee</h2>
            <p>
              If you are not satisfied with Beaconmon for any reason, you may request a full refund within <strong>14 days</strong> of your first paid charge — no questions asked. This applies to new Pro and Business subscriptions only (not renewals).
            </p>
            <p>
              To request a refund, email us at{' '}
              <a href="mailto:hello@beaconmon.com">hello@beaconmon.com</a> with the subject line &ldquo;Refund request&rdquo; and include the email address associated with your account. We will process your request within 3 business days.
            </p>

            <h2>2. Renewals</h2>
            <p>
              Subscription renewals (monthly or annual) are generally non-refundable. If you forgot to cancel before a renewal charged, contact us within <strong>48 hours</strong> and we will consider a refund on a case-by-case basis — particularly if you have not used the service since the charge.
            </p>

            <h2>3. Annual plans</h2>
            <p>
              Annual plans are billed upfront for 12 months. The 14-day guarantee applies from the date of the initial annual charge. After 14 days, annual plan payments are non-refundable, but you retain access until the end of the paid period. We do not offer prorated refunds for the unused portion of an annual plan.
            </p>

            <h2>4. Billing errors</h2>
            <p>
              If you were charged incorrectly — for example, due to a pricing error, a duplicate charge, or a technical failure — we will issue a full refund regardless of when the error is reported. Please contact us at{' '}
              <a href="mailto:hello@beaconmon.com">hello@beaconmon.com</a> with your account details and a description of the issue.
            </p>

            <h2>5. Trial period</h2>
            <p>
              All new accounts start with a <strong>14-day free Pro trial</strong> — no credit card required. You will not be charged anything until you choose to subscribe after the trial ends. If you do not add a payment method, your account simply reverts to the Free plan.
            </p>

            <h2>6. Cancellation</h2>
            <p>
              You may cancel your subscription at any time from the billing settings in your dashboard. Cancellation takes effect at the end of your current billing period — you retain full access until then. We do not charge cancellation fees, and cancelling does not automatically trigger a refund unless you are within the 14-day guarantee window.
            </p>

            <h2>7. How refunds are processed</h2>
            <p>
              Payments are processed by <strong>Freemius, Inc.</strong>, our Merchant of Record. Refunds are returned to the original payment method. Processing times depend on your bank or card issuer but typically take 5&ndash;10 business days to appear on your statement.
            </p>

            <h2>8. Contact</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:hello@beaconmon.com">hello@beaconmon.com</a> — we are happy to help.
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
          color: var(--color-brand-text, #f0f0f0);
        }
        .prose-legal p, .prose-legal li {
          font-size: 15px;
          line-height: 1.75;
          color: var(--color-brand-dim, #a0a0b0);
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
          color: var(--color-brand-text, #f0f0f0);
          font-weight: 600;
        }
        .prose-legal a {
          color: var(--color-brand-green, #00e57a);
          text-decoration: underline;
          text-decoration-color: rgba(0,229,122,0.4);
        }
        .prose-legal a:hover {
          text-decoration-color: var(--color-brand-green, #00e57a);
        }
      `}</style>
    </>
  );
}

import NavBar from '@/components/marketing/NavBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — Beaconmon',
  description: 'Get in touch with the Beaconmon team. We read every message.',
};

export default function ContactPage() {
  return (
    <>
      <NavBar />

      <section className="py-[120px] max-[640px]:py-[72px]">
        <div className="max-w-[600px] mx-auto px-8 max-[640px]:px-5 text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green mb-5">Contact</span>
          <h1 className="text-[clamp(36px,4.5vw,56px)] leading-[1.08] tracking-[-0.035em] font-extrabold mb-6">
            We read every message.
          </h1>
          <p className="text-[17px] text-brand-dim leading-[1.65] mb-10">
            Have a question, a bug report, a feature idea, or just want to say hi? Send us an email. You&apos;ll hear back from a real person, usually within one business day.
          </p>
          <a
            href="mailto:hello@beaconmon.com"
            className="inline-flex items-center justify-center h-14 px-8 text-[17px] font-semibold rounded-[12px] bg-brand-green text-[#001a0c] shadow-[0_0_0_1px_rgba(0,229,122,0.3),0_6px_20px_rgba(0,229,122,0.2)] hover:scale-[1.02] hover:bg-[#00ff8a] transition-all duration-[120ms]"
          >
            hello@beaconmon.com
          </a>
          <p className="mt-6 text-[13px] text-brand-muted">
            Typical response time: within 1 business day.
          </p>
        </div>
      </section>
    </>
  );
}

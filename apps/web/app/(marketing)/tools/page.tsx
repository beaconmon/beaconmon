import NavBar from '@/components/marketing/NavBar';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Ecommerce Competitor Tools | Beaconmon',
  description:
    'Free tools for ecommerce competitor research. Check any Shopify store’s products, prices, and live sales in seconds. No signup, no install.',
  alternates: { canonical: 'https://beaconmon.com/tools' },
};

const TOOLS = [
  {
    href: '/tools/shopify-competitor-snapshot',
    name: 'Shopify Competitor Snapshot',
    blurb:
      'Paste a store URL to instantly see its product count, what is on sale right now, and a sample of the catalog.',
    tag: 'Shopify',
  },
  {
    href: '/tools/shopify-competitor-changes',
    name: 'Shopify Competitor Change Checker',
    blurb:
      'Check if a competitor recently dropped prices, launched a sale, or added products. See their change history in seconds.',
    tag: 'Shopify',
  },
  {
    href: '/tools/downtime-detection-calculator',
    name: 'Downtime Detection Speed Calculator',
    blurb:
      'How long would it take you to find out your store went down? Calculate your real detection time and what it costs.',
    tag: 'Calculator',
  },
  {
    href: '/tools/shopify-uptime-test',
    name: 'Shopify Uptime Tester',
    blurb: 'Instant uptime check for any Shopify store. See response time, SSL status, and redirect health in seconds.',
    tag: 'Uptime',
  },
  {
    href: '/tools/bfcm-readiness',
    name: 'BFCM Store Readiness Scorer',
    blurb: 'Run a free technical check before Black Friday. Score your store on uptime, SSL, speed, redirects, and monitoring coverage.',
    tag: 'BFCM',
  },
];

export default function ToolsHubPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema({ name: 'Tools', path: '/tools' })} />
      <NavBar />

      <section className="relative pt-[88px] pb-[64px] max-[640px]:pt-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{ top: '-30%', right: '-8%', width: 640, height: 640, background: 'radial-gradient(circle, rgba(0,229,122,0.12), transparent 60%)', filter: 'blur(40px)' }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Free tools
          </span>
          <h1 className="text-[clamp(38px,5vw,60px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-5 max-w-[820px] [overflow-wrap:anywhere]">
            Free tools for ecommerce competitor research
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[600px]">
            Quick, no-signup tools for sizing up a competitor. Run one now, then let Beaconmon watch the store for you.
          </p>
        </div>
      </section>

      <section className="pb-[100px]">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-5">
            {TOOLS.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="reveal group block bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 transition-all hover:border-brand-green-border-25 hover:shadow-[0_1px_2px_rgba(20,30,40,0.04),0_12px_32px_rgba(20,30,40,0.06)]"
              >
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-green-ink mb-4">
                  {tool.tag}
                </span>
                <h2 className="text-[20px] font-bold tracking-[-0.015em] mb-2 group-hover:text-brand-green-ink transition-colors">
                  {tool.name}
                </h2>
                <p className="text-brand-dim text-[14px] leading-[1.6]">{tool.blurb}</p>
                <span className="inline-block mt-5 text-[14px] font-semibold text-brand-green-ink">
                  Open tool &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

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
    name: 'Peak Sale Readiness Checker',
    blurb: 'Run a free technical check before any peak sale event. Score your store on uptime, SSL, speed, redirects, and monitoring coverage.',
    tag: 'Readiness',
  },
  {
    href: '/tools/competitor-intelligence-report',
    name: 'Free 7-Day Competitor Intelligence Report',
    blurb:
      "Enter a competitor's Shopify URL and get a 7-day report of every price drop, promo, and product change delivered to your email.",
    tag: 'Report',
  },
  {
    href: '/tools/competitor-intelligence-roi',
    name: 'Competitor Intelligence ROI Calculator',
    blurb: 'Calculate how much revenue you recover by reacting faster to competitor price drops and promotions.',
    tag: 'Calculator',
  },
  {
    href: '/tools/monitoring-coverage',
    name: 'Store Monitoring Coverage Auditor',
    blurb:
      'Check which critical pages of your Shopify store are healthy and see exactly which ones you should be monitoring.',
    tag: 'Audit',
  },
  {
    href: '/tools/woocommerce-uptime-test',
    name: 'WooCommerce Uptime Tester',
    blurb: 'Instant uptime check for any WooCommerce store. See response time, SSL status, and redirect health in seconds.',
    tag: 'Uptime',
  },
  {
    href: '/tools/ssl-checker',
    name: 'SSL Certificate Checker',
    blurb: 'Check any website SSL certificate instantly. See if it is valid, when it expires, and how many days remain.',
    tag: 'SSL',
  },
];

const HUB_FACTS = [
  'Read any Shopify store catalog, product count, and live sales in under 5 seconds.',
  'Test uptime, SSL expiry, and redirect health from our servers with no install.',
  'Run calculators that turn your revenue and reaction time into a real dollar figure.',
];

const HUB_FAQS = [
  {
    q: 'Are these tools really free?',
    a: 'Yes. Every tool on this page is completely free with no signup, no credit card, and no app install. There are no usage caps for a normal session. The paid Beaconmon plans add continuous monitoring on top, starting with a free tier that includes 10 monitors.',
  },
  {
    q: 'Do I need a Shopify app?',
    a: 'No. None of these tools require a Shopify app or admin access. They read only public storefront data, the same information any visitor sees, so you can check a competitor store or your own without installing anything. Roughly 9 in 10 Shopify stores publish a public product feed these tools read directly.',
  },
  {
    q: 'What do these tools check?',
    a: 'Across the 10 tools you can pull a competitor product and price snapshot, detect recent price and promo changes, run an instant uptime and SSL test, audit which of your 5 critical store pages are healthy, and calculate your downtime detection time and competitor intelligence ROI in dollars.',
  },
];

const toolsListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Free Ecommerce Tools',
  url: 'https://beaconmon.com/tools',
  numberOfItems: TOOLS.length,
  itemListElement: TOOLS.map((tool, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://beaconmon.com${tool.href}`,
    name: tool.name,
  })),
};

const hubFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HUB_FAQS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function ToolsHubPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema({ name: 'Tools', path: '/tools' })} />
      <JsonLd data={toolsListSchema} />
      <JsonLd data={hubFaqSchema} />
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

      {/* Stats + FAQ */}
      <section className="pb-[100px] border-t border-brand-line-soft pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          {/* Stats strip */}
          <div className="reveal mb-14 max-w-[820px]">
            <p className="text-[clamp(22px,2.6vw,30px)] font-extrabold tracking-[-0.02em] mb-6">
              {TOOLS.length} free tools. No signup. No install.
            </p>
            <ul className="grid grid-cols-3 max-[760px]:grid-cols-1 gap-5">
              {HUB_FACTS.map((fact) => (
                <li
                  key={fact}
                  className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6 text-[14px] text-brand-dim leading-[1.6]"
                >
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Body copy */}
          <div className="reveal max-w-[720px] mb-14">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-4 leading-[1.15]">
              Free tools for Shopify and ecommerce store owners
            </h2>
            <p className="text-brand-dim text-[16px] leading-[1.7] mb-4">
              Beaconmon builds free tools that solve one specific problem each, fast, with no account required. Some
              read a competitor public catalog so you can size up their products, prices, and live sales in seconds.
              Others test your own store: whether it is up right now, how fast it responds against the Shopify median of
              380ms, whether your SSL certificate is about to expire, and which of your critical pages are healthy.
            </p>
            <p className="text-brand-dim text-[16px] leading-[1.7]">
              Every tool here runs in the browser against public data. Nothing is installed, nothing is stored behind a
              login, and you can run them as many times as you need. When you want a tool to keep watching a store for
              you, instead of checking once, that is where a paid Beaconmon plan picks up, with a free tier that covers
              10 monitors.
            </p>
          </div>

          {/* FAQ */}
          <div className="reveal max-w-[760px]">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-6 leading-[1.15]">
              Frequently asked questions
            </h2>
            <div className="space-y-5">
              {HUB_FAQS.map(({ q, a }) => (
                <div key={q} className="bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6">
                  <h3 className="text-[16px] font-bold tracking-[-0.01em] mb-2">{q}</h3>
                  <p className="text-brand-dim text-[14px] leading-[1.65]">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

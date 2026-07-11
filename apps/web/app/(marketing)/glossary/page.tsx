import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ecommerce Competitor Monitoring Glossary | Beaconmon',
  description:
    'Plain-language definitions for Shopify and WooCommerce monitoring terms: compare-at price, price change noise, significance scoring, and more.',
  alternates: { canonical: 'https://beaconmon.com/glossary' },
  openGraph: { url: 'https://beaconmon.com/glossary' },
};

const GLOSSARY_URL = 'https://beaconmon.com/glossary';
const TERM_SET_ID = `${GLOSSARY_URL}#glossary`;

type TermLink = { href: string; label: string };

type Term = {
  slug: string;
  name: string;
  definition: string;
  links?: TermLink[];
};

const TERMS: Term[] = [
  {
    slug: 'compare-at-price',
    name: 'Compare-at price',
    definition:
      'Compare-at price is the "was" price a Shopify store enters alongside the current selling price to display a product as discounted, for example a crossed-out $80 next to a $60 sale price. It is set manually by the merchant and is not validated against any real sale history. For a Shopify store owner, tracking whether a competitor keeps items permanently marked down at a compare-at price shows whether their "sale" is a real event or a standing pricing strategy.',
    links: [{ href: '/blog/shopify-permanent-sale-compare-at-price', label: 'How common permanent compare-at pricing is' }],
  },
  {
    slug: 'price-change-noise',
    name: 'Price change noise',
    definition:
      'Price change noise is small, sub-1% price fluctuation caused by automated repricing tools, currency rounding, or bulk pricing rules, rather than a deliberate pricing decision. Most raw price-change data is dominated by this kind of noise, not meaningful moves. Filtering it out is what separates a real signal, like an actual price cut, from routine background activity that does not need a response.',
    links: [{ href: '/blog/shopify-competitor-price-change-noise', label: 'How much of competitor price data is noise' }],
  },
  {
    slug: 'catalog-wide-price-change',
    name: 'Catalog-wide price change',
    definition:
      'A catalog-wide price change is when many SKUs from the same store change price at the same time, typically 50 or more. It is almost always a sign of automation, a repricing app running a rule, or a sitewide sale going live, rather than a single human decision on one product. Spotting the pattern helps a Shopify store owner tell a targeted competitive move apart from a routine automated event.',
    links: [{ href: '/blog/shopify-price-changes-automated', label: 'How to spot automated catalog-wide changes' }],
  },
  {
    slug: 'significance-scoring',
    name: 'Significance scoring',
    definition:
      "Significance scoring is an AI classification, low, medium, or high, applied to each detected competitor event to separate background activity from events worth a person's attention. Only a small share of events are typically flagged high-significance. This lets a Shopify store owner skip routine updates and focus on the handful of changes, like a real price cut on a bestseller, that actually call for a response. Available on the Growth plan and above.",
    links: [
      { href: '/blog/shopify-competitor-event-significance-data', label: 'How significance scoring splits real event data' },
      { href: '/features/intelligence', label: 'Weekly Competitor Report features' },
    ],
  },
  {
    slug: 'intelligence-digest',
    name: 'Weekly Competitor Report',
    definition:
      "The Weekly Competitor Report is Beaconmon's scheduled Slack or email summary that groups every competitor change detected over a period into a plain-language digest, rather than a raw list of diffs. It is available on the Starter plan and above. Instead of checking a dashboard, a store owner or their team gets a readable roundup of what competitors did and when.",
    links: [{ href: '/features/intelligence', label: 'How the Weekly Competitor Report works' }],
  },
  {
    slug: 'css-selector-monitoring',
    name: 'CSS-selector monitoring',
    definition:
      "CSS-selector monitoring means tracking one specific element on a competitor's page, a price, a stock badge, a promo banner, by its CSS selector, rather than comparing the entire page as an image. This is more precise than pixel-diffing because it targets the exact piece of content that matters and ignores everything else. For a Shopify store owner, this means an alert only fires when the price or promo actually changes, not when a blog timestamp or a navigation menu updates.",
    links: [{ href: '/website-change-detection', label: 'How CSS-selector change detection works' }],
  },
  {
    slug: 'content-monitoring-vs-uptime-monitoring',
    name: 'Content monitoring vs. uptime monitoring',
    definition:
      "Content monitoring watches for changes on a page you don't control, like a competitor's pricing page. Uptime monitoring watches whether a page you do control, like your own storefront, is up and responding. Both matter to a Shopify store owner: uptime monitoring protects your own revenue by catching outages, while content monitoring keeps you aware of what competitors are doing on pages you have no control over.",
    links: [
      { href: '/ecommerce-uptime-monitoring-guide', label: 'The uptime monitoring guide' },
      { href: '/shopify-competitor-monitoring', label: 'Shopify competitor monitoring' },
    ],
  },
  {
    slug: 'data-tier',
    name: 'Data tier (full catalog, selected products, limited)',
    definition:
      "Data tier describes the depth at which Beaconmon can track a given competitor, ranging from full product-feed access down to a handful of manually specified product URLs. A competitor with a full catalog feed gets broader, more automatic coverage, while one tracked at a limited tier only reports changes on the specific pages a store owner has added. Which tier applies to a given competitor depends on what data that store's site exposes, not on the plan a customer is on.",
  },
  {
    slug: 'restock-speed',
    name: 'Restock speed / stockout resolution time',
    definition:
      'Restock speed, or stockout resolution time, is the time between a product going out of stock and coming back in stock. A fast restock, hours rather than days, often points to manufactured urgency rather than a genuine shortage, while a slow restock suggests a real supply constraint. Comparing restock speed across competitors helps a Shopify store owner tell which "low stock" messaging is a sales tactic and which reflects an actual inventory problem.',
    links: [{ href: '/blog/shopify-competitor-restock-speed-data', label: 'Median restock speed across tracked competitors' }],
  },
  {
    slug: 'product-churn',
    name: 'Product churn (Shopify)',
    definition:
      "Product churn is when a new product listing appears in a competitor's catalog and then gets pulled again within a short window. It often signals a failed test launch rather than a permanent addition to the catalog. Tracking churn tells a Shopify store owner which of a competitor's new products are worth watching and which were pulled before they gained any traction.",
    links: [{ href: '/blog/shopify-competitor-product-churn', label: 'How often new Shopify listings churn' }],
  },
  {
    slug: 'domain-ssl-expiry-alert',
    name: 'Domain / SSL expiry alert',
    definition:
      "A domain or SSL expiry alert is a warning fired when a monitored domain's SSL certificate or registration is approaching expiry, at 30, 14, and 7-day thresholds. It is distinct from an incident because it does not indicate current downtime, only a risk of downtime if the certificate or registration is not renewed in time. Catching this early gives a store owner time to renew before a browser starts warning visitors that the site is not secure.",
    links: [{ href: '/security', label: 'How Beaconmon handles security and monitoring data' }],
  },
  {
    slug: 'two-tribes-of-dtc-discounting',
    name: 'The two tribes of DTC discounting',
    definition:
      "The two tribes of DTC discounting is Beaconmon's own term for a bimodal pattern in how direct-to-consumer brands discount: most brands cluster into one of two groups, those that almost never discount and those that almost always do, with comparatively few landing in the middle. Knowing which tribe a competitor belongs to tells a Shopify store owner what to expect from their pricing behavior, rather than reacting to each price change as a surprise.",
    links: [{ href: '/blog/shopify-dtc-two-tribes-discounting', label: 'The two tribes of DTC discounting, explained' }],
  },
];

const definedTermSetSchema = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTermSet',
  '@id': TERM_SET_ID,
  name: 'Ecommerce Competitor Monitoring Glossary',
  description:
    'Plain-language definitions of the terms used in competitor and uptime monitoring for Shopify and WooCommerce stores.',
  url: GLOSSARY_URL,
};

const definedTermSchemas = TERMS.map((term) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: term.name,
  description: term.definition,
  url: `${GLOSSARY_URL}#${term.slug}`,
  inDefinedTermSet: TERM_SET_ID,
}));

export default function GlossaryPage() {
  return (
    <>
      <JsonLd data={definedTermSetSchema} />
      <JsonLd data={definedTermSchemas} />
      <JsonLd data={breadcrumbSchema({ name: 'Glossary', path: '/glossary' })} />
      <NavBar />

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
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Glossary</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[900px]">
            Ecommerce competitor monitoring glossary
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[620px] mb-10">
            Plain-language definitions of the terms used in competitor and uptime monitoring for Shopify and WooCommerce stores, from compare-at price to significance scoring.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 max-w-[900px]">
            {TERMS.map((term) => (
              <a key={term.slug} href={`#${term.slug}`} className="text-[14px] text-brand-dim hover:text-brand-green-ink transition-colors">
                {term.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="max-w-[760px] mx-auto space-y-12">
            {TERMS.map((term) => (
              <div key={term.slug} id={term.slug} className="reveal scroll-mt-24 border-t border-brand-line-soft pt-10 first:border-t-0 first:pt-0">
                <h2 className="text-[clamp(22px,2.6vw,28px)] tracking-[-0.02em] font-extrabold mb-4 leading-[1.2] text-brand-text">
                  {term.name}
                </h2>
                <p className="text-brand-dim text-[16px] leading-[1.7] mb-4">{term.definition}</p>
                {term.links && term.links.length > 0 && (
                  <p className="text-[14px] text-brand-muted">
                    Learn more:{' '}
                    {term.links.map((link, i) => (
                      <span key={link.href}>
                        <Link href={link.href} className="text-brand-green-ink hover:underline">
                          {link.label}
                        </Link>
                        {i < term.links!.length - 1 ? ' and ' : ''}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">Try Beaconmon free.</h2>
          <p className="text-brand-dim text-[17px] mb-8">10 monitors free forever. 14-day Growth trial, no card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">See the Shopify-specific setup →</Link>
          </p>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}

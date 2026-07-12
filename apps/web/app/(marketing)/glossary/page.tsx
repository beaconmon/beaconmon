import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import type { Metadata } from 'next';
import { TERMS, GLOSSARY_URL, TERM_SET_ID } from './terms-data';

export const metadata: Metadata = {
  title: 'Ecommerce Competitor Monitoring Glossary | Beaconmon',
  description:
    'Plain-language definitions for Shopify and WooCommerce monitoring terms: compare-at price, price change noise, significance scoring, and more.',
  alternates: { canonical: 'https://beaconmon.com/glossary' },
  openGraph: { url: 'https://beaconmon.com/glossary' },
};

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
  url: `${GLOSSARY_URL}/${term.slug}`,
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
              <Link
                key={term.slug}
                href={`/glossary/${term.slug}`}
                className="text-[14px] text-brand-dim hover:text-brand-green-ink transition-colors"
              >
                {term.name}
              </Link>
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
                  <Link href={`/glossary/${term.slug}`} className="hover:text-brand-green-ink transition-colors">
                    {term.name}
                  </Link>
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

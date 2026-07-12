import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import Link from 'next/link';
import type { Term } from './terms-data';
import { getRelatedTerms } from './terms-data';

function firstSentence(text: string): string {
  const match = text.match(/^.*?[.?!](?=\s|$)/);
  return match ? match[0] : text;
}

export default function TermPageTemplate({ term }: { term: Term }) {
  const related = getRelatedTerms(term);

  return (
    <>
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
        <div className="max-w-[760px] mx-auto px-8 max-[640px]:px-5 relative">
          <Link
            href="/glossary"
            className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4 hover:underline"
          >
            Glossary
          </Link>
          <h1 className="text-[clamp(32px,4.5vw,52px)] leading-[1.1] tracking-[-0.03em] font-extrabold mb-6">
            {term.name}
          </h1>
          <p className="text-brand-dim text-[17px] leading-[1.7] mb-6">{term.definition}</p>
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
      </section>

      {related.length > 0 && (
        <section className="py-[60px] border-t border-brand-line-soft">
          <div className="max-w-[760px] mx-auto px-8 max-[640px]:px-5">
            <h2 className="text-[13px] font-semibold tracking-[0.1em] uppercase text-brand-muted mb-6">
              Related terms
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {related.map((relatedTerm) => (
                <Link
                  key={relatedTerm.slug}
                  href={`/glossary/${relatedTerm.slug}`}
                  className="reveal block bg-brand-bg1 border border-brand-line-soft rounded-2xl p-5 hover:border-brand-green-ink/40 transition-colors"
                >
                  <span className="text-[15px] font-bold tracking-[-0.015em] text-brand-text block mb-1">
                    {relatedTerm.name}
                  </span>
                  <span className="text-brand-dim text-[13px] leading-[1.6]">{firstSentence(relatedTerm.definition)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-[60px] border-t border-brand-line-soft">
        <div className="max-w-[760px] mx-auto px-8 max-[640px]:px-5">
          <Link href="/glossary" className="text-[14px] text-brand-green-ink hover:underline">
            ← Back to the full glossary
          </Link>
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

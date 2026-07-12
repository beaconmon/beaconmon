import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import { getTerm, GLOSSARY_URL } from '../terms-data';
import TermPageTemplate from '../TermPageTemplate';

const term = getTerm('compare-at-price')!;

export const metadata: Metadata = {
  title: 'Compare-at price: Definition | Beaconmon Glossary',
  description:
    "What compare-at price means on Shopify, how merchants use it to show a discount, and how tracking it reveals real sales versus standing markdowns.",
  alternates: { canonical: `${GLOSSARY_URL}/${term.slug}` },
  openGraph: { url: `${GLOSSARY_URL}/${term.slug}` },
};

const definedTermSchema = {
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name: term.name,
  description: term.definition,
  url: `${GLOSSARY_URL}/${term.slug}`,
  inDefinedTermSet: GLOSSARY_URL,
};

export default function CompareAtPriceTermPage() {
  return (
    <>
      <JsonLd data={definedTermSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Glossary', path: '/glossary' },
          { name: term.name, path: `/glossary/${term.slug}` },
        )}
      />
      <TermPageTemplate term={term} />
    </>
  );
}

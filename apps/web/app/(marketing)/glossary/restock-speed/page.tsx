import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import { getTerm, GLOSSARY_URL } from '../terms-data';
import TermPageTemplate from '../TermPageTemplate';

const term = getTerm('restock-speed')!;

export const metadata: Metadata = {
  title: 'Restock speed: Definition | Beaconmon Glossary',
  description:
    'What restock speed means: the time between a stockout and a product coming back in stock, and what it signals.',
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

export default function RestockSpeedTermPage() {
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

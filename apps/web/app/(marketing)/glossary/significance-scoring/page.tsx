import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import { getTerm, GLOSSARY_URL } from '../terms-data';
import TermPageTemplate from '../TermPageTemplate';

const term = getTerm('significance-scoring')!;

export const metadata: Metadata = {
  title: 'Significance scoring: Definition | Beaconmon Glossary',
  description:
    'What significance scoring means: an AI classification that separates high-signal competitor events from routine background activity.',
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

export default function SignificanceScoringTermPage() {
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

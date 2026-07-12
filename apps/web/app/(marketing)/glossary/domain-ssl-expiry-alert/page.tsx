import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import { getTerm, GLOSSARY_URL } from '../terms-data';
import TermPageTemplate from '../TermPageTemplate';

const term = getTerm('domain-ssl-expiry-alert')!;

export const metadata: Metadata = {
  title: 'Domain / SSL expiry alert: Definition | Beaconmon Glossary',
  description:
    'What a domain or SSL expiry alert is: a warning fired before a certificate or domain registration lapses, separate from downtime incidents.',
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

export default function DomainSslExpiryAlertTermPage() {
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

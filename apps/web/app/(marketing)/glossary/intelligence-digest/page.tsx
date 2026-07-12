import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import { getTerm, GLOSSARY_URL } from '../terms-data';
import TermPageTemplate from '../TermPageTemplate';

const term = getTerm('intelligence-digest')!;

export const metadata: Metadata = {
  title: 'Weekly Competitor Report: Definition | Beaconmon Glossary',
  description:
    'What the Weekly Competitor Report is: a scheduled Slack or email summary of every competitor change detected over a period.',
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

export default function WeeklyCompetitorReportTermPage() {
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

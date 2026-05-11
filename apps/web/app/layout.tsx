import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { JsonLd } from '@/components/json-ld';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Uptime Monitoring for Freelancers & Agencies | Beaconmon',
  description:
    'Know the second your site goes down. Beaconmon monitors every 30 seconds, alerts via email, Slack, or SMS, and includes status pages — free for 10 monitors.',
  metadataBase: new URL('https://beaconmon.com'),
  alternates: { canonical: 'https://beaconmon.com' },
  openGraph: {
    type: 'website',
    siteName: 'Beaconmon',
    images: [{ url: 'https://beaconmon.com/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@beaconmon',
  },
};

const SITE_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Beaconmon',
    url: 'https://beaconmon.com',
    logo: 'https://beaconmon.com/logo.svg',
    sameAs: [],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Beaconmon',
    url: 'https://beaconmon.com',
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${mono.variable}`}>
      <body>
        <JsonLd data={SITE_SCHEMA} />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { JsonLd } from '@/components/json-ld';
import { PHProvider } from '@/components/posthog-provider';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Store and Competitor Monitoring | Beaconmon',
  description:
    'Monitor your store and competitors automatically. Know about outages, pricing changes, SSL expiry, and competitor updates before they hurt sales. Free for 10 monitors.',
  metadataBase: new URL('https://beaconmon.com'),
  openGraph: {
    type: 'website',
    siteName: 'Beaconmon',
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <head>
        <JsonLd data={SITE_SCHEMA} />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PHProvider>{children}</PHProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

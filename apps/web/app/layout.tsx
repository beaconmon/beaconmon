import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beaconmon — Uptime Monitoring',
  description: 'Website uptime and performance monitoring',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

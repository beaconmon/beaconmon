import Image from 'next/image';
import Link from 'next/link';
import LogoMark from './LogoMark';

const PRODUCT_LINKS: [string, string][] = [
  ['/features#monitors', 'Monitors'],
  ['/features/intelligence', 'Intelligence'],
  ['/features#status-pages', 'Status Pages'],
  ['/features#smart-alerts', 'Smart Alerts'],
  ['/features#reliability-targets', 'Uptime goals'],
  ['/pricing', 'Pricing'],
  ['/changelog', 'Changelog'],
];

const FOR_LINKS: [string, string][] = [
  ['/for/shopify', 'Shopify'],
  ['/for/woocommerce', 'WooCommerce'],
  ['/for/dtc-brands', 'DTC Brands'],
];

const TOOLS_LINKS: [string, string][] = [
  ['/tools/shopify-competitor-snapshot', 'Shopify Snapshot'],
  ['/tools', 'All free tools'],
];

const COMPARE_LINKS: [string, string][] = [
  ['/vs', 'All comparisons'],
  ['/vs/distill', 'vs Distill'],
  ['/vs/hexowatch', 'vs Hexowatch'],
  ['/vs/prisync', 'vs Prisync'],
  ['/vs/visualping', 'vs Visualping'],
];

const GUIDES_LINKS: [string, string][] = [
  ['/shopify-competitor-monitoring', 'Shopify Monitoring'],
  ['/competitor-price-tracking', 'Price Tracking'],
  ['/ecommerce-competitor-intelligence', 'Competitor Intelligence'],
  ['/woocommerce-competitor-monitoring', 'WooCommerce Monitoring'],
  ['/ecommerce-uptime-monitoring-guide', 'Uptime Monitoring'],
];

const COMPANY_LINKS: [string, string][] = [
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
  ['/refund-policy', 'Refund Policy'],
];

function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] font-semibold tracking-[0.09em] uppercase text-brand-muted mb-5">
      {children}
    </h4>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li className="py-[7px]">
      <Link href={href} className="text-[13.5px] text-brand-dim hover:text-brand-text transition-colors duration-150">
        {children}
      </Link>
    </li>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-brand-line-soft bg-brand-bg-section dark:bg-brand-bg1">
      <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">

        {/* Main grid */}
        <div className="py-16 grid grid-cols-[240px_1fr] max-[900px]:grid-cols-1 gap-16 max-[900px]:gap-10">

          {/* Brand column */}
          <div>
            <Link href="/" className="inline-flex items-center gap-[10px] font-bold text-[15px] tracking-[-0.01em]">
              <LogoMark />
              <span>Beaconmon</span>
            </Link>
            <p className="text-[13px] leading-[1.7] text-brand-muted mt-4 max-w-[210px]">
              Website and competitor intelligence for ecommerce brands. Watch your store, watch theirs.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-5 max-[700px]:grid-cols-3 max-[460px]:grid-cols-2 gap-x-6 gap-y-10">

            {/* Product + For */}
            <div>
              <ColHead>Product</ColHead>
              <ul>
                {PRODUCT_LINKS.map(([href, label]) => (
                  <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
              </ul>
              <div className="border-t border-brand-line-soft my-5" />
              <ul>
                {FOR_LINKS.map(([href, label]) => (
                  <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Free Tools */}
            <div>
              <ColHead>Free Tools</ColHead>
              <ul>
                {TOOLS_LINKS.map(([href, label]) => (
                  <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
                <li className="py-[7px]">
                  <a
                    href="https://chromewebstore.google.com/detail/beaconmon-competitor-x-ra/djimmfglabcdgooiigibpmghbgiebdke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13.5px] text-brand-dim hover:text-brand-text transition-colors duration-150"
                  >
                    Chrome Extension
                  </a>
                </li>
              </ul>
            </div>

            {/* Compare */}
            <div>
              <ColHead>Compare</ColHead>
              <ul>
                {COMPARE_LINKS.map(([href, label]) => (
                  <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Guides */}
            <div>
              <ColHead>Guides</ColHead>
              <ul>
                {GUIDES_LINKS.map(([href, label]) => (
                  <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <ColHead>Company</ColHead>
              <ul>
                {COMPANY_LINKS.map(([href, label]) => (
                  <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
                <FooterLink href="/blog">Blog</FooterLink>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-line-soft py-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[12px] text-brand-muted">© 2026 Beaconmon. Made for ecommerce.</p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://launchigniter.com/product/beaconmon?ref=badge-beaconmon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block opacity-75 hover:opacity-100 transition-opacity duration-150"
            >
              <Image
                src="https://launchigniter.com/api/badge/beaconmon?theme=neutral"
                alt="Featured on LaunchIgniter"
                width={180}
                height={47}
                unoptimized
              />
            </a>
            <a
              href="https://postyourstartup.co/startup/beaconmon?ref=badge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block opacity-75 hover:opacity-100 transition-opacity duration-150"
            >
              <Image
                src="https://postyourstartup.co/api/badge/beaconmon?theme=light"
                alt="Featured on PostYourStartup"
                width={180}
                height={47}
                unoptimized
              />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

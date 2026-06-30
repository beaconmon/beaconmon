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
  ['/tools/shopify-competitor-changes', 'Competitor Changes'],
  ['/tools/competitor-intelligence-report', 'Intel Report'],
  ['/tools/competitor-intelligence-roi', 'ROI Calculator'],
  ['/tools/monitoring-coverage', 'Coverage Auditor'],
  ['/tools/bfcm-readiness', 'BFCM Readiness'],
  ['/tools/downtime-detection-calculator', 'Downtime Calculator'],
  ['/tools/shopify-uptime-test', 'Shopify Uptime Test'],
  ['/tools', 'All free tools'],
];

const ALTERNATIVES_LINKS: [string, string][] = [
  ['/alternatives', 'All alternatives'],
  ['/alternatives/betterstack', 'BetterStack'],
  ['/alternatives/distill', 'Distill'],
  ['/alternatives/hexowatch', 'Hexowatch'],
  ['/alternatives/intelis', 'Intelis'],
  ['/alternatives/pagecrawl', 'PageCrawl'],
  ['/alternatives/panoramata', 'Panoramata'],
  ['/alternatives/price2spy', 'Price2Spy'],
  ['/alternatives/prisync', 'Prisync'],
  ['/alternatives/rivalert', 'Rivalert'],
  ['/alternatives/uptimerobot', 'UptimeRobot'],
  ['/alternatives/visualping', 'Visualping'],
  ['/alternatives/wachete', 'Wachete'],
];

const COMPARE_LINKS: [string, string][] = [
  ['/vs', 'All comparisons'],
  ['/vs/better-uptime', 'vs BetterStack'],
  ['/vs/distill', 'vs Distill'],
  ['/vs/hexowatch', 'vs Hexowatch'],
  ['/vs/intelis', 'vs Intelis'],
  ['/vs/panoramata', 'vs Panoramata'],
  ['/vs/pingdom', 'vs Pingdom'],
  ['/vs/prisync', 'vs Prisync'],
  ['/vs/rivalert', 'vs Rivalert'],
  ['/vs/statuscake', 'vs StatusCake'],
  ['/vs/uptimerobot', 'vs UptimeRobot'],
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
          <div className="grid grid-cols-6 max-[900px]:grid-cols-3 max-[460px]:grid-cols-2 gap-x-6 gap-y-10">

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

            {/* Alternatives */}
            <div>
              <ColHead>Alternatives</ColHead>
              <ul>
                {ALTERNATIVES_LINKS.map(([href, label]) => (
                  <FooterLink key={label} href={href}>{label}</FooterLink>
                ))}
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
        <div className="border-t border-brand-line-soft py-6">
          <p className="text-[12px] text-brand-muted">© 2026 Beaconmon. Made for ecommerce.</p>
        </div>

      </div>
    </footer>
  );
}

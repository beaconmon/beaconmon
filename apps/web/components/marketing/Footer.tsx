import Image from 'next/image';
import Link from 'next/link';
import LogoMark from './LogoMark';

const PRODUCT_LINKS: [string, string][] = [
  ['/features#monitors', 'Monitors'],
  ['/features/intelligence', 'Intelligence'],
  ['/features#status-pages', 'Status Pages'],
  ['/features#smart-alerts', 'Smart Alerts'],
  ['/features#reliability-targets', 'Reliability Targets'],
  ['/pricing', 'Pricing'],
  ['/changelog', 'Changelog'],
];

const FOR_LINKS: [string, string][] = [
  ['/for/shopify', 'Shopify'],
  ['/for/woocommerce', 'WooCommerce'],
  ['/for/dtc-brands', 'DTC Brands'],
];

const COMPARE_LINKS: [string, string][] = [
  ['/vs', 'All comparisons'],
  ['/vs/distill', 'vs Distill'],
  ['/vs/hexowatch', 'vs Hexowatch'],
  ['/vs/prisync', 'vs Prisync'],
  ['/vs/visualping', 'vs Visualping'],
];

const GUIDES_LINKS: [string, string][] = [
  ['/shopify-competitor-monitoring', 'Shopify Competitor Monitoring'],
  ['/competitor-price-tracking', 'Price Tracking'],
  ['/ecommerce-competitor-intelligence', 'Competitor Intelligence'],
  ['/woocommerce-competitor-monitoring', 'WooCommerce Monitoring'],
  ['/ecommerce-uptime-monitoring-guide', 'Uptime Monitoring Guide'],
];

const COMPANY_LINKS: [string, string][] = [
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy'],
  ['/terms', 'Terms'],
  ['/refund-policy', 'Refund Policy'],
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-line-soft pt-14 pb-8 bg-brand-bg-section dark:bg-brand-bg1">
      <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
        <div className="grid grid-cols-[2fr_3fr] max-[640px]:grid-cols-1 gap-12 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-[10px] font-bold text-[16px] tracking-[-0.01em]">
              <LogoMark />
              <span>Beaconmon</span>
            </Link>
            <p className="text-[13px] text-brand-muted mt-[14px] max-w-[260px]">Website and competitor intelligence for ecommerce brands. Watch your store, watch theirs.</p>
            <p className="text-[12px] text-brand-muted mt-8">© 2026 Beaconmon. Made for ecommerce.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <a href="https://launchigniter.com/product/beaconmon?ref=badge-beaconmon" target="_blank" rel="noopener noreferrer" className="inline-block">
                <Image src="https://launchigniter.com/api/badge/beaconmon?theme=neutral" alt="Featured on LaunchIgniter" width={212} height={55} unoptimized />
              </a>
              <a href="https://postyourstartup.co/startup/beaconmon?ref=badge" target="_blank" rel="noopener noreferrer" className="inline-block">
                <Image src="https://postyourstartup.co/api/badge/beaconmon?theme=light" alt="Featured on PostYourStartup" width={212} height={55} unoptimized />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-5 max-[800px]:grid-cols-3 max-[640px]:grid-cols-2 max-[400px]:grid-cols-1 gap-8">
            <div>
              <h4 className="text-[12px] font-semibold text-brand-dim mb-4">Product</h4>
              <ul className="space-y-0">
                {PRODUCT_LINKS.map(([href, label]) => (
                  <li key={label} className="py-[6px]">
                    <Link href={href} className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-brand-dim mb-4">For</h4>
              <ul className="space-y-0">
                {FOR_LINKS.map(([href, label]) => (
                  <li key={label} className="py-[6px]">
                    <Link href={href} className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-brand-dim mb-4">Compare</h4>
              <ul className="space-y-0">
                {COMPARE_LINKS.map(([href, label]) => (
                  <li key={label} className="py-[6px]">
                    <Link href={href} className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-brand-dim mb-4">Guides</h4>
              <ul className="space-y-0">
                {GUIDES_LINKS.map(([href, label]) => (
                  <li key={label} className="py-[6px]">
                    <Link href={href} className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-brand-dim mb-4">Company</h4>
              <ul className="space-y-0">
                {COMPANY_LINKS.map(([href, label]) => (
                  <li key={label} className="py-[6px]">
                    <Link href={href} className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

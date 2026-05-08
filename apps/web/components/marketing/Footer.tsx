import Link from 'next/link';
import LogoMark from './LogoMark';

const PRODUCT_LINKS: [string, string][] = [
  ['/features', 'Features'],
  ['/pricing', 'Pricing'],
  ['/integrations', 'Integrations'],
  ['/changelog', 'Changelog'],
];

const COMPANY_LINKS: [string, string][] = [
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/security', 'Security'],
];

const SOLUTIONS_LINKS: [string, string][] = [
  ['/for/agencies', 'Agencies'],
  ['/for/freelancers', 'Freelancers'],
  ['/for/ecommerce', 'E-commerce'],
  ['/for/developers', 'Developers'],
];

const COMPARE_LINKS: [string, string][] = [
  ['/vs', 'Compare all'],
  ['/vs/uptimerobot', 'vs UptimeRobot'],
  ['/vs/pingdom', 'vs Pingdom'],
  ['/vs/better-uptime', 'vs Better Uptime'],
  ['/vs/statuscake', 'vs StatusCake'],
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-line-soft pt-14 pb-8 bg-brand-bg1">
      <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
        <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] max-[1200px]:grid-cols-[1.4fr_repeat(3,1fr)] max-[880px]:grid-cols-[1.4fr_repeat(2,1fr)] max-[640px]:grid-cols-2 max-[400px]:grid-cols-1 gap-12 max-[880px]:gap-8 mb-12">
          <div className="max-[1024px]:col-span-1">
            <Link href="/" className="inline-flex items-center gap-[10px] font-bold text-[16px] tracking-[-0.01em]">
              <LogoMark />
              <span>Beaconmon</span>
            </Link>
            <p className="text-[13px] text-brand-muted mt-[14px] max-w-[260px]">Know before your users do.</p>
          </div>
          <div>
            <h4 className="text-[12px] tracking-[0.08em] uppercase text-brand-muted font-semibold mb-4">Product</h4>
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
            <h4 className="text-[12px] tracking-[0.08em] uppercase text-brand-muted font-semibold mb-4">Company</h4>
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
          <div>
            <h4 className="text-[12px] tracking-[0.08em] uppercase text-brand-muted font-semibold mb-4">Solutions</h4>
            <ul className="space-y-0">
              {SOLUTIONS_LINKS.map(([href, label]) => (
                <li key={label} className="py-[6px]">
                  <Link href={href} className="text-[14px] text-brand-dim hover:text-brand-text transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] tracking-[0.08em] uppercase text-brand-muted font-semibold mb-4">Compare</h4>
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
        </div>
        <div className="pt-6 border-t border-brand-line-soft flex justify-between flex-wrap gap-4 text-[13px] text-brand-muted">
          <div>© 2026 Beaconmon</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-brand-dim transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-brand-dim transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

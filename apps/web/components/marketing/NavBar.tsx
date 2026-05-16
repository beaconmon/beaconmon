'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoMark from './LogoMark';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const SOLUTIONS_LINKS: [string, string][] = [
  ['/for/agencies', 'Agencies'],
  ['/for/freelancers', 'Freelancers'],
  ['/for/ecommerce', 'E-commerce'],
  ['/for/developers', 'Developers'],
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      const nav = document.getElementById('mobile-menu');
      const toggle = document.getElementById('menu-toggle');
      if (nav && !nav.contains(e.target as Node) && toggle && !toggle.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/85 dark:bg-[rgba(10,10,15,0.85)] backdrop-blur-[10px] border-b border-brand-line-soft'
          : 'bg-transparent border-b border-transparent backdrop-blur-[10px]'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 flex items-center justify-between h-16">
        <Link href="/" className="inline-flex items-center gap-[10px] font-bold text-[16px] tracking-[-0.01em]">
          <LogoMark />
          <span>Beaconmon</span>
        </Link>

        <div className="flex gap-8 text-sm text-brand-dim max-[880px]:hidden">
          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-brand-text transition-colors duration-150 cursor-default">
              Solutions
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {solutionsOpen && (
              <div className="absolute top-full left-0 pt-3">
                <div className="bg-white dark:bg-[rgba(10,10,15,0.97)] border border-brand-line-soft rounded-xl p-1.5 min-w-[170px] shadow-xl">
                  {SOLUTIONS_LINKS.map(([href, label]) => (
                    <Link
                      key={label}
                      href={href}
                      className="block px-3 py-2 text-sm text-brand-dim hover:text-brand-text hover:bg-white/5 rounded-lg transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/features" className="hover:text-brand-text transition-colors duration-150">Features</Link>
          <Link href="/pricing" className="hover:text-brand-text transition-colors duration-150">Pricing</Link>
        </div>

        <div className="flex items-center gap-5">
          <div className="max-[880px]:hidden">
            <ThemeToggle />
          </div>
          <Link href="/sign-in" className="text-sm text-brand-dim hover:text-brand-text transition-colors duration-150 max-[880px]:hidden">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-[38px] px-4 text-sm font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[0_0_0_1px_rgba(0,229,122,0.3),0_6px_20px_rgba(0,229,122,0.2)] hover:scale-[1.02] hover:bg-[#00ff8a] hover:shadow-[0_0_0_1px_rgba(0,229,122,0.5),0_8px_24px_rgba(0,229,122,0.35)] transition-all duration-[120ms] whitespace-nowrap"
          >
            Start free
          </Link>
          <button
            id="menu-toggle"
            className="hidden max-[880px]:inline-flex bg-transparent border-0 text-brand-text p-2"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="max-[880px]:block hidden absolute top-16 left-0 right-0 border-b border-brand-line-soft bg-white/97 dark:bg-[rgba(10,10,15,0.97)] backdrop-blur-[10px] px-5 py-4"
          >
            <div className="flex flex-col gap-1">
              <p className="py-1 text-[11px] tracking-[0.08em] uppercase text-brand-muted font-semibold">Solutions</p>
              {SOLUTIONS_LINKS.map(([href, label]) => (
                <Link
                  key={label}
                  href={href}
                  className="py-2 pl-2 text-sm text-brand-dim hover:text-brand-text transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-brand-line-soft mt-2 pt-2">
                <Link
                  href="/features"
                  className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors block"
                  onClick={() => setMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors block"
                  onClick={() => setMenuOpen(false)}
                >
                  Pricing
                </Link>
              </div>
              <div className="border-t border-brand-line-soft mt-3 pt-3">
                <Link
                  href="/sign-in"
                  className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors block"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
              </div>
              <div className="border-t border-brand-line-soft mt-3 pt-3 flex items-center gap-3">
                <span className="text-[11px] tracking-[0.08em] uppercase text-brand-muted font-semibold">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

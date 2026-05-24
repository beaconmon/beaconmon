'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import LogoMark from './LogoMark';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

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
          ? 'bg-white/85 dark:bg-[var(--brand-nav-bg)] backdrop-blur-[10px] border-b border-brand-line-soft'
          : 'bg-transparent border-b border-transparent backdrop-blur-[10px]'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 flex items-center justify-between h-16">
        <Link href="/" className="inline-flex items-center gap-[10px] font-bold text-[16px] tracking-[-0.01em]">
          <LogoMark />
          <span>Beaconmon</span>
        </Link>

        <div className="flex gap-8 text-sm text-brand-dim max-[880px]:hidden">
          <div className="relative group">
            <button className="text-[14px] font-medium text-brand-dim hover:text-brand-text transition-colors flex items-center gap-1">
              Product
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block">
              <div className="bg-brand-bg1 border border-brand-line-soft rounded-[10px] py-1 min-w-[160px] shadow-lg">
                <Link href="/features" className="block px-4 py-2 text-[13px] text-brand-dim hover:text-brand-text hover:bg-brand-bg2 transition-colors" onClick={() => setMenuOpen(false)}>Features</Link>
                <Link href="/pricing" className="block px-4 py-2 text-[13px] text-brand-dim hover:text-brand-text hover:bg-brand-bg2 transition-colors" onClick={() => setMenuOpen(false)}>Pricing</Link>
                <Link href="/vs" className="block px-4 py-2 text-[13px] text-brand-dim hover:text-brand-text hover:bg-brand-bg2 transition-colors" onClick={() => setMenuOpen(false)}>Compare</Link>
              </div>
            </div>
          </div>
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
            className="inline-flex items-center justify-center h-[48px] px-4 text-sm font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] hover:scale-[1.02] hover:bg-[var(--brand-green-hover)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_0_1px_rgba(0,147,90,0.4),0_8px_22px_rgba(0,147,90,0.28)] transition-all duration-[120ms] whitespace-nowrap"
          >
            Start free
          </Link>
          <button
            id="menu-toggle"
            className="hidden max-[880px]:inline-flex min-h-[48px] min-w-[48px] items-center justify-center bg-transparent border-0 text-brand-text"
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
            className="max-[880px]:block hidden absolute top-16 left-0 right-0 border-b border-brand-line bg-white dark:bg-[var(--brand-mobile-menu-bg)] shadow-lg dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] px-5 py-4"
          >
            <div className="flex flex-col gap-1">
              <button
                className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors flex items-center gap-1 text-left"
                onClick={() => setProductOpen((v) => !v)}
              >
                Product
                <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${productOpen ? 'rotate-180' : ''}`} />
              </button>
              {productOpen && (
                <div className="pl-3 flex flex-col gap-0">
                  <Link href="/features" className="py-[6px] text-sm text-brand-dim hover:text-brand-text transition-colors block" onClick={() => setMenuOpen(false)}>Features</Link>
                  <Link href="/pricing" className="py-[6px] text-sm text-brand-dim hover:text-brand-text transition-colors block" onClick={() => setMenuOpen(false)}>Pricing</Link>
                  <Link href="/vs" className="py-[6px] text-sm text-brand-dim hover:text-brand-text transition-colors block" onClick={() => setMenuOpen(false)}>Compare</Link>
                </div>
              )}
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

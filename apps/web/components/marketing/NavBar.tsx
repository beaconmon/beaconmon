'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          ? 'bg-[rgba(10,10,15,0.85)] backdrop-blur-[10px] border-b border-brand-line-soft'
          : 'bg-transparent border-b border-transparent backdrop-blur-[10px]'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-[10px] font-bold text-[16px] tracking-[-0.01em]">
          <span className="relative inline-flex items-center justify-center w-[22px] h-[22px]">
            <span className="absolute w-[22px] h-[22px] rounded-full border-[1.5px] border-brand-green opacity-40 animate-logo-pulse" />
            <span className="absolute w-2 h-2 rounded-full bg-brand-green shadow-[0_0_10px_#00E57A]" />
          </span>
          <span>Beaconmon</span>
        </Link>

        {/* Nav links */}
        <div className="flex gap-8 text-sm text-brand-dim max-[880px]:hidden">
          <Link href="#features" className="hover:text-brand-text transition-colors duration-150">Features</Link>
          <Link href="#pricing" className="hover:text-brand-text transition-colors duration-150">Pricing</Link>
          <Link href="#status" className="hover:text-brand-text transition-colors duration-150">Status Pages</Link>
          <Link href="#docs" className="hover:text-brand-text transition-colors duration-150">Docs</Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-5">
          <Link href="/sign-in" className="text-sm text-brand-dim hover:text-brand-text transition-colors duration-150 max-[880px]:hidden">
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-[38px] px-4 text-sm font-semibold rounded-lg bg-brand-green text-[#001a0c] shadow-[0_0_0_1px_rgba(0,229,122,0.3),0_6px_20px_rgba(0,229,122,0.2)] hover:scale-[1.02] hover:bg-[#00ff8a] hover:shadow-[0_0_0_1px_rgba(0,229,122,0.5),0_8px_24px_rgba(0,229,122,0.35)] transition-all duration-[120ms] whitespace-nowrap"
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

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="max-[880px]:block hidden absolute top-16 left-0 right-0 border-b border-brand-line-soft bg-[rgba(10,10,15,0.97)] backdrop-blur-[10px] px-5 py-4"
          >
            <div className="flex flex-col gap-1">
              <Link
                href="#features"
                className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#status"
                className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Status Pages
              </Link>
              <Link
                href="#docs"
                className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Docs
              </Link>
              <div className="border-t border-brand-line-soft mt-3 pt-3">
                <Link
                  href="/sign-in"
                  className="py-2 text-sm text-brand-dim hover:text-brand-text transition-colors block"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

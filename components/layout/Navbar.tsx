"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { navbarConfig } from "@/config/navbar";

export default function Navbar() {
  const { brand, navLinks, cta, scrollThreshold } = navbarConfig;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > scrollThreshold);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  const mobileNavLinks = [...navLinks, { label: cta.label, href: cta.href }];

  return (
    <header className="sticky top-[32px] z-50 w-full transition-all duration-300 mt-[32px] font-[Gantari,sans-serif]">
      <div className="max-w-[1140px] mx-auto px-4">
        <div
          className={`flex items-center justify-between px-4 py-4 rounded-[20px] transition-all duration-300 backdrop-blur-md bg-[rgba(255,255,255,0.1)] ${
            isScrolled
              ? "shadow-lg border border-white/20"
              : "border border-transparent"
          }`}
        >
          {/* Logo */}
          <Link href={brand.logoHref} className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoSrc}
              alt={brand.logoAlt}
              className="h-[20px] w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-base font-semibold text-[#E8EDF4] hover:text-[var(--mtr-green)] transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href={cta.href}
              className="inline-flex items-center justify-center px-7 py-3 bg-[var(--mtr-green)] hover:bg-[var(--mtr-green-dk)] text-white text-[15px] font-bold rounded-lg transition-colors"
            >
              {cta.label}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-[#0A1220] border border-[var(--mtr-border)] rounded-xl shadow-xl overflow-hidden backdrop-blur-lg">
            <nav className="flex flex-col py-2">
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-6 py-3 text-sm font-medium text-[#E8EDF4] hover:bg-[var(--mtr-border)]/50 hover:text-[var(--mtr-green)] transition-colors border-b border-[var(--mtr-border)]/30 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
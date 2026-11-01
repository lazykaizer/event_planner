'use client';

import React, { useState, useEffect } from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';

interface LandingNavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onCtaClick: () => void;
}

export function LandingNavbar({
  language,
  onLanguageChange,
  onCtaClick,
}: LandingNavbarProps) {
  const content = LANDING_CONTENT[language].nav;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = totalScroll > 0 ? (currentScroll / totalScroll) * 100 : 0;
      setScrollProgress(progress);
      setIsScrolled(currentScroll > 30);

      // Section scroll-spy
      const sections = ['faq', 'trust', 'features', 'live-demo', 'how-it-works', 'problem', 'hero'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'how-it-works', label: content.howItWorks },
    { id: 'live-demo', label: content.liveDemo },
    { id: 'features', label: content.features },
    { id: 'faq', label: content.faq },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 px-4 py-2 bg-marigold text-ink font-bold rounded shadow-lg outline-2 outline-offset-2 outline-white text-xs"
      >
        {language === 'hi' ? 'सीधे सामग्री पर जाएं' : 'Skip to main content'}
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#4A0D22]/90 backdrop-blur-md border-b border-[#C9962B]/25 shadow-lg shadow-black/10'
            : 'bg-[#4A0D22]/60 backdrop-blur-xs border-b border-transparent'
        }`}
      >
        {/* Scroll Progress Bar (2px Marigold) */}
        <div
          className="h-[2px] bg-gradient-to-r from-marigold to-marigold-light transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('hero');
              }}
              className="flex items-center gap-2.5 text-white group focus:outline-none focus:ring-2 focus:ring-marigold rounded-md p-1"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-marigold to-[#C9962B] text-ink font-extrabold flex items-center justify-center text-base shadow-xs group-hover:scale-105 transition-transform">
                🛡️
              </span>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-cream-50 leading-none">
                  Shaadi Guardian
                </span>
                <span className="text-[10px] text-marigold-light font-medium tracking-wide">
                  Quote X-Ray
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className={`relative text-xs sm:text-sm font-medium transition-colors py-1 ${
                      isActive ? 'text-marigold font-bold' : 'text-cream-200 hover:text-white'
                    } focus:outline-none focus:ring-2 focus:ring-marigold rounded`}
                  >
                    {link.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-marigold rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Language Toggle & CTA */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div
                className="flex items-center bg-[#2E0715] p-0.5 rounded-full border border-[#C9962B]/30"
                role="radiogroup"
                aria-label="Language selection"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={language === 'en'}
                  onClick={() => onLanguageChange('en')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                    language === 'en'
                      ? 'bg-marigold text-ink shadow-xs'
                      : 'text-cream-300 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={language === 'hi'}
                  onClick={() => onLanguageChange('hi')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                    language === 'hi'
                      ? 'bg-marigold text-ink shadow-xs'
                      : 'text-cream-300 hover:text-white'
                  }`}
                >
                  हिंदी
                </button>
              </div>

              {/* Primary CTA Button */}
              <button
                type="button"
                onClick={onCtaClick}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-marigold text-ink hover:bg-marigold-light transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-marigold"
              >
                <span>🔍</span>
                <span>{content.ctaButton}</span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="md:hidden p-2 text-cream-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-marigold rounded"
              >
                <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#4A0D22] border-b border-[#C9962B]/30 px-4 py-4 space-y-3 shadow-xl animate-slide-up">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="text-left py-2 px-3 text-sm font-medium text-cream-100 hover:bg-[#7A1634] rounded transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[#C9962B]/20">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onCtaClick();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-lg bg-marigold text-ink hover:bg-marigold-light shadow-sm"
              >
                <span>🔍</span>
                <span>{content.ctaButton}</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

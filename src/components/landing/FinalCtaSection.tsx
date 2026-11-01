'use client';

import React from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';
import { RangoliOrnament } from '@/components/landing/RangoliOrnament';

interface FinalCtaSectionProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onXRayClick: () => void;
  onPlanClick: () => void;
}

export function FinalCtaSection({
  language,
  onLanguageChange,
  onXRayClick,
  onPlanClick,
}: FinalCtaSectionProps) {
  const content = LANDING_CONTENT[language].finalCta;

  return (
    <footer
      aria-label="Final CTA and Footer"
      className="bg-gradient-to-b from-[#7A1634] via-[#520A21] to-[#360818] text-white relative overflow-hidden"
    >
      {/* Decorative Ornaments */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-30">
        <RangoliOrnament size={360} opacity={0.06} />
      </div>

      {/* Main Call to Action Box */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#2E0715] text-marigold-light border border-[#C9962B]/30">
          <span>🛡️</span>
          <span>Zero-Regret Indian Celebrations</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-cream-50 leading-tight">
          {content.headline}
        </h2>

        <p className="text-xs sm:text-base text-cream-200/90 max-w-2xl mx-auto leading-relaxed">
          {content.subline}
        </p>

        {/* 2 Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onXRayClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-marigold text-ink hover:bg-marigold-light shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-marigold"
          >
            <span>🔍 {content.ctaPrimary}</span>
          </button>

          <button
            type="button"
            onClick={onPlanClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-sm border-2 border-cream-200/60 text-cream-50 hover:bg-cream-50/10 hover:border-cream-100 transition-all focus:outline-none focus:ring-2 focus:ring-cream-200"
          >
            <span>📊 {content.ctaSecondary}</span>
          </button>
        </div>
      </div>

      {/* Bottom Footer Strip */}
      <div className="border-t border-[#C9962B]/25 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream-300">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-marigold text-ink font-bold flex items-center justify-center text-xs">
              🛡️
            </span>
            <span className="font-heading font-bold text-cream-100 text-sm">
              Shaadi Guardian
            </span>
            <span className="text-[11px] text-cream-400">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Language Switcher */}
          <div
            className="flex items-center bg-[#2E0715] p-0.5 rounded-full border border-[#C9962B]/30"
            role="radiogroup"
            aria-label="Footer language selection"
          >
            <button
              type="button"
              role="radio"
              aria-checked={language === 'en'}
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                language === 'en'
                  ? 'bg-marigold text-ink shadow-xs'
                  : 'text-cream-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={language === 'hi'}
              onClick={() => onLanguageChange('hi')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                language === 'hi'
                  ? 'bg-marigold text-ink shadow-xs'
                  : 'text-cream-300 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-cream-400 text-center leading-relaxed max-w-3xl mx-auto border-t border-white/5 pt-4">
          {content.disclaimer}
        </p>
      </div>
    </footer>
  );
}

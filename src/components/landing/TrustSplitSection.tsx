'use client';

import React from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';

interface TrustSplitSectionProps {
  language: Language;
}

export function TrustSplitSection({ language }: TrustSplitSectionProps) {
  const content = LANDING_CONTENT[language].trustSplit;

  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="py-16 sm:py-24 bg-[#F3E6CC] border-b border-[#C9962B]/25 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#7A1634]">
            Trust & Architectural Integrity
          </span>
          <h2
            id="trust-heading"
            className="text-2xl sm:text-4xl font-heading font-extrabold text-[#4A0D22] tracking-tight"
          >
            {content.heading}
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {content.subline}
          </p>

          {/* Central Tagline Badge */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#4A0D22] text-marigold-light border border-[#C9962B]/40 shadow-sm">
              <span>🔒</span>
              <span>{content.tagline}</span>
            </span>
          </div>
        </div>

        {/* Two-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Column 1: AI Reads and Explains */}
          <div className="bg-white/90 rounded-2xl p-6 sm:p-8 border-2 border-indigo-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xl text-indigo-700">
                  🤖
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900">
                    {content.aiTitle}
                  </h3>
                  <span className="text-[11px] font-semibold text-indigo-600 block">
                    Semantic Intelligence Engine
                  </span>
                </div>
              </div>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-gray-700">
                {content.aiPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-indigo-600 font-bold shrink-0">✓</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-indigo-100 text-[11px] text-gray-500 italic">
              AI handles language semantics and polite framing, never math.
            </div>
          </div>

          {/* Column 2: Code Calculates and Checks */}
          <div className="bg-white/90 rounded-2xl p-6 sm:p-8 border-2 border-[#0E7C7B]/40 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E2F3F2] border border-[#0E7C7B]/30 flex items-center justify-center text-xl text-[#0E7C7B]">
                  🛡️
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900">
                    {content.codeTitle}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#0E7C7B] block">
                    Deterministic Math & Rules Engine
                  </span>
                </div>
              </div>

              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-gray-700">
                {content.codePoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-[#0E7C7B] font-bold shrink-0">✓</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-emerald-100 text-[11px] text-gray-500 italic">
              Arithmetic and safety checks are 100% hard-coded in TypeScript.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';

interface FaqSectionProps {
  language: Language;
}

export function FaqSection({ language }: FaqSectionProps) {
  const content = LANDING_CONTENT[language].faq;
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleAccordion = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-16 sm:py-24 bg-cream-50 border-b border-[#C9962B]/20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#7A1634]">
            Transparent Answers
          </span>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-4xl font-heading font-extrabold text-[#4A0D22] tracking-tight"
          >
            {content.heading}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {content.subline}
          </p>
        </div>

        {/* Accessible Accordion List */}
        <div className="space-y-3.5">
          {content.items.map((item, idx) => {
            const isOpen = openIndices.includes(idx);
            const buttonId = `faq-trigger-${idx}`;
            const panelId = `faq-panel-${idx}`;

            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-[#C9962B]/25 overflow-hidden shadow-2xs transition-all duration-200"
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleAccordion(idx)}
                  className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-[#4A0D22] hover:bg-cream-100/60 focus:outline-none focus:ring-2 focus:ring-marigold transition-colors"
                >
                  <span>{item.q}</span>
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-transform duration-200 ${
                      isOpen
                        ? 'bg-marigold text-ink rotate-180'
                        : 'bg-cream-200 text-gray-700'
                    }`}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-cream-100"
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

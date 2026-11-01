'use client';

import React from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';

interface ProblemStripProps {
  language: Language;
}

export function ProblemStrip({ language }: ProblemStripProps) {
  const content = LANDING_CONTENT[language].problem;

  const scenarios = [
    {
      title: content.card1Title,
      desc: content.card1Desc,
      icon: (
        <svg
          className="w-10 h-10 text-[#7A1634]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      title: content.card2Title,
      desc: content.card2Desc,
      icon: (
        <svg
          className="w-10 h-10 text-[#C62839]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
    },
    {
      title: content.card3Title,
      desc: content.card3Desc,
      icon: (
        <svg
          className="w-10 h-10 text-[#0E7C7B]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  ];

  return (
    <section
      id="problem"
      aria-labelledby="problem-heading"
      className="py-16 sm:py-20 bg-cream-50 border-b border-[#C9962B]/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#7A1634]">
            Reality Check
          </span>
          <h2
            id="problem-heading"
            className="text-2xl sm:text-4xl font-heading font-extrabold text-[#4A0D22] tracking-tight"
          >
            {content.heading}
          </h2>
        </div>

        {/* 3 Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {scenarios.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-7 border border-[#C9962B]/25 shadow-sm hover:shadow-md hover:border-[#C9962B]/50 transition-all space-y-4 group flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-xl bg-cream-100 flex items-center justify-center border border-[#C9962B]/20 group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>

                <h3 className="text-lg font-heading font-bold text-[#4A0D22] leading-snug">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-cream-200 text-[11px] font-semibold text-gray-400">
                Common Scenario #{idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-gray-500 pt-8 italic">
          *{content.footnote}
        </p>
      </div>
    </section>
  );
}

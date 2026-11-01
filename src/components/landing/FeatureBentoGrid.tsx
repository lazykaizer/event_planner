'use client';

import React, { useState } from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';

interface FeatureBentoGridProps {
  language: Language;
}

export function FeatureBentoGrid({ language }: FeatureBentoGridProps) {
  const content = LANDING_CONTENT[language].bento;
  const [copied, setCopied] = useState(false);

  const handleCopyMock = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cards = [
    {
      icon: '💰',
      title: content.card1Title,
      desc: content.card1Desc,
      tag: 'Pure Code Math',
    },
    {
      icon: '🕵️‍♂️',
      title: content.card2Title,
      desc: content.card2Desc,
      tag: 'Omission Detection',
    },
    {
      icon: '🚨',
      title: content.card3Title,
      desc: content.card3Desc,
      tag: '7 Strict Rules',
    },
    {
      icon: '🛡️',
      title: content.card4Title,
      desc: content.card4Desc,
      tag: 'Milestone Shield',
    },
    {
      icon: '💬',
      title: content.card5Title,
      desc: content.card5Desc,
      tag: 'Cultural Fluency',
      isChatMock: true,
    },
    {
      icon: '⚖️',
      title: content.card6Title,
      desc: content.card6Desc,
      tag: 'Deterministic Rationales',
    },
  ];

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="py-16 sm:py-24 bg-cream-50 border-b border-[#C9962B]/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#7A1634]">
            Comprehensive Protection
          </span>
          <h2
            id="features-heading"
            className="text-2xl sm:text-4xl font-heading font-extrabold text-[#4A0D22] tracking-tight"
          >
            {content.heading}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {content.subline}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-[#C9962B]/25 shadow-sm hover:shadow-lg hover:border-[#C9962B] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-xl bg-cream-100 border border-[#C9962B]/20 inline-block">
                    {card.icon}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cream-200 text-[#7A1634]">
                    {card.tag}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-[#4A0D22] group-hover:text-[#7A1634] transition-colors">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {card.desc}
                </p>

                {/* Card 5 Chat Mock Bubble with copy button */}
                {card.isChatMock && (
                  <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-center justify-between gap-2 font-mono">
                    <span className="truncate">
                      &ldquo;Namaste ji, quote ke liye shukriya. Milestone terms check karein...&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyMock}
                      className="shrink-0 px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-sans font-bold hover:bg-emerald-700 transition-colors"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-cream-100 flex items-center text-[11px] font-semibold text-marigold-dark">
                <span>Explore capability →</span>
              </div>
            </div>
          ))}

          {/* Wide Planner Card (Spans 1 to 3 columns) */}
          <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-[#4A0D22] via-[#630E2A] to-[#4A0D22] text-white rounded-2xl p-6 sm:p-8 border border-[#C9962B]/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-shadow">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-marigold text-ink">
                <span>⭐</span>
                <span>Full Event Support</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-cream-50">
                {content.plannerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-cream-200/90 leading-relaxed">
                {content.plannerDesc}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-cream-100 border border-white/15">
                📊 AI Budget Breakdown
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-cream-100 border border-white/15">
                ⚡ What-If Simulator
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/10 text-xs text-cream-100 border border-white/15">
                📅 Critical Timeline
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

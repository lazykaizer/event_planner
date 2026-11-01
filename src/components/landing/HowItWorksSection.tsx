'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';

interface HowItWorksProps {
  language: Language;
}

export function HowItWorksSection({ language }: HowItWorksProps) {
  const content = LANDING_CONTENT[language].howItWorks;
  const sectionRef = useRef<HTMLElement>(null);
  const [fillPercent, setFillPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress across this section
      const start = windowHeight * 0.8;
      const end = -rect.height * 0.3;
      const progress = (start - rect.top) / (start - end);
      const clamped = Math.max(0, Math.min(100, progress * 100));
      setFillPercent(clamped);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stepIcons = [
    // Step 1: Paste
    <svg key="1" className="w-5 h-5 text-[#4A0D22]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>,
    // Step 2: Math
    <svg key="2" className="w-5 h-5 text-[#4A0D22]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="16" y1="14" x2="16" y2="18" />
      <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
    </svg>,
    // Step 3: Flag
    <svg key="3" className="w-5 h-5 text-[#4A0D22]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>,
    // Step 4: Shield/Lock/Chat
    <svg key="4" className="w-5 h-5 text-[#4A0D22]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>,
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-it-works-heading"
      className="py-16 sm:py-24 bg-[#F3E6CC] border-b border-[#C9962B]/25"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#7A1634]">
            Simple & Transparent
          </span>
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-4xl font-heading font-extrabold text-[#4A0D22] tracking-tight"
          >
            {content.heading}
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {content.subline}
          </p>
        </div>

        {/* 4 Steps with scroll-filled connecting line */}
        <div className="relative">
          {/* Horizontal Connecting Line (Desktop) */}
          <div
            className="hidden md:block absolute top-7 left-12 right-12 h-1 bg-[#C9962B]/30 rounded-full z-0"
            aria-hidden="true"
          >
            <div
              className="h-full bg-marigold rounded-full transition-all duration-150 ease-out"
              style={{ width: `${fillPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {content.steps.map((step, idx) => {
              const isFilled = fillPercent >= (idx / 3) * 80;
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center space-y-4 group"
                >
                  {/* Step Number Circle */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center font-heading font-extrabold text-base transition-all duration-300 shadow-md ${
                      isFilled
                        ? 'bg-marigold text-ink ring-4 ring-[#FFC857]/40 scale-105'
                        : 'bg-white text-[#7A1634] border-2 border-[#C9962B]/40'
                    }`}
                  >
                    <span>{step.number}</span>
                  </div>

                  {/* Icon Card */}
                  <div className="w-10 h-10 rounded-xl bg-white/80 border border-[#C9962B]/30 flex items-center justify-center shadow-xs">
                    {stepIcons[idx]}
                  </div>

                  {/* Text */}
                  <div className="space-y-1.5 px-2">
                    <h3 className="font-heading font-bold text-base text-[#4A0D22]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

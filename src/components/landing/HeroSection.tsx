'use client';

import React from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';
import { RangoliOrnament } from '@/components/landing/RangoliOrnament';
import { getLandingDemoCalculation } from '@/lib/landingSample';
import { formatINR } from '@/lib/formatters';

interface HeroSectionProps {
  language: Language;
  onXRayClick: () => void;
  onPlanClick: () => void;
}

export function HeroSection({ language, onXRayClick, onPlanClick }: HeroSectionProps) {
  const content = LANDING_CONTENT[language].hero;
  // Deterministic calculation on sample fixed quote (250 guests)
  const sampleData = getLandingDemoCalculation(250);

  return (
    <section
      id="hero"
      aria-label="Hero Section"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#4A0D22] via-[#5E0F2A] to-[#4A0D22] text-white"
    >
      {/* Background Decorative Rangoli Ornaments */}
      <div className="absolute -top-24 -left-24 z-0 pointer-events-none opacity-40">
        <RangoliOrnament size={480} opacity={0.07} />
      </div>
      <div className="absolute -bottom-28 -right-20 z-0 pointer-events-none opacity-40">
        <RangoliOrnament size={540} opacity={0.07} />
      </div>

      {/* Soft Marigold Radial Glow behind Visual */}
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-marigold/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#2E0715] text-marigold-light border border-[#C9962B]/35 shadow-sm">
              <span className="text-sm">🛡️</span>
              <span>{content.badge}</span>
            </div>

            {/* Main H1 Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-extrabold text-cream-50 leading-[1.15] tracking-tight">
              {content.headline}
            </h1>

            {/* Subline */}
            <p className="text-base sm:text-lg text-cream-200/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {content.subline}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                type="button"
                onClick={onXRayClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-marigold text-ink hover:bg-marigold-light hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-3 focus:ring-marigold"
              >
                <span>🔍</span>
                <span>{content.ctaPrimary}</span>
              </button>

              <button
                type="button"
                onClick={onPlanClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border-2 border-cream-200/60 text-cream-50 hover:bg-cream-50/10 hover:border-cream-100 transition-all focus:outline-none focus:ring-2 focus:ring-cream-200"
              >
                <span>📊</span>
                <span>{content.ctaSecondary}</span>
              </button>
            </div>

            {/* Trust Line */}
            <p className="text-xs text-cream-300/80 pt-1 flex items-center justify-center lg:justify-start gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-marigold" />
              <span>{content.trustLine}</span>
            </p>
          </div>

          {/* Right Column: Floating Glassmorphism Cards Visual */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md space-y-4">
              {/* WhatsApp Quote Card (Floating top) */}
              <div className="animate-float-slow bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-2xl relative">
                {/* Example Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-cream-100">
                      {content.whatsappSender}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-marigold/20 text-marigold-light border border-marigold/30">
                    {content.exampleBadge}
                  </span>
                </div>

                {/* Simulated Messy WhatsApp Message */}
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-cream-100 font-mono leading-relaxed space-y-1">
                  <p className="text-cream-300 text-[11px] font-sans">
                    💬 &ldquo;Sharma ji namaste, plate 1200 padega, setup ₹20,000 alag se, generator diesel as per actuals, advance 60% cash chahiye...&rdquo;
                  </p>
                </div>
              </div>

              {/* Conversion Arrow Indicator */}
              <div className="flex justify-center -my-2 relative z-20">
                <span className="w-7 h-7 rounded-full bg-marigold text-ink font-bold flex items-center justify-center text-xs shadow-md border-2 border-[#4A0D22]">
                  ↓
                </span>
              </div>

              {/* Deterministic Results Card (Floating bottom delayed) */}
              <div className="animate-float-delayed bg-[#2E0715]/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#C9962B]/40 shadow-2xl space-y-3">
                <div className="flex items-center justify-between text-xs text-cream-300">
                  <span className="font-semibold text-marigold-light">
                    ⚡ Instant X-Ray Protection Results
                  </span>
                  <span className="text-[10px] text-cream-400 font-mono">250 Guests</span>
                </div>

                {/* 3 Result Chips (Real calculated math, not typed fakes) */}
                <div className="space-y-2">
                  {/* Chip 1: True Cost */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                    <span className="text-cream-200 flex items-center gap-1.5">
                      <span>💰</span>
                      <span>{content.chipTrueCost}</span>
                    </span>
                    <span className="font-heading font-extrabold text-sm text-marigold-light">
                      {formatINR(sampleData.trueCost.totalTrueCost)}
                    </span>
                  </div>

                  {/* Chip 2: Hidden Extras */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>{content.chipHiddenCosts}</span>
                    </span>
                    <span className="font-semibold text-[11px]">Fuel · Tips · Overtime</span>
                  </div>

                  {/* Chip 3: Risk Flag */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#C62839]/20 border border-[#C62839]/40 text-xs text-red-200">
                    <span className="flex items-center gap-1.5">
                      <span>🚨</span>
                      <span>{content.chipRiskHigh}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[#C62839] text-white font-bold text-[10px]">
                      HIGH
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';
import {
  SAMPLE_LANDING_QUOTE_TEXT,
  getLandingDemoCalculation,
} from '@/lib/landingSample';
import { formatINR } from '@/lib/formatters';

interface LiveDemoSectionProps {
  language: Language;
  onOpenSampleInXRay: (sampleText: string) => void;
}

export function LiveDemoSection({
  language,
  onOpenSampleInXRay,
}: LiveDemoSectionProps) {
  const content = LANDING_CONTENT[language].demo;
  const [guestCount, setGuestCount] = useState<number>(250);

  // Compute live deterministic results on real TypeScript code
  const demoData = getLandingDemoCalculation(guestCount);
  const { trueCost, redFlags, overallRisk } = demoData;

  return (
    <section
      id="live-demo"
      aria-labelledby="live-demo-heading"
      className="py-16 sm:py-24 bg-gradient-to-b from-[#4A0D22] via-[#3A0719] to-[#4A0D22] text-white border-b border-[#C9962B]/30 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#2E0715] text-marigold-light border border-[#C9962B]/40">
            <span>⚡</span>
            <span>{content.badge}</span>
          </div>

          <h2
            id="live-demo-heading"
            className="text-2xl sm:text-4xl font-heading font-extrabold text-cream-50 tracking-tight"
          >
            {content.heading}
          </h2>

          <p className="text-xs sm:text-sm text-cream-200/90 leading-relaxed">
            {content.subline}
          </p>
        </div>

        {/* Demo Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 Cols): Pre-filled Sample Quote Card */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-[#C9962B]/35 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-marigold-light flex items-center gap-1.5">
                <span>📋</span>
                <span>{content.quoteTitle}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-cream-300 font-mono">
                Caterer
              </span>
            </div>

            {/* Read-only Quote Text Area */}
            <div
              className="p-3.5 rounded-xl bg-black/30 border border-white/10 text-xs text-cream-100 font-mono leading-relaxed whitespace-pre-wrap select-text h-64 overflow-y-auto"
              tabIndex={0}
              aria-label="Sample vendor quote text"
            >
              {SAMPLE_LANDING_QUOTE_TEXT}
            </div>

            <p className="text-[11px] text-cream-400 italic">
              Notice: Per-plate rate is ₹1200, but generator fuel is vague and advance demanded is 60%.
            </p>
          </div>

          {/* Right Column (7 Cols): Live Calculation & Risk Meter */}
          <div className="lg:col-span-7 bg-[#2E0715]/85 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-[#C9962B]/40 shadow-2xl space-y-6">
            {/* 1. Guest Count Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <label htmlFor="landing-guest-slider" className="text-cream-200">
                  {content.guestSliderLabel}:
                </label>
                <span className="text-marigold font-bold text-sm font-mono px-2 py-0.5 rounded bg-black/30 border border-[#C9962B]/30">
                  {guestCount} Pax
                </span>
              </div>

              <input
                id="landing-guest-slider"
                type="range"
                min={50}
                max={500}
                step={10}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                aria-label={content.guestSliderLabel}
                aria-valuemin={50}
                aria-valuemax={500}
                aria-valuenow={guestCount}
                aria-valuetext={`${guestCount} guests, total cost ${formatINR(trueCost.totalTrueCost)}`}
                className="w-full h-2.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-marigold focus:outline-none focus:ring-2 focus:ring-marigold"
              />
              <div className="flex justify-between text-[10px] text-cream-400 font-mono">
                <span>50 Pax</span>
                <span>250 Pax</span>
                <span>500 Pax</span>
              </div>
            </div>

            {/* 2. Real-time True Cost Box */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/15 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <span className="text-xs uppercase tracking-wider font-semibold text-cream-300">
                  {content.trueCostLabel}
                </span>
                <span
                  data-testid="demo-total-cost"
                  className="text-2xl sm:text-3xl font-heading font-extrabold text-marigold-light"
                >
                  {formatINR(trueCost.totalTrueCost)}
                </span>
              </div>

              {/* Formula */}
              <p
                data-testid="demo-formula"
                className="text-[11px] text-cream-300/80 font-mono break-all pt-1 border-t border-white/10"
              >
                {trueCost.formulaDescription} = {formatINR(trueCost.totalTrueCost)}
              </p>
            </div>

            {/* 3. Risk Meter & Detected Flags */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cream-200">{content.riskLabel}:</span>
                <span className="font-bold text-[#FFC857] flex items-center gap-1">
                  <span>🚨</span>
                  <span>{content.riskStatus}</span>
                </span>
              </div>

              {/* Segmented Risk Gauge */}
              <div
                className="grid grid-cols-3 gap-1.5 h-3 rounded-full overflow-hidden p-0.5 bg-black/40 border border-white/10"
                role="meter"
                aria-label="Risk Meter"
                aria-valuenow={overallRisk === 'high' ? 3 : overallRisk === 'medium' ? 2 : 1}
                aria-valuemin={1}
                aria-valuemax={3}
                aria-valuetext={overallRisk}
              >
                <div
                  className={`rounded-full transition-colors ${
                    overallRisk === 'low' ? 'bg-[#0E7C7B]' : 'bg-white/15'
                  }`}
                />
                <div
                  className={`rounded-full transition-colors ${
                    overallRisk === 'medium' ? 'bg-amber-500' : 'bg-white/15'
                  }`}
                />
                <div
                  className={`rounded-full transition-colors ${
                    overallRisk === 'high' ? 'bg-[#C62839] shadow-xs' : 'bg-white/15'
                  }`}
                />
              </div>

              {/* Triggered Flag Chips */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-cream-300 block">
                  {content.flagsTitle}
                </span>
                <div className="space-y-1 text-xs">
                  {redFlags.slice(0, 3).map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#C62839]/20 border border-[#C62839]/35 text-red-200 flex items-start gap-2"
                    >
                      <span className="text-xs shrink-0">⚠️</span>
                      <span className="text-[11px] leading-tight font-medium">
                        {typeof flag.message === 'object' ? flag.message[language] : flag.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Note & CTA Button */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <p className="text-[11px] text-cream-300 text-center sm:text-left">
                {content.demoNote}
              </p>
              <button
                type="button"
                onClick={() => onOpenSampleInXRay(SAMPLE_LANDING_QUOTE_TEXT)}
                className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-marigold text-ink hover:bg-marigold-light transition-all shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-marigold"
              >
                <span>🔍</span>
                <span>{content.ctaButton}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

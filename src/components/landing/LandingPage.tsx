'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { Language } from '@/types';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';

// Lazy-load below-the-fold sections with next/dynamic to optimize initial page load
const ProblemStrip = dynamic(
  () => import('@/components/landing/ProblemStrip').then((mod) => mod.ProblemStrip),
  { ssr: true }
);

const VendorMarquee = dynamic(
  () => import('@/components/landing/VendorMarquee').then((mod) => mod.VendorMarquee),
  { ssr: true }
);

const HowItWorksSection = dynamic(
  () =>
    import('@/components/landing/HowItWorksSection').then((mod) => mod.HowItWorksSection),
  { ssr: true }
);

const LiveDemoSection = dynamic(
  () => import('@/components/landing/LiveDemoSection').then((mod) => mod.LiveDemoSection),
  { ssr: true }
);

const FeatureBentoGrid = dynamic(
  () =>
    import('@/components/landing/FeatureBentoGrid').then((mod) => mod.FeatureBentoGrid),
  { ssr: true }
);

const TrustSplitSection = dynamic(
  () =>
    import('@/components/landing/TrustSplitSection').then((mod) => mod.TrustSplitSection),
  { ssr: true }
);

const FaqSection = dynamic(
  () => import('@/components/landing/FaqSection').then((mod) => mod.FaqSection),
  { ssr: true }
);

const FinalCtaSection = dynamic(
  () => import('@/components/landing/FinalCtaSection').then((mod) => mod.FinalCtaSection),
  { ssr: true }
);

interface LandingPageProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStartPlanner: () => void;
  onOpenXRay: (sampleQuoteText?: string) => void;
}

export function LandingPage({
  language,
  onLanguageChange,
  onStartPlanner,
  onOpenXRay,
}: LandingPageProps) {
  const handleOpenXRaySample = (sampleQuote?: string) => {
    onOpenXRay(sampleQuote);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 font-body text-gray-800 antialiased selection:bg-marigold selection:text-ink">
      {/* 1. Sticky Navbar */}
      <LandingNavbar
        language={language}
        onLanguageChange={onLanguageChange}
        onCtaClick={() => onOpenXRay()}
      />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* 2. Hero Section (Dark Maroon, Visual with Real Math Chips) */}
        <HeroSection
          language={language}
          onXRayClick={() => onOpenXRay()}
          onPlanClick={onStartPlanner}
        />

        {/* 3. Problem Strip (Cream, 3 Common Scenarios) */}
        <ProblemStrip language={language} />

        {/* Marquee Strip between Section 3 and 4 */}
        <VendorMarquee language={language} />

        {/* 4. How It Works (Warm Sand, Scroll-Filled Progress Line) */}
        <HowItWorksSection language={language} />

        {/* 5. Live Demo Section (Interactive Mini X-Ray Hero) */}
        <LiveDemoSection
          language={language}
          onOpenSampleInXRay={handleOpenXRaySample}
        />

        {/* 6. Feature Bento Grid (Cream, Asymmetric Grid) */}
        <FeatureBentoGrid language={language} />

        {/* 7. Where AI Helps, Where Code Decides (Sand, Trust Split) */}
        <TrustSplitSection language={language} />

        {/* 8. Accessible Accordion FAQ (Cream) */}
        <FaqSection language={language} />

        {/* 9. Final CTA & Footer Strip */}
        <FinalCtaSection
          language={language}
          onLanguageChange={onLanguageChange}
          onXRayClick={() => onOpenXRay()}
          onPlanClick={onStartPlanner}
        />
      </main>
    </div>
  );
}

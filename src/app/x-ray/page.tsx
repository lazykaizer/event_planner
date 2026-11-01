'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { AppState, Language } from '@/types';
import { loadState, saveState } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { QuoteXRayView } from '@/components/views/QuoteXRayView';
import { SAMPLE_LANDING_QUOTE_TEXT } from '@/lib/landingSample';

function QuoteXRayContent() {
  const searchParams = useSearchParams();
  const isSample = searchParams.get('sample') === '1' || searchParams.get('sample') === 'true';

  const [appState, setAppState] = useState<AppState>({
    intake: null,
    budgetPlan: null,
    planHistory: [],
    vendorAnalyses: [],
    timeline: null,
    language: 'en',
  });

  useEffect(() => {
    const loaded = loadState();
    if (loaded) {
      setAppState(loaded);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setAppState((prev) => {
      const next = { ...prev, language: lang };
      saveState(next);
      return next;
    });
  };

  const initialQuote = isSample ? SAMPLE_LANDING_QUOTE_TEXT : '';

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 font-body text-gray-800">
      <Navbar
        language={appState.language}
        onLanguageChange={handleLanguageChange}
        currentView="xray"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <QuoteXRayView
          language={appState.language}
          initialBudget={appState.budgetPlan?.totalBudget}
          initialQuoteText={initialQuote}
        />
      </main>

      <Footer language={appState.language} />
    </div>
  );
}

export default function QuoteXRayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-50 flex items-center justify-center text-maroon-900 font-medium">
          Loading Quote X-Ray...
        </div>
      }
    >
      <QuoteXRayContent />
    </Suspense>
  );
}

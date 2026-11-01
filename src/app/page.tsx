'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Language } from '@/types';
import { loadState, saveState } from '@/lib/storage';
import { LandingPage } from '@/components/landing/LandingPage';

export default function Home() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');

  // Load preferred language from saved state on mount
  useEffect(() => {
    const loaded = loadState();
    if (loaded?.language) {
      setLanguage(loaded.language);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    const loaded = loadState();
    saveState({ ...loaded, language: lang });
  };

  return (
    <LandingPage
      language={language}
      onLanguageChange={handleLanguageChange}
      onStartPlanner={() => router.push('/event')}
      onOpenXRay={(sampleQuoteText?: string) => {
        if (sampleQuoteText) {
          router.push('/x-ray?sample=1');
        } else {
          router.push('/x-ray');
        }
      }}
    />
  );
}

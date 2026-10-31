'use client';

import React from 'react';
import type { Language } from '@/types';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onReset?: () => void;
  hasPlan?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  currentView?: 'home' | 'xray';
  onViewChange?: (view: 'home' | 'xray') => void;
}

export function Navbar({
  language,
  onLanguageChange,
  onReset,
  hasPlan,
  activeTab = 'budget',
  onTabChange,
  currentView = 'home',
  onViewChange,
}: NavbarProps) {
  const tabs = [
    { id: 'budget', labelEn: 'Budget Breakdown', labelHi: 'बजट विवरण' },
    { id: 'what-if', labelEn: 'What-If Simulator', labelHi: 'व्हाट-इफ़ सिम्युलेटर' },
    { id: 'vendors', labelEn: 'Vendor Quotes & Red Flags', labelHi: 'वेंडर कोट्स एवं रेड फ्लैग' },
    { id: 'timeline', labelEn: 'Timeline', labelHi: 'समय सारिणी' },
    { id: 'summary', labelEn: 'Summary & Print', labelHi: 'सारांश एवं प्रिंट' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-cream-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onViewChange?.('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onViewChange?.('home');
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-maroon-900 to-saffron-500 flex items-center justify-center text-white font-heading text-xl shadow-sm">
              श
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xl text-maroon-900 tracking-tight">
                  Shaadi Guardian
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-saffron-100 text-saffron-800 rounded-full border border-saffron-200">
                  GenAI Financial Guard
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                {language === 'hi'
                  ? 'मध्यमवर्गीय परिवारों के लिए स्मार्ट एवं सुरक्षित बजट योजना'
                  : 'Pragmatic, zero-inflation wedding planning (₹2L - ₹25L)'}
              </p>
            </div>
          </div>

          {/* Center Navigation: Home/Planner vs Quote X-Ray */}
          {onViewChange && (
            <div className="flex items-center bg-cream-100 p-1 rounded-lg border border-cream-200">
              <button
                type="button"
                onClick={() => onViewChange('home')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  currentView === 'home'
                    ? 'bg-maroon-900 text-white shadow-xs'
                    : 'text-gray-700 hover:text-maroon-900'
                }`}
              >
                <span>🏠</span>
                <span>{language === 'hi' ? 'प्लानर होम' : 'Planner Home'}</span>
              </button>
              <button
                type="button"
                onClick={() => onViewChange('xray')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  currentView === 'xray'
                    ? 'bg-maroon-900 text-white shadow-xs'
                    : 'text-gray-700 hover:text-maroon-900'
                }`}
              >
                <span>🔍</span>
                <span>{language === 'hi' ? 'कोट एक्स-रे' : 'Quote X-Ray'}</span>
                <span className="hidden md:inline-block px-1.5 py-0.2 text-[9px] bg-saffron-500 text-white font-bold rounded-full">
                  HOT
                </span>
              </button>
            </div>
          )}

          {/* Right Controls: Language toggle + Reset */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div
              className="inline-flex items-center bg-cream-100 p-1 rounded-lg border border-cream-300"
              role="radiogroup"
              aria-label="Language selection"
            >
              <button
                type="button"
                role="radio"
                aria-checked={language === 'en'}
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-maroon-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-maroon-900'
                }`}
              >
                English
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={language === 'hi'}
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-maroon-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-maroon-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Reset button if plan exists */}
            {hasPlan && onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-gray-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                title="Start a new plan"
              >
                {language === 'hi' ? 'नई योजना' : 'Reset Plan'}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (visible when a plan is active) */}
        {hasPlan && onTabChange && (
          <nav
            aria-label="Planning sections"
            className="flex space-x-1 sm:space-x-4 border-t border-cream-200 overflow-x-auto py-2"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-maroon-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-maroon-900 hover:bg-cream-100'
                  }`}
                >
                  {language === 'hi' ? tab.labelHi : tab.labelEn}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

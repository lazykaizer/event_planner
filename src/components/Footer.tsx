'use client';

import React from 'react';
import type { Language } from '@/types';

interface FooterProps {
  language: Language;
}

export function Footer({ language }: FooterProps) {
  return (
    <footer className="bg-cream-100 border-t border-cream-200 mt-auto py-8 text-center text-xs text-gray-600 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Core Mandatory Transparency Notice */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron-50 border border-saffron-200 text-saffron-900 font-medium text-xs sm:text-sm">
          <svg
            className="w-4 h-4 text-saffron-700 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {language === 'hi'
              ? 'सभी आंकड़े अनुमानों पर आधारित AI अनुमान हैं। कृपया वेंडरों से वास्तविक कीमतों की पुष्टि अवश्य करें।'
              : 'All amounts are AI estimates based on assumptions. Please confirm real prices with vendors.'}
          </span>
        </div>

        <p className="text-gray-500">
          Built for the GenAI Hackathon Challenge: <strong>Celebration and Event Planner</strong>.
          Powered by Google Gemini 2.5 Flash with deterministic client-side financial math.
        </p>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-gray-400 text-[11px]">
          <span>Security: Zero client secrets</span>
          <span>•</span>
          <span>Deterministic Math Guarantee</span>
          <span>•</span>
          <span>WCAG AA Accessible</span>
          <span>•</span>
          <span>Local storage privacy</span>
        </div>
      </div>
    </footer>
  );
}

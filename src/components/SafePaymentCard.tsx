'use client';

import React from 'react';
import type { Language, BilingualText } from '@/types';

interface SafePaymentCardProps {
  saferPaymentPlan: (string | BilingualText)[];
  getInWritingChecklist: (string | BilingualText)[];
  language: Language;
}

export function SafePaymentCard({
  saferPaymentPlan,
  getInWritingChecklist,
  language,
}: SafePaymentCardProps) {
  return (
    <div className="card space-y-5 border-2 border-cream-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cream-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💳</span>
          <div>
            <h3 className="text-lg font-heading font-bold text-gray-900">
              {language === 'hi' ? 'सुरक्षित भुगतान योजना एवं लिखित चेकलिस्ट' : 'Safer Payment Plan & Written Checklist'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'hi'
                ? 'चरणबद्ध भुगतान और लिखित अनुबंध से अपना एडवांस सुरक्षित रखें'
                : 'Milestone protection plan to retain bargaining power throughout your event'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Milestone Payment Schedule */}
      <div className="p-4 rounded-xl bg-cream-50 border border-cream-300 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-maroon-900 flex items-center gap-1.5">
          <span>📅</span>
          <span>
            {language === 'hi'
              ? 'अनुशंसित चरणबद्ध भुगतान अनुसूची (Milestone Schedule):'
              : 'Recommended Milestone Payment Schedule:'}
          </span>
        </span>

        <div className="space-y-2">
          {saferPaymentPlan.map((step, idx) => {
            const stepText = typeof step === 'object' && step !== null ? step[language] || step.en : step;
            return (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-800">
                <span className="w-5 h-5 rounded-full bg-maroon-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{stepText}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Get This In Writing" Checklist */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
          <span>📝</span>
          <span>
            {language === 'hi'
              ? 'अनुबंध में यह बातें लिखित में अवश्य दर्ज करवाएं:'
              : 'Mandatory "Get This in Writing" Checklist:'}
          </span>
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {getInWritingChecklist.map((item, idx) => {
            const itemText = typeof item === 'object' && item !== null ? item[language] || item.en : item;
            return (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white border border-cream-300 flex items-start gap-2"
              >
                <span className="text-saffron-700 font-bold shrink-0">✓</span>
                <span className="text-gray-700 leading-relaxed">{itemText}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

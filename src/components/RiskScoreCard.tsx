'use client';

import React from 'react';
import type { RedFlag, RiskLevel, Language } from '@/types';

interface RiskScoreCardProps {
  overallRisk: RiskLevel;
  redFlags: RedFlag[];
  language: Language;
}

export function RiskScoreCard({ overallRisk, redFlags, language }: RiskScoreCardProps) {
  const riskDetails = {
    high: {
      badgeBg: 'bg-red-100 text-red-900 border-red-300',
      titleBg: 'bg-red-50 border-red-200',
      icon: '🚨',
      label: language === 'hi' ? 'उच्च जोखिम (High Risk)' : 'High Risk',
      description:
        language === 'hi'
          ? 'इस कोटेशन में खतरनाक शर्तें हैं (उदा. 50%+ एडवांस, कोई अनुबंध नहीं, या 100% अग्रिम भुगतान)। जब तक शर्तें संशोधित न हों, कोई एडवांस न दें।'
          : 'Severe red flags detected (e.g. >50% advance, full prepayment, or no written agreement). Do NOT pay an advance without renegotiating terms.',
    },
    medium: {
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      titleBg: 'bg-amber-50 border-amber-200',
      icon: '⚠️',
      label: language === 'hi' ? 'मध्यम जोखिम (Medium Risk)' : 'Medium Risk',
      description:
        language === 'hi'
          ? 'कुछ असामान्य शर्तें पाई गई हैं। अनुबंध और चरणबद्ध भुगतान तय करने के बाद ही आगे बढ़ें।'
          : 'Caution advised. Clarify refund terms, request an official GST invoice, and lower the booking advance before signing.',
    },
    low: {
      badgeBg: 'bg-green-100 text-green-900 border-green-300',
      titleBg: 'bg-green-50 border-green-200',
      icon: '✅',
      label: language === 'hi' ? 'कम जोखिम (Low Risk)' : 'Low Risk / Standard',
      description:
        language === 'hi'
          ? 'कोटेशन के नियम सामान्य बाजार मानकों के अनुरूप हैं। फिर भी लिखित रसीद अवश्य लें।'
          : 'Quote terms appear within reasonable market standards. Ensure all deliverables are documented in writing.',
    },
  }[overallRisk];

  return (
    <div className="card space-y-5 border-2 border-cream-200 bg-white shadow-sm">
      {/* Header with Risk Level Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <h3 className="text-lg font-heading font-bold text-gray-900">
              {language === 'hi' ? 'जोखिम मूल्यांकन (Risk Score)' : 'Vendor Contract Risk Score'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'hi'
                ? '8 निश्चित कोड नियमों एवं AI भाषाई जांच पर आधारित'
                : 'Deterministic legal rules run first, supplemented by AI context scan'}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${riskDetails.badgeBg} self-start sm:self-auto`}
        >
          <span>{riskDetails.icon}</span>
          <span>{riskDetails.label}</span>
        </span>
      </div>

      {/* Summary explanation box */}
      <div className={`p-4 rounded-xl border ${riskDetails.titleBg} text-xs leading-relaxed`}>
        <p className="font-medium text-gray-800">{riskDetails.description}</p>
      </div>

      {/* Flagged Issues List */}
      {redFlags.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
            {language === 'hi'
              ? `पहचाने गए जोखिम (${redFlags.length}):`
              : `Flagged Vulnerabilities (${redFlags.length}):`}
          </span>
          <div className="space-y-2">
            {redFlags.map((flag, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  flag.severity === 'high'
                    ? 'bg-red-50 text-red-950 border-red-200'
                    : 'bg-amber-50 text-amber-950 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-bold">
                  <span>{flag.severity === 'high' ? '🚨' : '⚠️'}</span>
                  <span>{flag.title || flag.ruleId}</span>
                  <span className="text-[10px] font-normal uppercase px-1.5 py-0.2 rounded bg-white/70 border border-black/10 ml-auto">
                    {flag.source === 'rule' ? 'Deterministic Rule' : 'AI Context'}
                  </span>
                </div>
                <p className="text-gray-700 pl-5">{flag.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="pt-2 border-t border-cream-200 text-[11px] text-gray-400 italic text-center">
        {language === 'hi'
          ? '⚠️ अस्वीकरण: यह उपभोक्ता वित्तीय सुरक्षा मार्गदर्शन है, कानूनी परामर्श नहीं।'
          : '⚠️ Disclaimer: This is consumer financial safety guidance, not certified legal advice.'}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import type { ExtractedQuote, Language } from '@/types';

interface HiddenCostCardProps {
  quote: ExtractedQuote;
  language: Language;
}

export function HiddenCostCard({ quote, language }: HiddenCostCardProps) {
  const hasHiddenCosts = quote.potentialHiddenCosts && quote.potentialHiddenCosts.length > 0;
  const hasAmbiguities = quote.ambiguities && quote.ambiguities.length > 0;

  return (
    <div className="card space-y-5 border-2 border-amber-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cream-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕵️‍♂️</span>
          <div>
            <h3 className="text-lg font-heading font-bold text-gray-900">
              {language === 'hi' ? 'छिपे हुए खर्चों का डिटेक्टर' : 'Hidden Cost & Ambiguity Detector'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'hi'
                ? 'वेंडर द्वारा छोड़ी गई वे बातें जो शादी के दिन अचानक बिल में जुड़ जाती हैं'
                : 'Likely omitted or unpriced items common to Indian celebrations. Phrased as questions to ask.'}
            </p>
          </div>
        </div>
      </div>

      {/* Potential Hidden Costs Section (Always phrased as investigative questions) */}
      {hasHiddenCosts && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <span>❓</span>
            <span>
              {language === 'hi'
                ? 'एडवांस देने से पहले इन संभावित छिपे खर्चों पर स्पष्टीकरण मांगें:'
                : 'Ask These Critical Questions Before Handing Over An Advance:'}
            </span>
          </span>
          <div className="space-y-2">
            {quote.potentialHiddenCosts.map((costQ, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{costQ}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ambiguous Terms in Quote Text */}
      {hasAmbiguities && (
        <div className="space-y-2 pt-2 border-t border-cream-200">
          <span className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>
              {language === 'hi'
                ? 'कोटेशन में पाई गई अस्पष्ट शर्तें ("Ambiguities"):'
                : 'Vague / Ambiguous Clauses in the Quote Text:'}
            </span>
          </span>
          <div className="space-y-1.5">
            {quote.ambiguities.map((amb, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-red-50/60 border border-red-200 text-xs text-red-900 font-mono"
              >
                &ldquo;{amb}&rdquo;
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract Terms & Quote Evidence Snippets */}
      <div className="space-y-2.5 pt-2 border-t border-cream-200">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <span>📜</span>
          <span>
            {language === 'hi'
              ? 'अनुबंध की मुख्य शर्तें एवं प्रमाण (Quote Evidence):'
              : 'Contract Terms & Quote Evidence Snippets:'}
          </span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Advance */}
          <div className="p-3 rounded-lg bg-cream-50 border border-cream-200">
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'मांगा गया एडवांस' : 'Advance Requested'}
            </span>
            <span className="text-sm font-bold text-gray-900 block mt-0.5">
              {quote.advancePercentage
                ? `${quote.advancePercentage}%`
                : quote.advanceRequested
                ? `₹${quote.advanceRequested.toLocaleString('en-IN')}`
                : 'Not specified'}
            </span>
            {quote.evidence?.advance && (
              <div className="mt-1.5 pt-1.5 border-t border-cream-200 text-[11px] text-gray-600 italic">
                {quote.evidence.advance === 'Could not verify from your text' ? (
                  <span className="text-amber-700 font-medium not-italic">⚠️ Could not verify from your text</span>
                ) : (
                  <span>From your quote: &ldquo;{quote.evidence.advance}&rdquo;</span>
                )}
              </div>
            )}
          </div>

          {/* Payment Mode */}
          <div className="p-3 rounded-lg bg-cream-50 border border-cream-200">
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'भुगतान का तरीका' : 'Payment Mode'}
            </span>
            <span className="text-sm font-bold text-gray-900 block mt-0.5">
              {quote.paymentMode || 'Not specified'}
            </span>
            {quote.evidence?.paymentMode && (
              <div className="mt-1.5 pt-1.5 border-t border-cream-200 text-[11px] text-gray-600 italic">
                {quote.evidence.paymentMode === 'Could not verify from your text' ? (
                  <span className="text-amber-700 font-medium not-italic">⚠️ Could not verify from your text</span>
                ) : (
                  <span>From your quote: &ldquo;{quote.evidence.paymentMode}&rdquo;</span>
                )}
              </div>
            )}
          </div>

          {/* Cancellation Terms */}
          <div className="p-3 rounded-lg bg-cream-50 border border-cream-200">
            <span className="text-gray-500 block text-[11px]">
              {language === 'hi' ? 'रद्दीकरण / रिफंड नियम' : 'Cancellation Terms'}
            </span>
            <span className="text-sm font-bold text-gray-900 block mt-0.5 truncate" title={quote.cancellationTerms}>
              {quote.cancellationTerms || 'Not mentioned'}
            </span>
            {quote.evidence?.cancellationTerms && (
              <div className="mt-1.5 pt-1.5 border-t border-cream-200 text-[11px] text-gray-600 italic">
                {quote.evidence.cancellationTerms === 'Could not verify from your text' ? (
                  <span className="text-amber-700 font-medium not-italic">⚠️ Could not verify from your text</span>
                ) : (
                  <span>From your quote: &ldquo;{quote.evidence.cancellationTerms}&rdquo;</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explicit Deliverables: Included vs Excluded */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-cream-200 text-xs">
        <div className="p-3 rounded-xl bg-green-50/60 border border-green-200 space-y-1.5">
          <span className="font-bold text-green-900 flex items-center gap-1">
            <span>✓</span>
            <span>{language === 'hi' ? 'स्पष्ट रूप से शामिल (Included):' : 'Explicitly Included:'}</span>
          </span>
          <ul className="list-disc list-inside space-y-1 text-green-800 text-[11px] leading-relaxed">
            {quote.included.slice(0, 8).map((inc, i) => (
              <li key={i}>{inc}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 space-y-1.5">
          <span className="font-bold text-red-900 flex items-center gap-1">
            <span>✕</span>
            <span>{language === 'hi' ? 'स्पष्ट रूप से शामिल नहीं (Excluded):' : 'Explicitly Excluded:'}</span>
          </span>
          <ul className="list-disc list-inside space-y-1 text-red-800 text-[11px] leading-relaxed">
            {quote.notIncluded.length > 0 ? (
              quote.notIncluded.slice(0, 8).map((notInc, i) => <li key={i}>{notInc}</li>)
            ) : (
              <li className="italic text-gray-500">None explicitly stated (Ask what is excluded!)</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

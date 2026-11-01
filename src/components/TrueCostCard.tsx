'use client';

import React from 'react';
import type { TrueCostCalculation, ExtractedQuote, Language } from '@/types';
import { formatINR } from '@/lib/formatters';
import { EstimateBadge } from '@/components/EstimateBadge';

interface TrueCostCardProps {
  trueCost: TrueCostCalculation;
  quote: ExtractedQuote;
  language: Language;
}

export function TrueCostCard({ trueCost, quote, language }: TrueCostCardProps) {
  return (
    <div className="card space-y-5 border-2 border-maroon-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <h3 className="text-lg font-heading font-bold text-maroon-900">
              {language === 'hi' ? 'वास्तविक कुल खर्च (True All-In Cost)' : 'True All-In Cost Calculation'}
            </h3>
            <EstimateBadge
              label={language === 'hi' ? 'अनुमान (Assumption)' : 'Estimate (Assumption)'}
              tooltipText={
                language === 'hi'
                  ? 'यह गणना गणितीय फॉर्मूले (प्रति-प्लेट × मेहमान + स्थिर शुल्क + कर) पर आधारित है, न कि AI द्वारा मनगढ़ंत।'
                  : 'Computed strictly via code formula (plate x guests + fixed + taxes), never hallucinated by AI.'
              }
            />
          </div>
          <p className="text-xs text-gray-500">
            {quote.vendorName} ({quote.vendorType}) • {trueCost.guestCount} {language === 'hi' ? 'मेहमान' : 'Guests'}
          </p>
        </div>

        {/* Big Total Cost Highlight */}
        <div className="text-left sm:text-right bg-cream-50 p-2.5 rounded-xl border border-cream-200 shrink-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 block">
            {language === 'hi' ? 'अनुमानित कुल वास्तविक राशि' : 'Total All-In Cost'}
          </span>
          <span className="text-2xl font-heading font-extrabold text-maroon-900">
            {formatINR(trueCost.totalTrueCost)}
          </span>
        </div>
      </div>

      {/* Transparent Formula Display */}
      <div className="p-3.5 rounded-xl bg-cream-100/70 border border-cream-300 space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-900 block flex items-center gap-1">
          <span>📐</span>
          <span>{language === 'hi' ? 'पारदर्शी गणना सूत्र (Transparent Formula):' : 'Transparent Calculation Formula:'}</span>
        </span>
        <p className="font-mono text-xs text-gray-800 break-words leading-relaxed">
          {trueCost.formulaDescription} = <strong>{formatINR(trueCost.totalTrueCost)}</strong>
        </p>
      </div>

      {/* 3 Metric Pillars: Variable, Fixed, Taxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-white border border-cream-200">
          <span className="text-gray-500 block">
            {language === 'hi' ? 'खानपान/स्केलिंग भाग' : 'Scaling Per-Guest Charge'}
          </span>
          <span className="text-base font-bold text-gray-900 block mt-0.5">
            {formatINR(trueCost.perGuestComponent)}
          </span>
          <span className="text-[10px] text-gray-400 block">
            {quote.perUnitPrice ? `${formatINR(quote.perUnitPrice)} × ${trueCost.guestCount}` : 'Flat fee'}
          </span>
          {quote.evidence?.perUnitPrice && (
            <div className="mt-1.5 pt-1.5 border-t border-cream-100 text-[11px] text-gray-500 italic">
              {quote.evidence.perUnitPrice === 'Could not verify from your text' ? (
                <span className="text-amber-700 font-medium not-italic">⚠️ Could not verify from your text</span>
              ) : (
                <span>From your quote: &ldquo;{quote.evidence.perUnitPrice}&rdquo;</span>
              )}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-white border border-cream-200">
          <span className="text-gray-500 block">
            {language === 'hi' ? 'स्थिर शुल्क एवं अन्य' : 'Fixed Charges & Extras'}
          </span>
          <span className="text-base font-bold text-gray-900 block mt-0.5">
            {formatINR(trueCost.fixedComponent)}
          </span>
          <span className="text-[10px] text-gray-400 block">
            {quote.fixedChargesBreakdown.length + quote.extraCharges.length} {language === 'hi' ? 'मदें शामिल' : 'line items'}
          </span>
          {quote.evidence?.fixedCharges && (
            <div className="mt-1.5 pt-1.5 border-t border-cream-100 text-[11px] text-gray-500 italic">
              {quote.evidence.fixedCharges === 'Could not verify from your text' ? (
                <span className="text-amber-700 font-medium not-italic">⚠️ Could not verify from your text</span>
              ) : (
                <span>From your quote: &ldquo;{quote.evidence.fixedCharges}&rdquo;</span>
              )}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-white border border-cream-200">
          <span className="text-gray-500 block">
            {language === 'hi' ? 'अनुमानित कर (GST)' : 'Taxes / GST'}
          </span>
          <span className="text-base font-bold text-gray-900 block mt-0.5">
            {formatINR(trueCost.taxesComponent)}
          </span>
          <span className="text-[10px] text-gray-400 block">
            {quote.taxPercentage ? `${quote.taxPercentage}% GST` : quote.taxIncludedInBase ? 'Included in base' : 'Not stated'}
          </span>
          {quote.evidence?.taxes && (
            <div className="mt-1.5 pt-1.5 border-t border-cream-100 text-[11px] text-gray-500 italic">
              {quote.evidence.taxes === 'Could not verify from your text' ? (
                <span className="text-amber-700 font-medium not-italic">⚠️ Could not verify from your text</span>
              ) : (
                <span>From your quote: &ldquo;{quote.evidence.taxes}&rdquo;</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estimated Range with Contingency if Ambiguities Exist */}
      {trueCost.hasAmbiguities && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="space-y-0.5">
            <span className="font-bold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{language === 'hi' ? 'अस्पष्ट मदों के कारण संभावित लागत सीमा:' : 'Estimated Cost Range (Ambiguities Buffer):'}</span>
            </span>
            <p className="text-[11px] text-amber-800">
              {language === 'hi'
                ? 'कोटेशन में कुछ मदें अस्पष्ट हैं (उदा. "डीजल वास्तविक दर पर")। वास्तविक अंतिम बिल इस सीमा में जा सकता है:'
                : 'Unquantified extras like generator fuel or overtime could shift the final bill within this realistic range:'}
            </p>
          </div>
          <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-lg border border-amber-300">
            <span className="font-bold text-sm text-amber-950 font-heading">
              {formatINR(trueCost.estimatedCostRange.min)} – {formatINR(trueCost.estimatedCostRange.max)}
            </span>
            <span className="text-[10px] text-amber-700 block">
              {language === 'hi' ? 'अनुमानित दायरा' : 'Estimated Range'}
            </span>
          </div>
        </div>
      )}

      {/* Itemized Fixed Charges and Extra Items List */}
      {(quote.fixedChargesBreakdown.length > 0 || quote.extraCharges.length > 0) && (
        <div className="space-y-2 pt-2 border-t border-cream-200 text-xs">
          <span className="font-semibold text-gray-800 uppercase tracking-wider text-[11px] block">
            {language === 'hi' ? 'स्थिर शुल्क एवं अतिरिक्त मदों का विवरण:' : 'Itemized Fixed & Additional Charges:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quote.fixedChargesBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between p-2 rounded bg-cream-50 border border-cream-200">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold text-gray-900">{formatINR(item.amount)}</span>
              </div>
            ))}
            {quote.extraCharges.map((item, i) => (
              <div key={i} className="flex justify-between p-2 rounded bg-amber-50/50 border border-amber-200">
                <span className="text-amber-900">{item.name} (Extra)</span>
                <span className="font-semibold text-amber-950">{formatINR(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

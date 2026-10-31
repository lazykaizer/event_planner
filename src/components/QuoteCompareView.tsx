'use client';

import React from 'react';
import type { QuoteAnalysisReport, Language } from '@/types';
import { formatINR } from '@/lib/formatters';
import { EstimateBadge } from '@/components/EstimateBadge';

interface QuoteCompareViewProps {
  reports: QuoteAnalysisReport[];
  onRemoveReport: (id: string) => void;
  onSelectReport: (report: QuoteAnalysisReport) => void;
  language: Language;
}

export function QuoteCompareView({
  reports,
  onRemoveReport,
  onSelectReport,
  language,
}: QuoteCompareViewProps) {
  if (reports.length === 0) return null;

  // Identify Best Value (Lowest true cost among same guest count)
  let bestValueId: string | null = null;
  let minCost = Infinity;

  // Identify Safest Option (Lowest risk, lowest advance percentage)
  let safestOptionId: string | null = null;
  let minRiskScore = Infinity;

  reports.forEach((r) => {
    if (r.trueCost.totalTrueCost < minCost) {
      minCost = r.trueCost.totalTrueCost;
      bestValueId = r.id;
    }

    // Risk points: low = 1, medium = 5, high = 10 + (advancePercentage || 50)
    const riskScore =
      (r.overallRisk === 'low' ? 1 : r.overallRisk === 'medium' ? 5 : 10) * 10 +
      (r.extracted.advancePercentage || 40);

    if (riskScore < minRiskScore) {
      minRiskScore = riskScore;
      safestOptionId = r.id;
    }
  });

  return (
    <div className="card space-y-6 border-2 border-saffron-300 bg-white shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-800 block">
            {language === 'hi' ? 'तुलनात्मक रिपोर्ट (अधिकतम 3 कोट्स)' : 'Side-by-Side Comparison (Up to 3 Quotes)'}
          </span>
          <h3 className="text-lg font-heading font-bold text-gray-900 flex items-center gap-2">
            <span>⚖️</span>
            <span>
              {language === 'hi'
                ? 'कोट्स की वास्तविक लागत एवं सुरक्षा तुलना'
                : 'Vendor Quote Comparison Matrix'}
            </span>
            <EstimateBadge />
          </h3>
        </div>

        <span className="text-xs text-gray-500">
          {reports.length} / 3 {language === 'hi' ? 'कोट्स विश्लेषित' : 'quotes analyzed'}
        </span>
      </div>

      {/* Side-by-Side Grid */}
      <div
        className={`grid grid-cols-1 ${
          reports.length === 2
            ? 'md:grid-cols-2'
            : reports.length === 3
            ? 'md:grid-cols-3'
            : 'md:grid-cols-1'
        } gap-4`}
      >
        {reports.map((r, idx) => {
          const isBestValue = r.id === bestValueId && reports.length > 1;
          const isSafest = r.id === safestOptionId && reports.length > 1;

          return (
            <div
              key={r.id}
              className={`p-5 rounded-xl border-2 flex flex-col justify-between transition-all ${
                isSafest
                  ? 'border-green-400 bg-green-50/20 shadow-xs'
                  : isBestValue
                  ? 'border-saffron-400 bg-saffron-50/20 shadow-xs'
                  : 'border-cream-300 bg-white'
              }`}
            >
              <div className="space-y-4">
                {/* Title & Badges */}
                <div className="flex items-start justify-between gap-2 border-b border-cream-200 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {isBestValue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                          🏆 Best Value
                        </span>
                      )}
                      {isSafest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-900 border border-green-300 uppercase">
                          🛡️ Safest Option
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500 block uppercase tracking-wider">
                        Quote #{idx + 1}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-gray-900">
                      {r.extracted.vendorName}
                    </h4>
                    <span className="text-xs text-gray-500 capitalize">
                      {r.selectedVendorType} • {r.guestCount} Pax
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveReport(r.id)}
                    className="text-gray-400 hover:text-red-700 text-sm p-1"
                    title="Remove this quote"
                    aria-label={`Remove quote from ${r.extracted.vendorName}`}
                  >
                    ✕
                  </button>
                </div>

                {/* Key Metrics */}
                <div className="space-y-2 text-xs">
                  {/* True Cost */}
                  <div className="flex justify-between items-center p-2 rounded bg-cream-50 border border-cream-200">
                    <span className="text-gray-600">{language === 'hi' ? 'वास्तविक कुल खर्च:' : 'True All-In Cost:'}</span>
                    <span className="font-bold text-maroon-900 text-sm">
                      {formatINR(r.trueCost.totalTrueCost)}
                    </span>
                  </div>

                  {/* Rate per plate */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-gray-500">{language === 'hi' ? 'दर प्रति-प्लेट/इकाई:' : 'Unit / Plate Rate:'}</span>
                    <span className="font-semibold text-gray-800">
                      {r.extracted.perUnitPrice ? formatINR(r.extracted.perUnitPrice) : 'Flat fee'}
                    </span>
                  </div>

                  {/* Risk Level */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-gray-500">{language === 'hi' ? 'जोखिम स्तर:' : 'Risk Level:'}</span>
                    <span
                      className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded-full border ${
                        r.overallRisk === 'high'
                          ? 'bg-red-100 text-red-900 border-red-300'
                          : r.overallRisk === 'medium'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-green-100 text-green-900 border-green-300'
                      }`}
                    >
                      {r.overallRisk}
                    </span>
                  </div>

                  {/* Advance % */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-gray-500">{language === 'hi' ? 'एडवांस मांग:' : 'Advance Deposit:'}</span>
                    <span className="font-semibold text-gray-800">
                      {r.extracted.advancePercentage !== null ? `${r.extracted.advancePercentage}%` : 'Not specified'}
                    </span>
                  </div>

                  {/* Written contract */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-gray-500">{language === 'hi' ? 'लिखित अनुबंध:' : 'Contract / GST Bill:'}</span>
                    <span className={r.extracted.writtenAgreementMentioned ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                      {r.extracted.writtenAgreementMentioned ? '✓ Mentioned' : '✕ Missing'}
                    </span>
                  </div>

                  {/* Flag count */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-gray-500">{language === 'hi' ? 'चिन्हित खामियां:' : 'Red Flags:'}</span>
                    <span className="font-semibold text-red-900">
                      {r.redFlags.length} issues
                    </span>
                  </div>
                </div>
              </div>

              {/* View Full Report CTA */}
              <button
                type="button"
                onClick={() => onSelectReport(r)}
                className="mt-4 w-full py-2 rounded-lg text-xs font-semibold bg-cream-100 hover:bg-cream-200 text-maroon-900 border border-cream-300 transition-colors"
              >
                {language === 'hi' ? 'विस्तृत रिपोर्ट देखें →' : 'View Full X-Ray Details →'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

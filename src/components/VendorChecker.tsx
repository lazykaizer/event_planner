'use client';

import React, { useState } from 'react';
import type {
  VendorAnalysis,
  VendorType,
  BudgetCategory,
  Language,
} from '@/types';
import { formatINR } from '@/lib/formatters';
import { AlertBanner } from '@/components/AlertBanner';

interface VendorCheckerProps {
  language: Language;
  allocatedCategoryAmount?: {
    category: BudgetCategory;
    amount: number;
  };
  savedAnalyses: VendorAnalysis[];
  onSaveAnalyses: (analyses: VendorAnalysis[]) => void;
}

const SAMPLE_QUOTES = [
  {
    vendorType: 'caterer' as VendorType,
    text: `Shree Ganesh Caterers:
Grand Wedding Package for 250 guests.
Total Estimate: Rs 2,50,000 (Approx Rs 1,000 per plate).
Includes: Welcome mocktails (3 types), Veg starters (4 items), Main course with 2 paneer dishes, Dal Makhani, Pulao, 3 types of breads, Gulab Jamun & Ice Cream.
Not included: Waitstaff tipping, live chaat counter (extra Rs 150/head), generator fuel if power fails.
Payment terms: 60% advance on booking, 40% two days before the wedding. Cash only preferred or personal UPI to Sharma ji.
Cancellation: No refund under any condition.`,
  },
  {
    vendorType: 'caterer' as VendorType,
    text: `Royal Feast Hospitality Pvt Ltd:
Catering proposal for 250 Pax.
Rate: Rs 1,150 per plate + 5% GST. Total estimated Rs 3,01,875.
Includes: 5 welcome drinks, 5 live starters, full dinner buffet with 3 desserts, copper chaffing dishes, professional uniformed staff, mineral water dispensers.
Excludes: Special imported fruit counter, cocktail glasses.
Payment schedule: 25% booking deposit against GST invoice, 50% 1 week prior after final guest count lock, 25% balance on next day after function completion.
Agreement: Detailed service contract will be signed. 75% refund if cancelled 30 days prior.`,
  },
];

export function VendorChecker({
  language,
  allocatedCategoryAmount,
  savedAnalyses,
  onSaveAnalyses,
}: VendorCheckerProps) {
  const [quotesInput, setQuotesInput] = useState<string>('');
  const [selectedType, setSelectedType] = useState<VendorType>('caterer');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSampleQuotes = () => {
    const combined = SAMPLE_QUOTES.map((q) => q.text).join('\n\n---\n\n');
    setQuotesInput(combined);
    setSelectedType('caterer');
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!quotesInput.trim()) return;

    setIsLoading(true);
    setError(null);

    // Split quotes by separator '---' if multiple quotes pasted, or send as single quote
    const rawBlocks = quotesInput
      .split(/\n\s*---\s*\n/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const quotesPayload = (rawBlocks.length > 0 ? rawBlocks : [quotesInput]).map((text) => ({
      text,
      vendorType: selectedType,
    }));

    try {
      const res = await fetch('/api/vendor-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotes: quotesPayload,
          budgetCategory: allocatedCategoryAmount,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Vendor quote analysis failed');
      }

      onSaveAnalyses(data.analyses);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown vendor analysis error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="card bg-gradient-to-r from-cream-100 to-white border-maroon-100 p-6">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-saffron-100 text-saffron-900 border border-saffron-200">
            <span>🛡️</span>
            <span>{language === 'hi' ? 'वेंडर सुरक्षा गार्ड' : 'Vendor Quote & Red-Flag Guard'}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-maroon-900">
            {language === 'hi'
              ? 'छिपे हुए शुल्कों एवं जोखिम भरे अनुबंधों से अपने परिवार को बचाएं'
              : 'Spot Hidden Fees & Risky Clauses Before You Sign'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {language === 'hi'
              ? 'वेंडरों से प्राप्त कच्चे कोट्स (WhatsApp/ईमेल) यहाँ पेस्ट करें। हमारा सिस्टम नियम-आधारित एवं AI सुरक्षा जांच करके जोखिम स्तर, सुरक्षित भुगतान अनुसूची और पूछने योग्य प्रश्न बताएगा।'
              : 'Paste unformatted WhatsApp or email quotes from caterers, decorators, or venues. We run deterministic financial rules and AI contextual scans to highlight hidden charges, advance payment risks, and missing deliverables.'}
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="vendor-type" className="label-text mb-0 font-semibold text-gray-900">
              {language === 'hi' ? 'वेंडर श्रेणी:' : 'Vendor Category:'}
            </label>
            <select
              id="vendor-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as VendorType)}
              className="px-3 py-1.5 text-xs rounded-lg border border-cream-300 bg-white text-gray-800"
            >
              <option value="caterer">Caterer (खानपान)</option>
              <option value="decorator">Decorator (सजावट)</option>
              <option value="venue">Venue (विवाह स्थल)</option>
              <option value="photographer">Photographer (फोटोग्राफर)</option>
              <option value="other">Other Vendor (अन्य)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleLoadSampleQuotes}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-maroon-900 bg-cream-100 hover:bg-cream-200 rounded-lg border border-cream-300 transition-colors self-start sm:self-auto"
          >
            <span>📋</span>
            <span>{language === 'hi' ? '2 नमूना कोट्स लोड करें (तुलना हेतु)' : 'Load 2 Sample Quotes (For Demo)'}</span>
          </button>
        </div>

        <div>
          <label htmlFor="quotes-textarea" className="label-text">
            {language === 'hi'
              ? 'वेंडर कोट्स का टेक्स्ट पेस्ट करें (एकाधिक कोट्स अलग करने हेतु बीच में "---" लिखें):'
              : 'Paste 1 to 3 Vendor Quotes (separate multiple quotes with "---"): '}
          </label>
          <textarea
            id="quotes-textarea"
            rows={7}
            value={quotesInput}
            onChange={(e) => setQuotesInput(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'यहाँ WhatsApp या ईमेल पर मिला कोटेशन पेस्ट करें...\n\n---\n\nदूसरा कोटेशन यहाँ पेस्ट करें...'
                : 'Paste rough quote text here from WhatsApp/Email...\n\n---\n\nPaste second vendor quote here for side-by-side comparison...'
            }
            className="input-field font-mono text-xs"
            disabled={isLoading}
          />
        </div>

        {error && (
          <AlertBanner
            type="error"
            title={language === 'hi' ? 'विश्लेषण विफल' : 'Analysis Failed'}
            message={error}
            onRetry={handleAnalyze}
          />
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading || !quotesInput.trim()}
            className="btn-primary px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{language === 'hi' ? 'जांच हो रही है...' : 'Scanning Quotes & Red Flags...'}</span>
              </span>
            ) : (
              <span>{language === 'hi' ? '🛡️ कोट्स की जांच एवं तुलना करें' : '🛡️ Scan Quotes & Red Flags'}</span>
            )}
          </button>
        </div>
      </div>

      {/* ANALYSIS RESULTS & SIDE-BY-SIDE COMPARISON */}
      {savedAnalyses.length > 0 && (
        <div className="space-y-6 animate-slide-up">
          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {savedAnalyses.map((analysis, idx) => {
              const q = analysis.quote;
              const riskColor =
                analysis.overallRisk === 'high'
                  ? 'border-red-400 bg-red-50/30'
                  : analysis.overallRisk === 'medium'
                  ? 'border-amber-400 bg-amber-50/30'
                  : 'border-green-400 bg-green-50/30';

              const riskBadgeColor =
                analysis.overallRisk === 'high'
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : analysis.overallRisk === 'medium'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-green-100 text-green-900 border-green-300';

              return (
                <div key={idx} className={`card border-2 ${riskColor} p-6 space-y-5 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-cream-200 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          {q.vendorType} • Vendor #{idx + 1}
                        </span>
                        <h3 className="text-lg font-heading font-bold text-gray-900">
                          {q.vendorName}
                        </h3>
                      </div>

                      {/* Overall Risk Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${riskBadgeColor}`}
                      >
                        <span>{analysis.overallRisk === 'high' ? '🚨' : analysis.overallRisk === 'medium' ? '⚠️' : '✅'}</span>
                        <span>{analysis.overallRisk} Risk</span>
                      </span>
                    </div>

                    {/* Pricing Summary */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-white border border-cream-200 text-xs">
                      <div>
                        <span className="text-gray-500 block">{language === 'hi' ? 'कुल राशि' : 'Total Quote'}</span>
                        <span className="text-base font-bold text-maroon-900">
                          {q.totalPrice !== null ? formatINR(q.totalPrice) : 'Not specified'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">
                          {q.unitDescription || (language === 'hi' ? 'दर' : 'Unit Rate')}
                        </span>
                        <span className="text-base font-bold text-gray-800">
                          {q.pricePerUnit !== null ? formatINR(q.pricePerUnit) : 'Not specified'}
                        </span>
                      </div>
                    </div>

                    {/* Red Flags Triggered */}
                    {analysis.redFlags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs text-red-900 flex items-center gap-1.5 uppercase tracking-wider">
                          <span>🚩</span>
                          <span>
                            {language === 'hi' ? 'चिन्हित जोखिम (Red Flags):' : 'Identified Red Flags:'}
                          </span>
                        </h4>
                        <div className="space-y-1.5">
                          {analysis.redFlags.map((flag, fIdx) => (
                            <div
                              key={fIdx}
                              className={`p-2.5 rounded-lg text-xs leading-relaxed border ${
                                flag.severity === 'high'
                                  ? 'bg-red-50 text-red-900 border-red-200 font-medium'
                                  : 'bg-amber-50 text-amber-900 border-amber-200'
                              }`}
                            >
                              <span className="font-bold mr-1">
                                [{flag.source === 'rule' ? 'Deterministic Rule' : 'AI Scan'}]:
                              </span>
                              {typeof flag.message === 'object' && flag.message !== null
                                ? flag.message[language] || flag.message.en
                                : flag.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deliverables: Included & Excluded */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-green-50/60 border border-green-200 space-y-1">
                        <span className="font-semibold text-green-900 block">
                          ✓ {language === 'hi' ? 'शामिल है (Included):' : 'Included:'}
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-green-800">
                          {q.included.slice(0, 5).map((inc, i) => (
                            <li key={i}>{inc}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-red-50/60 border border-red-200 space-y-1">
                        <span className="font-semibold text-red-900 block">
                          ✕ {language === 'hi' ? 'शामिल नहीं है (Not Included):' : 'Excluded:'}
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-red-800">
                          {q.notIncluded.length > 0 ? (
                            q.notIncluded.slice(0, 5).map((notInc, i) => <li key={i}>{notInc}</li>)
                          ) : (
                            <li className="italic text-gray-500">None explicitly stated</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Safer Payment Schedule */}
                    <div className="p-3 rounded-lg bg-cream-100 border border-cream-300 space-y-1 text-xs">
                      <span className="font-semibold text-maroon-900 flex items-center gap-1">
                        <span>💳</span>
                        <span>{language === 'hi' ? 'सुरक्षित भुगतान अनुसूची परामर्श:' : 'Safer Payment Schedule:'}</span>
                      </span>
                      <ul className="space-y-1 text-gray-700">
                        {analysis.saferPaymentSchedule.map((sched, sIdx) => {
                          const schedText =
                            typeof sched === 'object' && sched !== null
                              ? sched[language] || sched.en
                              : sched;
                          return (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-saffron-700 shrink-0 font-bold">•</span>
                              <span>{schedText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Questions to Ask & In-Writing Checklist */}
                    <div className="space-y-2 text-xs">
                      <details className="group border border-cream-200 rounded-lg p-2.5 bg-white">
                        <summary className="font-semibold text-gray-800 cursor-pointer list-none flex items-center justify-between">
                          <span>❓ {language === 'hi' ? 'एडवांस देने से पहले यह सवाल पूछें:' : 'Questions to Ask Before Paying:'}</span>
                          <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 pl-1">
                          {analysis.questionsToAsk.map((qText, qIdx) => (
                            <li key={qIdx}>{qText}</li>
                          ))}
                        </ul>
                      </details>

                      <details className="group border border-cream-200 rounded-lg p-2.5 bg-white">
                        <summary className="font-semibold text-gray-800 cursor-pointer list-none flex items-center justify-between">
                          <span>📝 {language === 'hi' ? 'लिखित में लेने योग्य बातें (Checklist):' : 'Get This in Writing (Checklist):'}</span>
                          <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 pl-1">
                          {analysis.getInWriting.map((item, iIdx) => {
                            const itemText =
                              typeof item === 'object' && item !== null
                                ? item[language] || item.en
                                : item;
                            return <li key={iIdx}>{itemText}</li>;
                          })}
                        </ul>
                      </details>
                    </div>
                  </div>

                  {/* Mandatory Legal Guidance Disclaimer */}
                  <div className="pt-3 border-t border-cream-200 text-[11px] text-gray-400 italic text-center">
                    {language === 'hi'
                      ? '⚠️ यह वित्तीय सुरक्षा परामर्श है, कानूनी सलाह नहीं।'
                      : '⚠️ Disclaimer: This is financial safety guidance, not legal advice.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

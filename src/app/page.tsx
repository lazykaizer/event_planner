'use client';

import React, { useState, useEffect } from 'react';
import type {
  QuoteAnalysisReport,
  VendorType,
  Language,
} from '@/types';
import { calculateTrueCost } from '@/lib/costMath';
import { QuoteInputCard, SAMPLE_HINGLISH_QUOTES } from '@/components/QuoteInputCard';
import { TrueCostCard } from '@/components/TrueCostCard';
import { GuestSlider } from '@/components/GuestSlider';
import { HiddenCostCard } from '@/components/HiddenCostCard';
import { RiskScoreCard } from '@/components/RiskScoreCard';
import { SafePaymentCard } from '@/components/SafePaymentCard';
import { NegotiationMessageCard } from '@/components/NegotiationMessageCard';
import { QuoteCompareView } from '@/components/QuoteCompareView';
import { SupportingBudgetPanel } from '@/components/SupportingBudgetPanel';
import { AlertBanner } from '@/components/AlertBanner';

const STORAGE_KEY = 'quote-xray-reports';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [quoteText, setQuoteText] = useState<string>('');
  const [vendorType, setVendorType] = useState<VendorType>('caterer');
  const [guestCount, setGuestCount] = useState<number>(250);
  const [totalBudget, setTotalBudget] = useState<number>(1000000);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // History of analyzed quotes (up to 3 for comparison)
  const [reports, setReports] = useState<QuoteAnalysisReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QuoteAnalysisReport[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReports(parsed);
          setActiveReportId(parsed[0].id);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save to localStorage
  const saveReports = (newReports: QuoteAnalysisReport[]) => {
    setReports(newReports);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
    } catch {
      // Ignore
    }
  };

  const handleAnalyze = async () => {
    if (quoteText.trim().length < 20) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteText,
          vendorType,
          guestCount,
          totalBudget,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze quote');
      }

      const newReport: QuoteAnalysisReport = data.report;

      // Keep up to 3 quotes in comparison history
      const updated = [newReport, ...reports.filter((r) => r.id !== newReport.id)].slice(0, 3);
      saveReports(updated);
      setActiveReportId(newReport.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown analysis error');
    } finally {
      setIsLoading(false);
    }
  };

  // Live guest slider updates active report's true cost strictly in code
  const handleLiveGuestCountChange = (newCount: number) => {
    setGuestCount(newCount);
    if (!activeReport) return;

    const recalculatedCost = calculateTrueCost(activeReport.extracted, newCount);
    const updatedReport: QuoteAnalysisReport = {
      ...activeReport,
      guestCount: newCount,
      trueCost: recalculatedCost,
    };

    const updatedList = reports.map((r) => (r.id === activeReport.id ? updatedReport : r));
    saveReports(updatedList);
  };

  const handleRemoveReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    saveReports(updated);
    if (activeReportId === id) {
      setActiveReportId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 font-body text-gray-800">
      {/* Top Header & Bilingual Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-cream-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-maroon-900 to-saffron-500 flex items-center justify-center text-white font-heading font-extrabold text-xl shadow-xs">
              X
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xl text-maroon-900 tracking-tight">
                  Quote X-Ray
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-saffron-100 text-saffron-900 rounded-full border border-saffron-300">
                  Vendor Advance Guard
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                {language === 'hi'
                  ? 'शादी के वेंडरों को एडवांस देने से पहले कोटेशन का पूरा सच जानें'
                  : 'Indian wedding & event quote analyzer • Never pay an advance blindly'}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div
            className="inline-flex items-center bg-cream-100 p-1 rounded-lg border border-cream-300"
            role="radiogroup"
            aria-label="Language selection"
          >
            <button
              type="button"
              role="radio"
              aria-checked={language === 'en'}
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-maroon-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-maroon-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={language === 'hi'}
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'hi'
                  ? 'bg-maroon-900 text-white shadow-xs'
                  : 'text-gray-600 hover:text-maroon-900'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </header>

      {/* Hero Promise Banner */}
      <section className="bg-gradient-to-b from-maroon-900 to-maroon-950 text-white py-10 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-saffron-500/20 text-saffron-300 border border-saffron-400/30">
            <span>🛡️</span>
            <span>{language === 'hi' ? 'वित्तीय सुरक्षा वादा' : 'Consumer Protection Guarantee'}</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold leading-tight">
            {language === 'hi'
              ? 'कोटेशन का एक्स-रे किए बिना कभी भी एडवांस न दें!'
              : 'Don’t pay the advance until you’ve X-Rayed the quote.'}
          </h1>
          <p className="text-xs sm:text-sm text-cream-200 max-w-2xl mx-auto leading-relaxed">
            {language === 'hi'
              ? 'WhatsApp पर मिला कच्चा कोटेशन यहाँ पेस्ट करें। हम वास्तविक कुल लागत निकालेंगे, छिपे शुल्क पकड़ेंगे, 50%+ एडवांस जोखिम चिन्हित करेंगे और वेंडर को भेजने हेतु एक विनम्र WhatsApp वार्ता संदेश तैयार करेंगे।'
              : 'Paste any rough WhatsApp or email quote. We calculate the true all-in cost, uncover hidden fees, flag predatory advance traps, and write a polite WhatsApp reply to negotiate safe milestone terms.'}
          </p>
        </div>
      </section>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <AlertBanner
            type="error"
            title={language === 'hi' ? 'एक्स-रे विश्लेषण विफल' : 'Quote X-Ray Failed'}
            message={error}
            onRetry={handleAnalyze}
          />
        )}

        {/* 1. Main Quote Input Card */}
        <QuoteInputCard
          quoteText={quoteText}
          setQuoteText={setQuoteText}
          vendorType={vendorType}
          setVendorType={setVendorType}
          guestCount={guestCount}
          setGuestCount={setGuestCount}
          isLoading={isLoading}
          onAnalyze={handleAnalyze}
          language={language}
        />

        {/* 2. Side-By-Side Quote Comparison (If 2 or 3 quotes analyzed) */}
        {reports.length > 1 && (
          <QuoteCompareView
            reports={reports}
            onRemoveReport={handleRemoveReport}
            onSelectReport={(r) => {
              setActiveReportId(r.id);
              setGuestCount(r.guestCount);
            }}
            language={language}
          />
        )}

        {/* 3. Detailed Results Section for Active Report */}
        {activeReport && (
          <div className="space-y-6 animate-fade-in" aria-live="polite">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-maroon-900 pb-2">
              <h2 className="text-xl font-heading font-bold text-maroon-900 flex items-center gap-2">
                <span>📋</span>
                <span>
                  {language === 'hi' ? 'एक्स-रे रिपोर्ट:' : 'X-Ray Report:'}{' '}
                  {activeReport.extracted.vendorName}
                </span>
              </h2>

              {reports.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{language === 'hi' ? 'सक्रिय कोट:' : 'Switch Quote:'}</span>
                  <div className="inline-flex gap-1">
                    {reports.map((r, i) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setActiveReportId(r.id);
                          setGuestCount(r.guestCount);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded ${
                          r.id === activeReport.id
                            ? 'bg-maroon-900 text-white'
                            : 'bg-cream-200 text-gray-700 hover:bg-cream-300'
                        }`}
                      >
                        #{i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Guest Slider */}
            <GuestSlider
              guestCount={guestCount}
              setGuestCount={handleLiveGuestCountChange}
              perUnitPrice={activeReport.extracted.perUnitPrice}
              fixedComponent={activeReport.trueCost.fixedComponent}
              language={language}
            />

            {/* True Cost Card */}
            <TrueCostCard
              trueCost={activeReport.trueCost}
              quote={activeReport.extracted}
              language={language}
            />

            {/* Risk Score Card */}
            <RiskScoreCard
              overallRisk={activeReport.overallRisk}
              redFlags={activeReport.redFlags}
              language={language}
            />

            {/* Hidden Cost Detector Card */}
            <HiddenCostCard
              quote={activeReport.extracted}
              language={language}
            />

            {/* Safe Payment Plan Card */}
            <SafePaymentCard
              saferPaymentPlan={activeReport.saferPaymentPlan}
              getInWritingChecklist={activeReport.getInWritingChecklist}
              language={language}
            />

            {/* Negotiation WhatsApp Message Card */}
            <NegotiationMessageCard
              messages={activeReport.whatsappNegotiationMessage}
              language={language}
            />

            {/* Supporting Budget Panel */}
            <SupportingBudgetPanel
              reports={reports}
              totalBudget={totalBudget}
              setTotalBudget={setTotalBudget}
              language={language}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-cream-100 border-t border-cream-200 mt-auto py-8 text-center text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-saffron-50 border border-saffron-300 text-saffron-950 font-semibold text-xs">
            <span>🛡️</span>
            <span>
              {language === 'hi'
                ? 'सभी गणनाएं गणितीय अनुमानों पर आधारित हैं। अंतिम दरों एवं शर्तों की पुष्टि वेंडर के आधिकारिक जीएसटी बिल पर करें।'
                : 'All figures are deterministic calculations based on quote data. Always verify final pricing on an official GST invoice.'}
            </span>
          </div>
          <p className="text-gray-500">
            <strong>Quote X-Ray</strong> • Built with Next.js, TypeScript, Tailwind CSS & Google Gemini 2.5 Flash.
          </p>
        </div>
      </footer>
    </div>
  );
}

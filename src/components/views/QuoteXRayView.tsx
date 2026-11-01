'use client';

import React, { useState, useEffect } from 'react';
import type { Language, QuoteAnalysisReport, VendorType } from '@/types';
import { calculateTrueCost } from '@/lib/costMath';
import { QuoteInputCard } from '@/components/QuoteInputCard';
import { QuoteCompareView } from '@/components/QuoteCompareView';
import { GuestSlider } from '@/components/GuestSlider';
import { TrueCostCard } from '@/components/TrueCostCard';
import { RiskScoreCard } from '@/components/RiskScoreCard';
import { HiddenCostCard } from '@/components/HiddenCostCard';
import { SafePaymentCard } from '@/components/SafePaymentCard';
import { NegotiationMessageCard } from '@/components/NegotiationMessageCard';
import { SupportingBudgetPanel } from '@/components/SupportingBudgetPanel';
import { AlertBanner } from '@/components/AlertBanner';

const XRAY_STORAGE_KEY = 'quote-xray-reports';

interface QuoteXRayViewProps {
  language: Language;
  initialBudget?: number;
  initialQuoteText?: string;
}

export function QuoteXRayView({
  language,
  initialBudget = 1000000,
  initialQuoteText = '',
}: QuoteXRayViewProps) {
  const [quoteText, setQuoteText] = useState<string>(initialQuoteText);
  const [vendorType, setVendorType] = useState<VendorType>('caterer');
  const [guestCount, setGuestCount] = useState<number>(250);
  const [totalBudget, setTotalBudget] = useState<number>(initialBudget);
  const [isXrayLoading, setIsXrayLoading] = useState<boolean>(false);
  const [xrayError, setXrayError] = useState<string | null>(null);
  const [reports, setReports] = useState<QuoteAnalysisReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Load saved Quote X-Ray reports
  useEffect(() => {
    try {
      const stored = localStorage.getItem(XRAY_STORAGE_KEY);
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

  const saveXrayReports = (newReports: QuoteAnalysisReport[]) => {
    setReports(newReports);
    try {
      localStorage.setItem(XRAY_STORAGE_KEY, JSON.stringify(newReports));
    } catch {
      // Ignore
    }
  };

  const handleAnalyzeQuote = async () => {
    if (quoteText.trim().length < 20) return;

    setIsXrayLoading(true);
    setXrayError(null);

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
      const updated = [newReport, ...reports.filter((r) => r.id !== newReport.id)].slice(0, 3);
      saveXrayReports(updated);
      setActiveReportId(newReport.id);
    } catch (err: unknown) {
      setXrayError(err instanceof Error ? err.message : 'Unknown analysis error');
    } finally {
      setIsXrayLoading(false);
    }
  };

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
    saveXrayReports(updatedList);
  };

  const handleRemoveReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    saveXrayReports(updated);
    if (activeReportId === id) {
      setActiveReportId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0] || null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Promise Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-maroon-100 text-maroon-900 border border-maroon-300 shadow-2xs">
          <span>🛡️</span>
          <span>
            {language === 'hi'
              ? 'एडवांस देने से पहले कोट का एक्स-रे करें'
              : 'Vendor Quote Protection Engine'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-maroon-900 leading-tight">
          {language === 'hi'
            ? 'कोटेशन का एक्स-रे किए बिना कभी भी एडवांस न दें!'
            : "Don't pay the advance until you've X-Rayed the quote."}
        </h1>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {language === 'hi'
            ? 'WhatsApp पर मिला कच्चा कोटेशन यहाँ पेस्ट करें। हम वास्तविक कुल लागत निकालेंगे, छिपे शुल्क पकड़ेंगे, 50%+ एडवांस जोखिम चिन्हित करेंगे और वेंडर को भेजने हेतु एक विनम्र WhatsApp वार्ता संदेश तैयार करेंगे।'
            : 'Paste any rough WhatsApp or email quote. We calculate the true all-in cost, uncover hidden fees, flag predatory advance traps, and write a polite WhatsApp reply to negotiate safe milestone terms.'}
        </p>
      </div>

      {/* Error Alert */}
      {xrayError && (
        <AlertBanner
          type="error"
          title={language === 'hi' ? 'एक्स-रे विश्लेषण विफल' : 'Quote X-Ray Failed'}
          message={xrayError}
          onRetry={handleAnalyzeQuote}
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
        isLoading={isXrayLoading}
        onAnalyze={handleAnalyzeQuote}
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
                <span className="text-xs text-gray-500">
                  {language === 'hi' ? 'सक्रिय कोट:' : 'Switch Quote:'}
                </span>
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
    </div>
  );
}

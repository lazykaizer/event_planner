'use client';

import React, { useState, useEffect } from 'react';
import type {
  AppState,
  UserIntake,
  BudgetPlan,
  WhatIfOption,
  PlanHistoryEntry,
  VendorAnalysis,
  Timeline,
  Language,
  QuoteAnalysisReport,
  VendorType,
} from '@/types';
import { loadState, saveState, clearState } from '@/lib/storage';
import { calculateTrueCost } from '@/lib/costMath';
import { formatINR } from '@/lib/formatters';

// Navigation & Layout
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AlertBanner } from '@/components/AlertBanner';

// Shaadi Guardian Planner Components
import { IntakeWizard } from '@/components/IntakeWizard';
import { BudgetChart } from '@/components/BudgetChart';
import { BudgetTable } from '@/components/BudgetTable';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { VendorChecker } from '@/components/VendorChecker';
import { TimelineView } from '@/components/TimelineView';
import { SummaryPrintView } from '@/components/SummaryPrintView';

// Quote X-Ray Components
import { QuoteInputCard } from '@/components/QuoteInputCard';
import { TrueCostCard } from '@/components/TrueCostCard';
import { GuestSlider } from '@/components/GuestSlider';
import { HiddenCostCard } from '@/components/HiddenCostCard';
import { RiskScoreCard } from '@/components/RiskScoreCard';
import { SafePaymentCard } from '@/components/SafePaymentCard';
import { NegotiationMessageCard } from '@/components/NegotiationMessageCard';
import { QuoteCompareView } from '@/components/QuoteCompareView';
import { SupportingBudgetPanel } from '@/components/SupportingBudgetPanel';

const XRAY_STORAGE_KEY = 'quote-xray-reports';

export default function Home() {
  // Top-level view mode: 'home' (Full Shaadi Guardian Homepage & Planner) or 'xray' (Quote X-Ray Hero tool)
  const [currentView, setCurrentView] = useState<'home' | 'xray'>('home');

  // Shaadi Guardian Planner State
  const [appState, setAppState] = useState<AppState>({
    intake: null,
    budgetPlan: null,
    planHistory: [],
    vendorAnalyses: [],
    timeline: null,
    language: 'en',
  });

  const [activeTab, setActiveTab] = useState<string>('budget');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [hasStartedPlanner, setHasStartedPlanner] = useState<boolean>(false);

  // Quote X-Ray State
  const [quoteText, setQuoteText] = useState<string>('');
  const [vendorType, setVendorType] = useState<VendorType>('caterer');
  const [guestCount, setGuestCount] = useState<number>(250);
  const [totalBudget, setTotalBudget] = useState<number>(1000000);
  const [isXrayLoading, setIsXrayLoading] = useState<boolean>(false);
  const [xrayError, setXrayError] = useState<string | null>(null);
  const [reports, setReports] = useState<QuoteAnalysisReport[]>([]);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  // Load saved state on mount
  useEffect(() => {
    // Load planner state
    const loadedPlanner = loadState();
    if (loadedPlanner && (loadedPlanner.budgetPlan || loadedPlanner.intake)) {
      setAppState(loadedPlanner);
      setHasStartedPlanner(true);
    }

    // Load Quote X-Ray reports
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

  const updateAppState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  };

  const handleLanguageChange = (lang: Language) => {
    updateAppState((prev) => ({
      ...prev,
      language: lang,
      intake: prev.intake ? { ...prev.intake, language: lang } : null,
    }));
  };

  const handleResetPlanner = () => {
    if (
      window.confirm(
        appState.language === 'hi'
          ? 'क्या आप वाकई वर्तमान योजना रीसेट करना चाहते हैं?'
          : 'Are you sure you want to reset your event plan and start fresh?'
      )
    ) {
      clearState();
      setAppState({
        intake: null,
        budgetPlan: null,
        planHistory: [],
        vendorAnalyses: [],
        timeline: null,
        language: appState.language,
      });
      setHasStartedPlanner(false);
      setActiveTab('budget');
    }
  };

  // Generate Budget Plan via API route
  const handleIntakeSubmit = async (intake: UserIntake) => {
    setIsGeneratingPlan(true);
    setPlanError(null);

    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intake),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate budget plan');
      }

      const newPlan: BudgetPlan = data.plan;

      updateAppState((prev) => ({
        ...prev,
        intake,
        budgetPlan: newPlan,
        planHistory: [
          {
            plan: newPlan,
            changeDescription: 'Initial AI Plan Generation',
            timestamp: new Date().toISOString(),
          },
        ],
      }));

      setActiveTab('budget');
    } catch (err: unknown) {
      setPlanError(err instanceof Error ? err.message : 'Unknown generation error');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleUpdateAllocations = (newAllocations: BudgetPlan['allocations']) => {
    if (!appState.budgetPlan) return;
    const updatedPlan: BudgetPlan = {
      ...appState.budgetPlan,
      allocations: newAllocations,
    };
    updateAppState((prev) => ({ ...prev, budgetPlan: updatedPlan }));
  };

  const handleApplyWhatIfOption = (
    selectedOption: WhatIfOption,
    changeDescription: string,
    newTotalBudget?: number
  ) => {
    if (!appState.budgetPlan) return;

    const revisedBudget = newTotalBudget || appState.budgetPlan.totalBudget;
    const revisedPlan: BudgetPlan = {
      totalBudget: revisedBudget,
      allocations: selectedOption.allocations,
      summary: selectedOption.description,
      createdAt: new Date().toISOString(),
      version: appState.budgetPlan.version + 1,
    };

    updateAppState((prev) => ({
      ...prev,
      budgetPlan: revisedPlan,
      planHistory: [
        {
          plan: revisedPlan,
          changeDescription,
          timestamp: new Date().toISOString(),
        },
        ...prev.planHistory,
      ],
    }));

    setActiveTab('budget');
  };

  const handleRevertHistory = (historyEntry: PlanHistoryEntry) => {
    updateAppState((prev) => ({
      ...prev,
      budgetPlan: historyEntry.plan,
    }));
    setActiveTab('budget');
  };

  const handleSaveVendorAnalyses = (analyses: VendorAnalysis[]) => {
    updateAppState((prev) => ({
      ...prev,
      vendorAnalyses: analyses,
    }));
  };

  const handleUpdateTimeline = (timeline: Timeline) => {
    updateAppState((prev) => ({
      ...prev,
      timeline,
    }));
  };

  // --- Quote X-Ray Handlers ---
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
          language: appState.language,
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
  const lang = appState.language;
  const hasPlan = Boolean(appState.budgetPlan && appState.intake);

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 font-body text-gray-800">
      <Navbar
        language={lang}
        onLanguageChange={handleLanguageChange}
        onReset={handleResetPlanner}
        hasPlan={hasPlan && currentView === 'home'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ========================================================================= */}
        {/* VIEW 1: QUOTE X-RAY (Hero Tool)                                           */}
        {/* ========================================================================= */}
        {currentView === 'xray' ? (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Promise Banner */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-maroon-100 text-maroon-900 border border-maroon-300 shadow-2xs">
                <span>🛡️</span>
                <span>
                  {lang === 'hi'
                    ? 'एडवांस देने से पहले कोट का एक्स-रे करें'
                    : 'Vendor Quote Protection Engine'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-maroon-900 leading-tight">
                {lang === 'hi'
                  ? 'कोटेशन का एक्स-रे किए बिना कभी भी एडवांस न दें!'
                  : "Don't pay the advance until you've X-Rayed the quote."}
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {lang === 'hi'
                  ? 'WhatsApp पर मिला कच्चा कोटेशन यहाँ पेस्ट करें। हम वास्तविक कुल लागत निकालेंगे, छिपे शुल्क पकड़ेंगे, 50%+ एडवांस जोखिम चिन्हित करेंगे और वेंडर को भेजने हेतु एक विनम्र WhatsApp वार्ता संदेश तैयार करेंगे।'
                  : 'Paste any rough WhatsApp or email quote. We calculate the true all-in cost, uncover hidden fees, flag predatory advance traps, and write a polite WhatsApp reply to negotiate safe milestone terms.'}
              </p>
            </div>

            {/* Error Alert */}
            {xrayError && (
              <AlertBanner
                type="error"
                title={lang === 'hi' ? 'एक्स-रे विश्लेषण विफल' : 'Quote X-Ray Failed'}
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
              language={lang}
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
                language={lang}
              />
            )}

            {/* 3. Detailed Results Section for Active Report */}
            {activeReport && (
              <div className="space-y-6 animate-fade-in" aria-live="polite">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-maroon-900 pb-2">
                  <h2 className="text-xl font-heading font-bold text-maroon-900 flex items-center gap-2">
                    <span>📋</span>
                    <span>
                      {lang === 'hi' ? 'एक्स-रे रिपोर्ट:' : 'X-Ray Report:'}{' '}
                      {activeReport.extracted.vendorName}
                    </span>
                  </h2>

                  {reports.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {lang === 'hi' ? 'सक्रिय कोट:' : 'Switch Quote:'}
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
                  language={lang}
                />

                {/* True Cost Card */}
                <TrueCostCard
                  trueCost={activeReport.trueCost}
                  quote={activeReport.extracted}
                  language={lang}
                />

                {/* Risk Score Card */}
                <RiskScoreCard
                  overallRisk={activeReport.overallRisk}
                  redFlags={activeReport.redFlags}
                  language={lang}
                />

                {/* Hidden Cost Detector Card */}
                <HiddenCostCard
                  quote={activeReport.extracted}
                  language={lang}
                />

                {/* Safe Payment Plan Card */}
                <SafePaymentCard
                  saferPaymentPlan={activeReport.saferPaymentPlan}
                  getInWritingChecklist={activeReport.getInWritingChecklist}
                  language={lang}
                />

                {/* Negotiation WhatsApp Message Card */}
                <NegotiationMessageCard
                  messages={activeReport.whatsappNegotiationMessage}
                  language={lang}
                />

                {/* Supporting Budget Panel */}
                <SupportingBudgetPanel
                  reports={reports}
                  totalBudget={totalBudget}
                  setTotalBudget={setTotalBudget}
                  language={lang}
                />
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: FULL SHAADI GUARDIAN PLANNER & HOMEPAGE                           */
          /* ========================================================================= */
          <div>
            {!hasStartedPlanner && !hasPlan ? (
              /* LANDING HERO SECTION */
              <div className="space-y-12 py-6 sm:py-12 animate-fade-in">
                {/* Main Hero Header */}
                <div className="text-center max-w-3xl mx-auto space-y-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-saffron-100 text-saffron-900 border border-saffron-300 shadow-2xs">
                    <span>🛡️</span>
                    <span>
                      {lang === 'hi'
                        ? 'मध्यमवर्गीय परिवारों का विश्वसनीय शादी वित्तीय संरक्षक'
                        : 'Zero-Inflation Wedding Financial Advisor for Middle-Class Families'}
                    </span>
                  </span>

                  <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-maroon-900 leading-tight">
                    {lang === 'hi'
                      ? 'शादी की खुशियां पूरी, बिना बजट टूटे!'
                      : 'Your Dream Wedding, Mathematically Protected Against Budget Creep.'}
                  </h1>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {lang === 'hi'
                      ? '₹2 लाख से ₹25 लाख के बजट में कैटरिंग के छिपे खर्चों, वेंडर एडवांस जोखिमों और अचानक आने वाले बदलावों से अपने परिवार को बचाएं। 100% निष्पक्ष गणित और व्यावहारिक सुझाव।'
                      : 'Indian wedding budgets routinely inflate by 20–30% due to catering surprises, vanishing vendor deposits, and sudden headcount changes. Shaadi Guardian pairs Google Gemini with deterministic client math so every rupee is accounted for.'}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHasStartedPlanner(true)}
                      className="btn-primary text-base px-8 py-3.5 shadow-md hover:shadow-lg w-full sm:w-auto"
                    >
                      {lang === 'hi' ? 'योजना बनाना शुरू करें →' : 'Start Planning Your Event →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView('xray')}
                      className="btn-secondary text-base px-6 py-3.5 border-maroon-300 text-maroon-900 hover:bg-maroon-50 shadow-xs w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <span>🔍</span>
                      <span>
                        {lang === 'hi' ? 'कोट एक्स-रे खोलें (Instant)' : 'X-Ray a Vendor Quote →'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4 Core Value Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                  <div className="card p-6 space-y-2 border-t-4 border-t-maroon-900 hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-1">🔢</div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      {lang === 'hi' ? '100% सटीक गणित' : 'Deterministic Math'}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {lang === 'hi'
                        ? 'AI केवल रणनीतिक प्रतिशत सुझाता है; जोड़-घटाव हमारे कोड द्वारा होता है ताकि आपका कुल बजट कभी न बदले।'
                        : 'The AI proposes strategic percentage splits; our code does all arithmetic. If you budget ₹8,00,000, your plan sums to exactly ₹8,00,000.'}
                    </p>
                  </div>

                  <div className="card p-6 space-y-2 border-t-4 border-t-saffron-500 hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-1">⚡</div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      {lang === 'hi' ? 'व्हाट-इफ़ सिम्युलेटर' : 'What-If Simulator'}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {lang === 'hi'
                        ? 'बजट 20% कम हो गया? मेहमान 300 हो गए? नई तारीख? बिना दोबारा शुरू किए 3 व्यावहारिक विकल्प तुरंत देखें।'
                        : 'Budget dropped 20%? Guests surged to 300? Date moved earlier? Simulate real-world trade-offs without starting over from scratch.'}
                    </p>
                  </div>

                  <div className="card p-6 space-y-2 border-t-4 border-t-emerald-600 hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-1">🔍</div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      {lang === 'hi' ? 'कोट एक्स-रे' : 'Quote X-Ray'}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {lang === 'hi'
                        ? 'कच्चा कोटेशन पेस्ट करें। 50% से अधिक एडवांस, छिपे हुए जनरेटर चार्ज और व्यक्तिगत UPI जोखिम तुरंत पकड़ें।'
                        : "Don't pay advances blindly. Paste WhatsApp quotes to extract per-unit costs, hidden fees, and safe milestone payment plans."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentView('xray')}
                      className="text-xs font-bold text-maroon-900 hover:underline pt-1 inline-block"
                    >
                      {lang === 'hi' ? 'कोट चेक करें →' : 'Try Quote X-Ray →'}
                    </button>
                  </div>

                  <div className="card p-6 space-y-2 border-t-4 border-t-amber-600 hover:shadow-md transition-shadow">
                    <div className="text-2xl mb-1">📅</div>
                    <h3 className="font-heading font-bold text-lg text-gray-900">
                      {lang === 'hi' ? 'समय सारिणी एवं डिपेंडेंसी' : 'Timeline & Milestones'}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {lang === 'hi'
                        ? 'वेन्यू बुक होने के बाद ही कार्ड प्रिंट होंगे। क्रिटिकल पाथ पर अलर्ट के साथ तनाव-मुक्त तैयारी।'
                        : 'Dependencies mapped automatically. Never print invitation cards before the venue and caterer dates are locked in writing.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : !appState.budgetPlan || !appState.intake ? (
              /* SMART INTAKE WIZARD */
              <div className="py-4">
                <IntakeWizard
                  language={lang}
                  onSubmit={handleIntakeSubmit}
                  isLoading={isGeneratingPlan}
                  error={planError}
                  onClearError={() => setPlanError(null)}
                />
              </div>
            ) : (
              /* ACTIVE PLANNER DASHBOARD WITH TABS */
              <div className="space-y-6 animate-fade-in">
                {/* Top Quick Summary Bar */}
                <div className="card bg-gradient-to-r from-cream-100 via-white to-cream-100 p-4 flex flex-wrap items-center justify-between gap-3 border-cream-200">
                  <div className="flex items-center gap-4 flex-wrap text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase tracking-wider">
                        {lang === 'hi' ? 'समारोह' : 'Occasion'}
                      </span>
                      <span className="font-bold text-gray-900 capitalize">
                        {appState.intake.occasion}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-cream-300" />
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase tracking-wider">
                        {lang === 'hi' ? 'कुल बजट' : 'Total Budget'}
                      </span>
                      <span className="font-bold text-maroon-900 text-base">
                        {formatINR(appState.budgetPlan.totalBudget)}
                      </span>
                    </div>
                    <div className="h-6 w-px bg-cream-300" />
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase tracking-wider">
                        {lang === 'hi' ? 'मेहमान संख्या' : 'Guest Count'}
                      </span>
                      <span className="font-bold text-gray-900">
                        {appState.intake.guestCount} Pax
                      </span>
                    </div>
                    <div className="h-6 w-px bg-cream-300" />
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase tracking-wider">
                        {lang === 'hi' ? 'स्थान' : 'City'}
                      </span>
                      <span className="font-bold text-gray-900">
                        {appState.intake.city}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cream-200 text-maroon-900">
                    Plan v{appState.budgetPlan.version}
                  </span>
                </div>

                {/* TAB 1: BUDGET BREAKDOWN */}
                {activeTab === 'budget' && (
                  <div className="space-y-6">
                    <div className="card bg-maroon-50/60 border-maroon-200 p-5 space-y-1.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-maroon-900 flex items-center gap-1.5">
                        <span>💡</span>
                        <span>
                          {lang === 'hi'
                            ? 'AI वित्तीय सलाहकार का रणनीतिक अवलोकन:'
                            : 'AI Financial Advisor Strategic Overview:'}
                        </span>
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed italic">
                        &ldquo;{appState.budgetPlan.summary}&rdquo;
                      </p>
                    </div>

                    <BudgetChart
                      allocations={appState.budgetPlan.allocations}
                      totalBudget={appState.budgetPlan.totalBudget}
                      language={lang}
                    />

                    <BudgetTable
                      allocations={appState.budgetPlan.allocations}
                      totalBudget={appState.budgetPlan.totalBudget}
                      language={lang}
                      onUpdateAllocations={handleUpdateAllocations}
                    />
                  </div>
                )}

                {/* TAB 2: WHAT-IF SIMULATOR */}
                {activeTab === 'what-if' && (
                  <WhatIfSimulator
                    currentPlan={appState.budgetPlan}
                    intake={appState.intake}
                    planHistory={appState.planHistory}
                    language={lang}
                    onApplyOption={handleApplyWhatIfOption}
                    onRevertHistory={handleRevertHistory}
                  />
                )}

                {/* TAB 3: VENDOR QUOTES & RED FLAGS */}
                {activeTab === 'vendors' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-saffron-50 border border-saffron-200 p-4 rounded-xl">
                      <div>
                        <h4 className="font-bold text-sm text-maroon-900">
                          {lang === 'hi' ? 'विशेष कोट एक्स-रे इंजन उपलब्ध है' : 'Quote X-Ray Tool Available'}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {lang === 'hi'
                            ? 'लाइव गेस्ट स्लाइडर, ऑल-इन ट्रू कॉस्ट और व्हाट्सएप रिप्लाई जनरेटर के साथ विस्तृत विश्लेषण करें।'
                            : 'Analyze WhatsApp quotes with live guest sliders, deterministic true cost, and negotiation replies.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentView('xray')}
                        className="btn-primary text-xs px-4 py-2"
                      >
                        {lang === 'hi' ? 'कोट एक्स-रे खोलें →' : 'Launch Quote X-Ray →'}
                      </button>
                    </div>

                    <VendorChecker
                      language={lang}
                      allocatedCategoryAmount={
                        appState.budgetPlan.allocations.find((a) => a.category === 'catering')
                          ? {
                              category: 'catering',
                              amount:
                                appState.budgetPlan.allocations.find((a) => a.category === 'catering')
                                  ?.amount || 0,
                            }
                          : undefined
                      }
                      savedAnalyses={appState.vendorAnalyses}
                      onSaveAnalyses={handleSaveVendorAnalyses}
                    />
                  </div>
                )}

                {/* TAB 4: TIMELINE */}
                {activeTab === 'timeline' && (
                  <TimelineView
                    timeline={appState.timeline}
                    intake={appState.intake}
                    budgetPlan={appState.budgetPlan}
                    language={lang}
                    onUpdateTimeline={handleUpdateTimeline}
                  />
                )}

                {/* TAB 5: SUMMARY & PRINT */}
                {activeTab === 'summary' && (
                  <SummaryPrintView
                    intake={appState.intake}
                    budgetPlan={appState.budgetPlan}
                    timeline={appState.timeline}
                    vendorAnalyses={appState.vendorAnalyses}
                    language={lang}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer language={lang} />
    </div>
  );
}

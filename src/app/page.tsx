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
} from '@/types';
import { loadState, saveState, clearState } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { IntakeWizard } from '@/components/IntakeWizard';
import { BudgetChart } from '@/components/BudgetChart';
import { BudgetTable } from '@/components/BudgetTable';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { VendorChecker } from '@/components/VendorChecker';
import { TimelineView } from '@/components/TimelineView';
import { SummaryPrintView } from '@/components/SummaryPrintView';
import { formatINR } from '@/lib/formatters';

export default function Home() {
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
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Load state from localStorage on initial client mount
  useEffect(() => {
    const loaded = loadState();
    if (loaded && (loaded.budgetPlan || loaded.intake)) {
      setAppState(loaded);
      setHasStarted(true);
    }
  }, []);

  // Save state to localStorage whenever appState updates
  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  };

  const handleLanguageChange = (lang: Language) => {
    updateState((prev) => ({
      ...prev,
      language: lang,
      intake: prev.intake ? { ...prev.intake, language: lang } : null,
    }));
  };

  const handleReset = () => {
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
      setHasStarted(false);
      setActiveTab('budget');
    }
  };

  // Generate budget plan via API route
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

      updateState((prev) => ({
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

  // Handle manual edits to budget table
  const handleUpdateAllocations = (newAllocations: BudgetPlan['allocations']) => {
    if (!appState.budgetPlan) return;
    const updatedPlan: BudgetPlan = {
      ...appState.budgetPlan,
      allocations: newAllocations,
    };
    updateState((prev) => ({ ...prev, budgetPlan: updatedPlan }));
  };

  // Apply What-If selected option
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

    updateState((prev) => ({
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

  // Revert history version
  const handleRevertHistory = (historyEntry: PlanHistoryEntry) => {
    updateState((prev) => ({
      ...prev,
      budgetPlan: historyEntry.plan,
    }));
    setActiveTab('budget');
  };

  // Save vendor analyses
  const handleSaveVendorAnalyses = (analyses: VendorAnalysis[]) => {
    updateState((prev) => ({
      ...prev,
      vendorAnalyses: analyses,
    }));
  };

  // Update timeline
  const handleUpdateTimeline = (timeline: Timeline) => {
    updateState((prev) => ({
      ...prev,
      timeline,
    }));
  };

  const hasPlan = Boolean(appState.budgetPlan && appState.intake);
  const lang = appState.language;

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 font-body text-gray-800">
      <Navbar
        language={lang}
        onLanguageChange={handleLanguageChange}
        onReset={handleReset}
        hasPlan={hasPlan}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!hasStarted && !hasPlan ? (
          /* ============================================================= */
          /* LANDING HERO SECTION (High visual impact, clear value prop)     */
          /* ============================================================= */
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
                  ? '₹2 लाख से ₹25 लाख के बजट में कैटरिंग के छिपे खर्चों, वेंडर एडवांस जोखिमों और अचानक आने वाले बदलावों से अपने परिवार को बचाएं।'
                  : 'Indian wedding budgets routinely inflate by 20–30% due to catering surprises, vanishing vendor deposits, and sudden headcount changes. Shaadi Guardian pairs Google Gemini with deterministic client math so every rupee is accounted for.'}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setHasStarted(true)}
                  className="btn-primary text-base px-8 py-3.5 shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                  {lang === 'hi' ? 'योजना बनाना शुरू करें →' : 'Start Planning Your Event →'}
                </button>
              </div>
            </div>

            {/* 3 Core Value Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="card p-6 space-y-2 border-t-4 border-t-maroon-900">
                <div className="text-2xl mb-1">🔢</div>
                <h3 className="font-heading font-bold text-lg text-gray-900">
                  {lang === 'hi' ? '100% सटीक गणित (No AI Math)' : 'Deterministic Math Guarantee'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {lang === 'hi'
                    ? 'AI केवल प्रतिशत और सुझाव तय करता है; जोड़-घटाव हमारे कोड द्वारा होता है ताकि आपका कुल बजट कभी न बदले।'
                    : 'The AI proposes strategic percentage splits; our code does all arithmetic. If you budget ₹8,00,000, your plan sums to exactly ₹8,00,000 down to the rupee.'}
                </p>
              </div>

              <div className="card p-6 space-y-2 border-t-4 border-t-saffron-500">
                <div className="text-2xl mb-1">⚡</div>
                <h3 className="font-heading font-bold text-lg text-gray-900">
                  {lang === 'hi' ? 'व्हाट-इफ़ सिम्युलेटर (Hero Feature)' : 'What-If Trade-Off Simulator'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {lang === 'hi'
                    ? 'मेहमान बढ़ गए या बजट कम हो गया? दोबारा शुरू करने की जरूरत नहीं। अपनी भाषा में लिखें और समझदार समझौते चुनें।'
                    : 'Budget dropped 20%? Guests surged to 300? Date moved earlier? Simulate real-world trade-offs without starting over from scratch.'}
                </p>
              </div>

              <div className="card p-6 space-y-2 border-t-4 border-t-emerald-600">
                <div className="text-2xl mb-1">🛡️</div>
                <h3 className="font-heading font-bold text-lg text-gray-900">
                  {lang === 'hi' ? 'वेंडर रेड-फ्लैग एवं अनुबंध सुरक्षा' : 'Vendor Red-Flag Detection'}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {lang === 'hi'
                    ? 'कच्चा कोटेशन पेस्ट करें। 50% से अधिक एडवांस, छिपे हुए जनरेटर चार्ज और व्यक्तिगत UPI जोखिम तुरंत पकड़ें।'
                    : 'Hybrid deterministic rules and AI scan messy quotes for 50%+ advance traps, cash-only requests, and unstated cancellation terms.'}
                </p>
              </div>
            </div>
          </div>
        ) : !appState.budgetPlan || !appState.intake ? (
          /* ============================================================= */
          /* SMART INTAKE WIZARD (F1)                                      */
          /* ============================================================= */
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
          /* ============================================================= */
          /* ACTIVE PLANNER DASHBOARD WITH TABS                            */
          /* ============================================================= */
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

              {/* Version pill */}
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cream-200 text-maroon-900">
                Plan v{appState.budgetPlan.version}
              </span>
            </div>

            {/* TAB 1: BUDGET BREAKDOWN (F2) */}
            {activeTab === 'budget' && (
              <div className="space-y-6">
                {/* AI Executive Strategy Card */}
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

                {/* Donut & Bar Chart */}
                <BudgetChart
                  allocations={appState.budgetPlan.allocations}
                  totalBudget={appState.budgetPlan.totalBudget}
                  language={lang}
                />

                {/* Interactive Rebalancing Table */}
                <BudgetTable
                  allocations={appState.budgetPlan.allocations}
                  totalBudget={appState.budgetPlan.totalBudget}
                  language={lang}
                  onUpdateAllocations={handleUpdateAllocations}
                />
              </div>
            )}

            {/* TAB 2: WHAT-IF SIMULATOR (F3 Hero Feature) */}
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

            {/* TAB 3: VENDOR QUOTES & RED FLAGS (F4 & F5) */}
            {activeTab === 'vendors' && (
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
            )}

            {/* TAB 4: TIMELINE WITH DEPENDENCIES (F6) */}
            {activeTab === 'timeline' && (
              <TimelineView
                timeline={appState.timeline}
                intake={appState.intake}
                budgetPlan={appState.budgetPlan}
                language={lang}
                onUpdateTimeline={handleUpdateTimeline}
              />
            )}

            {/* TAB 5: SUMMARY & PRINT (F7) */}
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
      </main>

      <Footer language={lang} />
    </div>
  );
}

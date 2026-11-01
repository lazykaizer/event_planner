'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { PlannerView } from '@/components/views/PlannerView';

export default function EventPlannerPage() {
  const router = useRouter();

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
  const [hasStartedPlanner, setHasStartedPlanner] = useState<boolean>(true);

  // Load saved state on mount
  useEffect(() => {
    const loadedPlanner = loadState();
    if (loadedPlanner) {
      setAppState(loadedPlanner);
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
      setActiveTab('budget');
    }
  };

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

  const lang = appState.language;
  const hasPlan = Boolean(appState.budgetPlan && appState.intake);

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 font-body text-gray-800">
      <Navbar
        language={lang}
        onLanguageChange={handleLanguageChange}
        onReset={handleResetPlanner}
        hasPlan={hasPlan}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentView="event"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PlannerView
          appState={appState}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasStartedPlanner={hasStartedPlanner}
          setHasStartedPlanner={setHasStartedPlanner}
          isGeneratingPlan={isGeneratingPlan}
          planError={planError}
          setPlanError={setPlanError}
          onIntakeSubmit={handleIntakeSubmit}
          onUpdateAllocations={handleUpdateAllocations}
          onApplyWhatIfOption={handleApplyWhatIfOption}
          onRevertHistory={handleRevertHistory}
          onSaveVendorAnalyses={handleSaveVendorAnalyses}
          onUpdateTimeline={handleUpdateTimeline}
          onNavigateToXRay={() => router.push('/x-ray')}
        />
      </main>

      <Footer language={lang} />
    </div>
  );
}

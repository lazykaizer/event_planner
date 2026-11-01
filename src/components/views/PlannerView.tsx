'use client';

import React from 'react';
import type {
  AppState,
  UserIntake,
  BudgetPlan,
  WhatIfOption,
  PlanHistoryEntry,
  VendorAnalysis,
  Timeline,
} from '@/types';
import { formatINR } from '@/lib/formatters';
import { IntakeWizard } from '@/components/IntakeWizard';
import { BudgetChart } from '@/components/BudgetChart';
import { BudgetTable } from '@/components/BudgetTable';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { VendorChecker } from '@/components/VendorChecker';
import { TimelineView } from '@/components/TimelineView';
import { SummaryPrintView } from '@/components/SummaryPrintView';

interface PlannerViewProps {
  appState: AppState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasStartedPlanner: boolean;
  setHasStartedPlanner: (started: boolean) => void;
  isGeneratingPlan: boolean;
  planError: string | null;
  setPlanError: (err: string | null) => void;
  onIntakeSubmit: (intake: UserIntake) => Promise<void>;
  onUpdateAllocations: (newAllocations: BudgetPlan['allocations']) => void;
  onApplyWhatIfOption: (
    selectedOption: WhatIfOption,
    changeDescription: string,
    newTotalBudget?: number
  ) => void;
  onRevertHistory: (historyEntry: PlanHistoryEntry) => void;
  onSaveVendorAnalyses: (analyses: VendorAnalysis[]) => void;
  onUpdateTimeline: (timeline: Timeline) => void;
  onNavigateToXRay: () => void;
}

export function PlannerView({
  appState,
  activeTab,
  setActiveTab,
  hasStartedPlanner,
  setHasStartedPlanner,
  isGeneratingPlan,
  planError,
  setPlanError,
  onIntakeSubmit,
  onUpdateAllocations,
  onApplyWhatIfOption,
  onRevertHistory,
  onSaveVendorAnalyses,
  onUpdateTimeline,
  onNavigateToXRay,
}: PlannerViewProps) {
  const lang = appState.language;
  const hasPlan = Boolean(appState.budgetPlan && appState.intake);

  if (!hasStartedPlanner && !hasPlan) {
    return null;
  }

  if (!appState.budgetPlan || !appState.intake) {
    return (
      <div className="py-4">
        <IntakeWizard
          language={lang}
          onSubmit={onIntakeSubmit}
          isLoading={isGeneratingPlan}
          error={planError}
          onClearError={() => setPlanError(null)}
        />
      </div>
    );
  }

  return (
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
            onUpdateAllocations={onUpdateAllocations}
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
          onApplyOption={onApplyWhatIfOption}
          onRevertHistory={onRevertHistory}
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
              onClick={onNavigateToXRay}
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
            onSaveAnalyses={onSaveVendorAnalyses}
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
          onUpdateTimeline={onUpdateTimeline}
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
  );
}

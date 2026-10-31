'use client';

import React, { useState } from 'react';
import type {
  BudgetPlan,
  UserIntake,
  WhatIfResult,
  WhatIfOption,
  PlanHistoryEntry,
  Language,
} from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { formatINR } from '@/lib/formatters';
import { AlertBanner } from '@/components/AlertBanner';
import { EstimateBadge } from '@/components/EstimateBadge';

interface WhatIfSimulatorProps {
  currentPlan: BudgetPlan;
  intake: UserIntake;
  planHistory: PlanHistoryEntry[];
  language: Language;
  onApplyOption: (selectedOption: WhatIfOption, changeDescription: string, newTotalBudget?: number) => void;
  onRevertHistory: (historyEntry: PlanHistoryEntry) => void;
}

const COMMON_SCENARIOS = [
  {
    en: 'Budget dropped by 20%',
    hi: 'बजट में 20% की कमी हो गई',
    icon: '📉',
  },
  {
    en: 'Guests increased to 300',
    hi: 'मेहमानों की संख्या बढ़कर 300 हो गई',
    icon: '👥',
  },
  {
    en: 'Date moved 3 weeks earlier',
    hi: 'समारोह की तारीख 3 सप्ताह पहले आ गई',
    icon: '⏳',
  },
  {
    en: 'Double spend on photography & video',
    hi: 'फोटोग्राफी और वीडियो पर खर्च दोगुना करना है',
    icon: '📸',
  },
  {
    en: 'Protect food quality, reduce floral decor',
    hi: 'भोजन की गुणवत्ता बचाएं, फूलों की सजावट घटाएं',
    icon: '🍲',
  },
];

export function WhatIfSimulator({
  currentPlan,
  intake,
  planHistory,
  language,
  onApplyOption,
  onRevertHistory,
}: WhatIfSimulatorProps) {
  const [changeText, setChangeText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<WhatIfResult | null>(null);
  const [newTotalBudget, setNewTotalBudget] = useState<number | undefined>(undefined);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleSimulate = async (scenarioText?: string) => {
    const textToRun = scenarioText || changeText;
    if (!textToRun.trim()) return;

    setIsLoading(true);
    setError(null);
    setSimResult(null);
    setSelectedOptionId(null);

    try {
      const res = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeDescription: textToRun,
          currentPlan,
          intake,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to simulate what-if scenario');
      }

      setSimResult(data.result);
      setNewTotalBudget(data.newTotalBudget);
      if (data.result.afterOptions.length > 0) {
        setSelectedOptionId(data.result.afterOptions[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown simulation error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySelected = () => {
    if (!simResult || !selectedOptionId) return;
    const option = simResult.afterOptions.find((o) => o.id === selectedOptionId);
    if (!option) return;

    onApplyOption(option, changeText || 'Simulated trade-off revision', newTotalBudget);
    setSimResult(null);
    setChangeText('');
  };

  const activeOption = simResult?.afterOptions.find((o) => o.id === selectedOptionId);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="card bg-gradient-to-r from-cream-100 to-white border-maroon-100 p-6">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-maroon-100 text-maroon-900 border border-maroon-200">
            <span>⚡</span>
            <span>{language === 'hi' ? 'हीरो फीचर: व्हाट-इफ़ सिम्युलेटर' : 'Hero Feature: What-If Simulator'}</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-maroon-900">
            {language === 'hi'
              ? 'बदलती परिस्थितियों में व्यावहारिक वित्तीय समझौते (Trade-Offs)'
              : 'Adapt Instantly Without Starting Over'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {language === 'hi'
              ? 'जब बजट कम हो, मेहमान बढ़ जाएं, या तारीख बदल जाए, तो हर जगह आंख मूंदकर कटौती मत कीजिए। अपनी भाषा में बदलाव लिखें और AI द्वारा तैयार रणनीतिक विकल्पों की तुलना करें।'
              : 'Events change. Budgets fluctuate, dates move, guest lists explode. Type your change in plain language — our AI presents real-world compromises so you stay in control without starting from scratch.'}
          </p>
        </div>
      </div>

      {/* Input Section with Quick Chips */}
      <div className="card space-y-4">
        <label htmlFor="whatif-input" className="label-text text-sm sm:text-base font-semibold text-gray-900">
          {language === 'hi' ? 'आपकी योजना में क्या बदलाव आया है?' : 'What changed in your event plan?'}
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="whatif-input"
            type="text"
            value={changeText}
            onChange={(e) => setChangeText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
            placeholder={
              language === 'hi'
                ? 'उदा. "बजट 20% कम हो गया" या "मेहमान 300 हो गए"'
                : 'e.g., "budget dropped by 20%", "guests increased to 300", "we want 2x spend on photography"'
            }
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => handleSimulate()}
            disabled={isLoading || !changeText.trim()}
            className="btn-primary shrink-0 py-3 px-6 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{language === 'hi' ? 'सिम्युलेट हो रहा है...' : 'Simulating...'}</span>
              </span>
            ) : (
              <span>{language === 'hi' ? 'विकल्प देखें 🔮' : 'Simulate Trade-Offs 🔮'}</span>
            )}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
            {language === 'hi' ? 'त्वरित परिदृश्य:' : 'Quick demo scenarios:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {COMMON_SCENARIOS.map((sc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const val = language === 'hi' ? sc.hi : sc.en;
                  setChangeText(val);
                  handleSimulate(val);
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-cream-100 hover:bg-cream-200 text-gray-700 border border-cream-300 transition-colors disabled:opacity-50"
              >
                <span>{sc.icon}</span>
                <span>{language === 'hi' ? sc.hi : sc.en}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert with Retry */}
      {error && (
        <AlertBanner
          type="error"
          title={language === 'hi' ? 'सिम्युलेशन त्रुटि' : 'Simulation Failed'}
          message={error}
          onRetry={() => handleSimulate()}
        />
      )}

      {/* SIMULATION RESULTS & STRATEGIC TRADE-OFF OPTIONS */}
      {simResult && activeOption && (
        <div className="card space-y-6 border-2 border-maroon-300 bg-white shadow-md animate-slide-up">
          {/* Trade-Off Context Banner */}
          <div className="p-4 rounded-xl bg-maroon-50/70 border border-maroon-200 space-y-2">
            <div className="flex items-center gap-2 text-maroon-900 font-semibold text-sm">
              <span className="text-lg">⚖️</span>
              <span>
                {language === 'hi' ? 'व्यावहारिक प्रभाव एवं समझौते:' : 'Real-World Compromises Explained:'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-body">
              {simResult.tradeOffExplanation}
            </p>
          </div>

          {/* Option Selector Tabs */}
          <div>
            <span className="label-text font-semibold text-gray-900 mb-2">
              {language === 'hi'
                ? 'AI द्वारा प्रस्तुत रणनीतिक विकल्प (एक चुनें):'
                : 'Select an AI Strategic Strategy:'}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {simResult.afterOptions.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-maroon-900 bg-maroon-50/80 ring-2 ring-maroon-900 shadow-xs'
                        : 'border-cream-300 hover:border-maroon-300 bg-cream-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-saffron-800">
                          {language === 'hi' ? `विकल्प ${idx + 1}` : `Option ${idx + 1}`}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-maroon-900 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        {opt.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIDE-BY-SIDE BEFORE vs AFTER COMPARISON TABLE */}
          <div className="space-y-2">
            <h4 className="font-heading font-semibold text-sm text-gray-900 flex items-center gap-2">
              <span>📊</span>
              <span>
                {language === 'hi'
                  ? 'पहले बनाम बाद में: श्रेणीवार अंतर तालिका'
                  : 'Before vs After: Category Shift Table'}
              </span>
              <EstimateBadge />
            </h4>

            <div className="overflow-x-auto border border-cream-200 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-cream-100 text-maroon-900 font-semibold text-[11px] uppercase">
                  <tr>
                    <th className="px-4 py-2.5">{language === 'hi' ? 'श्रेणी' : 'Category'}</th>
                    <th className="px-3 py-2.5 text-right">{language === 'hi' ? 'पहले (Before)' : 'Before'}</th>
                    <th className="px-3 py-2.5 text-right">{language === 'hi' ? 'बाद में (After)' : 'After'}</th>
                    <th className="px-4 py-2.5 text-right">{language === 'hi' ? 'अंतर (Difference)' : 'Difference'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {activeOption.allocations.map((afterAlloc) => {
                    const beforeAlloc = currentPlan.allocations.find(
                      (b) => b.category === afterAlloc.category
                    );
                    const beforeAmt = beforeAlloc ? beforeAlloc.amount : 0;
                    const diffAmt = afterAlloc.amount - beforeAmt;
                    const isPositive = diffAmt > 0;
                    const isZero = diffAmt === 0;

                    return (
                      <tr key={afterAlloc.category} className="hover:bg-cream-50">
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {CATEGORY_LABELS[afterAlloc.category]?.[language] || afterAlloc.category}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-500">
                          {formatINR(beforeAmt)}
                          <span className="text-[10px] block text-gray-400">
                            {beforeAlloc ? beforeAlloc.percentage.toFixed(1) : 0}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                          {formatINR(afterAlloc.amount)}
                          <span className="text-[10px] block text-saffron-700">
                            {afterAlloc.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {isZero ? (
                            <span className="text-gray-400">—</span>
                          ) : isPositive ? (
                            <span className="text-green-700">+{formatINR(diffAmt)}</span>
                          ) : (
                            <span className="text-red-700">-{formatINR(Math.abs(diffAmt))}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-cream-100 font-semibold border-t border-cream-300">
                  <tr>
                    <td className="px-4 py-2.5 text-maroon-900">{language === 'hi' ? 'कुल बजट' : 'Total Budget'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{formatINR(currentPlan.totalBudget)}</td>
                    <td className="px-3 py-2.5 text-right text-maroon-900 font-bold">
                      {formatINR(newTotalBudget || currentPlan.totalBudget)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {newTotalBudget && newTotalBudget !== currentPlan.totalBudget ? (
                        <span className={newTotalBudget > currentPlan.totalBudget ? 'text-green-700' : 'text-red-700'}>
                          {newTotalBudget > currentPlan.totalBudget ? '+' : '-'}
                          {formatINR(Math.abs(newTotalBudget - currentPlan.totalBudget))}
                        </span>
                      ) : (
                        <span className="text-gray-400">₹0</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action to Apply Selected Strategy */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-cream-200">
            <p className="text-xs text-gray-500">
              {language === 'hi'
                ? 'यह विकल्प चुनने पर आपकी वर्तमान योजना सुरक्षित रूप से अपडेट हो जाएगी। पिछला संस्करण इतिहास में सुरक्षित रहेगा।'
                : 'Applying this option updates your live budget plan. Your previous version is preserved in history.'}
            </p>

            <button
              type="button"
              onClick={handleApplySelected}
              className="btn-secondary px-6 py-2.5 text-xs sm:text-sm font-semibold w-full sm:w-auto shrink-0 shadow-sm"
            >
              {language === 'hi' ? '✓ यह विकल्प लागू करें' : '✓ Apply This Revision to Plan'}
            </button>
          </div>
        </div>
      )}

      {/* PLAN CHANGE HISTORY / REVERT TIMELINE */}
      {planHistory.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-3">
            <h3 className="font-heading font-semibold text-base text-gray-900 flex items-center gap-2">
              <span>🕒</span>
              <span>{language === 'hi' ? 'योजना संशोधन इतिहास' : 'Version History & Undo'}</span>
            </h3>
            <span className="text-xs text-gray-500">
              {planHistory.length} {language === 'hi' ? 'संशोधन' : 'revisions saved'}
            </span>
          </div>

          <div className="space-y-3">
            {planHistory.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-cream-200 bg-cream-50/50 hover:bg-cream-100 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-maroon-900">
                      v{entry.plan.version}
                    </span>
                    <span className="text-xs text-gray-700 font-medium">
                      &ldquo;{entry.changeDescription}&rdquo;
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {formatINR(entry.plan.totalBudget)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRevertHistory(entry)}
                  className="text-xs font-medium text-maroon-900 hover:text-maroon-700 bg-white hover:bg-cream-100 px-3 py-1.5 rounded border border-cream-300 shadow-2xs transition-colors"
                >
                  {language === 'hi' ? 'इस पर लौटें ↺' : 'Revert to this ↺'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import type { QuoteAnalysisReport, Language } from '@/types';
import { formatINR, formatIndianNumber, parseINR } from '@/lib/formatters';
import { checkBudgetSensibility } from '@/lib/costMath';

interface SupportingBudgetPanelProps {
  reports: QuoteAnalysisReport[];
  totalBudget: number;
  setTotalBudget: (budget: number) => void;
  language: Language;
}

export function SupportingBudgetPanel({
  reports,
  totalBudget,
  setTotalBudget,
  language,
}: SupportingBudgetPanelProps) {
  const [budgetStr, setBudgetStr] = useState<string>(
    totalBudget > 0 ? formatIndianNumber(totalBudget) : '10,00,000'
  );

  const handleBudgetChange = (val: string) => {
    const num = parseINR(val);
    setBudgetStr(val);
    if (num && num > 0) {
      setTotalBudget(num);
    }
  };

  return (
    <div className="card space-y-4 bg-gradient-to-r from-cream-100 to-white border border-cream-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-800 block">
            {language === 'hi' ? 'सहायक बजट नियंत्रण पैनल' : 'Supporting Budget Health Check'}
          </span>
          <h3 className="text-base font-heading font-bold text-gray-900">
            {language === 'hi' ? 'कुल बजट में इस कोटेशन का हिस्सा' : 'Budget Share & Sensibility Check'}
          </h3>
        </div>

        {/* Total Budget Input */}
        <div className="flex items-center gap-2">
          <label htmlFor="budget-panel-input" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
            {language === 'hi' ? 'कुल विवाह बजट:' : 'Total Event Budget:'}
          </label>
          <div className="relative w-36">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-gray-400 font-bold">
              ₹
            </span>
            <input
              id="budget-panel-input"
              type="text"
              value={budgetStr}
              onChange={(e) => handleBudgetChange(e.target.value)}
              className="w-full pl-6 pr-2 py-1 text-xs font-bold text-maroon-900 border border-cream-300 rounded-lg bg-white"
              placeholder="10,00,000"
            />
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          {language === 'hi'
            ? 'ऊपर कोई कोटेशन विश्लेषित करें ताकि यह देखा जा सके कि वह आपके कुल बजट का कितना हिस्सा लेता है।'
            : 'X-Ray a quote above to check if its share fits within sensible middle-class Indian wedding benchmarks.'}
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const check = checkBudgetSensibility(
              report.selectedVendorType,
              report.trueCost.totalTrueCost,
              totalBudget
            );

            return (
              <div
                key={report.id}
                className="p-3 rounded-xl bg-white border border-cream-200 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    {report.extracted.vendorName} ({report.selectedVendorType})
                  </span>
                  <span className="font-bold text-maroon-900">
                    {formatINR(report.trueCost.totalTrueCost)} ({check.percentageOfBudget}% of budget)
                  </span>
                </div>

                {/* Percentage progress bar */}
                <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      !check.isSensible
                        ? 'bg-red-600'
                        : check.percentageOfBudget > check.benchmarkRange.max
                        ? 'bg-amber-500'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(check.percentageOfBudget, 100)}%` }}
                  />
                </div>

                {/* Benchmark warning or note */}
                {check.warningMessage ? (
                  <p className="text-[11px] text-amber-800 font-medium">
                    ⚠️ {check.warningMessage}
                  </p>
                ) : (
                  <p className="text-[11px] text-green-800">
                    ✓ Fits well within typical {check.benchmarkRange.min}%–{check.benchmarkRange.max}% benchmark for this category.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

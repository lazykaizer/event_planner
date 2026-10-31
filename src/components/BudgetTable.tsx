'use client';

import React, { useState } from 'react';
import type { BudgetAllocation, BudgetCategory, Language } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { formatINR, formatIndianNumber, parseINR } from '@/lib/formatters';
import { recalcAfterManualEdit, budgetDifference } from '@/lib/budgetMath';
import { EstimateBadge } from '@/components/EstimateBadge';

interface BudgetTableProps {
  allocations: BudgetAllocation[];
  totalBudget: number;
  language: Language;
  onUpdateAllocations: (newAllocations: BudgetAllocation[]) => void;
  onResetPlan?: () => void;
}

export function BudgetTable({
  allocations,
  totalBudget,
  language,
  onUpdateAllocations,
  onResetPlan,
}: BudgetTableProps) {
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const diff = budgetDifference(totalBudget, allocations);
  const isOverBudget = diff > 0;
  const isUnderBudget = diff < 0;

  const startEdit = (category: BudgetCategory, currentAmount: number) => {
    setEditingCategory(category);
    setEditValue(currentAmount.toString());
  };

  const handleSave = (category: BudgetCategory) => {
    const parsed = parseINR(editValue);
    if (parsed !== null && !isNaN(parsed)) {
      const updated = recalcAfterManualEdit(totalBudget, allocations, category, parsed);
      onUpdateAllocations(updated);
    }
    setEditingCategory(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, category: BudgetCategory) => {
    if (e.key === 'Enter') {
      handleSave(category);
    } else if (e.key === 'Escape') {
      setEditingCategory(null);
    }
  };

  return (
    <div className="card space-y-4">
      {/* Table Toolbar & Budget Health Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
        <div>
          <h3 className="text-lg font-heading font-semibold text-gray-900">
            {language === 'hi' ? 'श्रेणीवार बजट तालिका' : 'Itemized Category Breakdown'}
          </h3>
          <p className="text-xs text-gray-500">
            {language === 'hi'
              ? 'किसी भी राशि पर क्लिक करके मैन्युअल बदलाव करें। शेष श्रेणियां स्वतः संतुलित होंगी।'
              : 'Click any rupee amount to manually edit. Remaining categories rebalance automatically.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onResetPlan && (
            <button
              type="button"
              onClick={onResetPlan}
              className="text-xs text-maroon-800 hover:text-maroon-900 underline font-medium"
            >
              {language === 'hi' ? 'AI मूल योजना रीसेट करें' : 'Reset to AI Split'}
            </button>
          )}
        </div>
      </div>

      {/* Budget Balance Status Alert */}
      {isOverBudget && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              {language === 'hi'
                ? `चेतावनी: आपका कुल बजट ₹${formatIndianNumber(diff)} अधिक हो गया है!`
                : `Warning: Allocations exceed your total budget by ₹${formatIndianNumber(diff)}!`}
            </span>
          </div>
          <span className="font-semibold">{formatINR(totalBudget + diff)} / {formatINR(totalBudget)}</span>
        </div>
      )}

      {isUnderBudget && (
        <div
          role="status"
          className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {language === 'hi'
                ? `अनावंटित शेष राशि: ₹${formatIndianNumber(Math.abs(diff))}`
                : `Unallocated surplus: ₹${formatIndianNumber(Math.abs(diff))} remaining.`}
            </span>
          </div>
        </div>
      )}

      {/* Accessible Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <caption className="sr-only">Detailed wedding budget allocation table</caption>
          <thead className="bg-cream-100 text-maroon-900 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th scope="col" className="px-4 py-3 rounded-l-lg">
                {language === 'hi' ? 'श्रेणी' : 'Category'}
              </th>
              <th scope="col" className="px-3 py-3 text-right">
                {language === 'hi' ? 'प्रतिशत' : 'Split %'}
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                {language === 'hi' ? 'अनुमानित राशि' : 'Allocated Amount'}
              </th>
              <th scope="col" className="px-4 py-3 rounded-r-lg">
                {language === 'hi' ? 'AI रणनीतिक कारण एवं परामर्श' : 'AI Strategic Reasoning'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {allocations.map((alloc) => {
              const isEditing = editingCategory === alloc.category;

              return (
                <tr
                  key={alloc.category}
                  className={`hover:bg-cream-50/80 transition-colors ${
                    alloc.isManualOverride ? 'bg-amber-50/40' : ''
                  }`}
                >
                  {/* Category Name */}
                  <th scope="row" className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_LABELS[alloc.category]?.[language] || alloc.category}</span>
                      {alloc.isManualOverride && (
                        <span
                          className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 rounded border border-amber-200"
                          title="Manually adjusted amount"
                        >
                          {language === 'hi' ? 'मैन्युअल' : 'Edited'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* Percentage */}
                  <td className="px-3 py-3.5 text-right font-medium text-gray-600">
                    {alloc.percentage.toFixed(1)}%
                  </td>

                  {/* Rupee Amount with Inline Edit and Estimate Badge */}
                  <td className="px-4 py-3.5 text-right font-semibold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSave(alloc.category)}
                            onKeyDown={(e) => handleKeyDown(e, alloc.category)}
                            className="w-28 px-2 py-1 text-xs border border-maroon-500 rounded text-right focus:outline-none focus:ring-1 focus:ring-maroon-500"
                            aria-label={`Edit amount for ${alloc.category}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleSave(alloc.category)}
                            className="p-1 text-green-700 hover:text-green-800"
                            aria-label="Save amount"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(alloc.category, alloc.amount)}
                          className="group inline-flex items-center gap-1 hover:text-maroon-900 focus:outline-none focus:underline"
                          title="Click to edit amount"
                          aria-label={`Amount: ${formatINR(alloc.amount)}. Click to edit`}
                        >
                          <span className="group-hover:underline">{formatINR(alloc.amount)}</span>
                          <svg
                            className="w-3.5 h-3.5 text-gray-400 group-hover:text-maroon-900"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                      <EstimateBadge />
                    </div>
                  </td>

                  {/* AI Reasoning */}
                  <td className="px-4 py-3.5 text-gray-600 leading-relaxed text-xs">
                    {alloc.reasoning}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-cream-100/70 border-t-2 border-cream-300 font-semibold text-gray-900">
            <tr>
              <th scope="row" className="px-4 py-3 text-maroon-900">
                {language === 'hi' ? 'कुल बजट' : 'Total Planned Budget'}
              </th>
              <td className="px-3 py-3 text-right">100.0%</td>
              <td className="px-4 py-3 text-right text-base text-maroon-900 whitespace-nowrap">
                {formatINR(allocations.reduce((s, a) => s + a.amount, 0))}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 font-normal">
                {language === 'hi'
                  ? 'गणितीय सटीकता: सभी श्रेणियों का योग मूल बजट के ठीक बराबर है।'
                  : 'Deterministic guarantee: Category sum matches your exact budget.'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

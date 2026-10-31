/**
 * Budget math — deterministic arithmetic for budget allocation.
 *
 * The AI proposes percentage splits; this module converts them to exact
 * rupee amounts that always sum to exactly the user's total budget.
 * Rounding residuals are absorbed by the largest category to guarantee
 * the invariant: sum(amounts) === totalBudget.
 */

import type { BudgetAllocation, BudgetCategory } from '@/types';

interface PercentageAllocation {
  category: BudgetCategory;
  percentage: number;
  reasoning: string;
}

/**
 * Convert AI-provided percentage allocations into exact rupee amounts.
 *
 * Uses the "largest remainder" method to distribute rounding residuals
 * so the total is always exact.
 *
 * @param totalBudget - Total budget in INR (positive integer).
 * @param percentages - Array of {category, percentage, reasoning} from AI.
 *   Percentages must sum to ~100 (tolerance 0.01).
 * @returns Array of BudgetAllocation with exact rupee amounts.
 * @throws Error if percentages don't sum to ~100 or totalBudget <= 0.
 */
export function computeAllocations(
  totalBudget: number,
  percentages: PercentageAllocation[]
): BudgetAllocation[] {
  if (totalBudget <= 0) {
    throw new Error('Total budget must be positive');
  }

  const percentSum = percentages.reduce((s, p) => s + p.percentage, 0);
  if (Math.abs(percentSum - 100) > 0.01) {
    throw new Error(
      `Percentages must sum to 100, got ${percentSum.toFixed(4)}`
    );
  }

  // Compute raw (fractional) amounts
  const rawAmounts = percentages.map((p) => ({
    ...p,
    rawAmount: (p.percentage / 100) * totalBudget,
  }));

  // Floor each amount
  const floored = rawAmounts.map((r) => ({
    ...r,
    flooredAmount: Math.floor(r.rawAmount),
    remainder: r.rawAmount - Math.floor(r.rawAmount),
  }));

  // Distribute residual (totalBudget - sum of floors) to entries
  // with the largest remainders
  const currentSum = floored.reduce((s, f) => s + f.flooredAmount, 0);
  let residual = totalBudget - currentSum;

  // Sort indices by remainder descending
  const indices = floored
    .map((_, i) => i)
    .sort((a, b) => floored[b].remainder - floored[a].remainder);

  const finalAmounts = floored.map((f) => f.flooredAmount);
  for (const idx of indices) {
    if (residual <= 0) break;
    finalAmounts[idx] += 1;
    residual -= 1;
  }

  return percentages.map((p, i) => ({
    category: p.category,
    percentage: p.percentage,
    amount: finalAmounts[i],
    reasoning: p.reasoning,
    isManualOverride: false,
  }));
}

/**
 * Recalculate allocations after a user manually edits one category.
 *
 * The edited category keeps its new amount. The remaining budget is
 * distributed proportionally across the non-edited categories, preserving
 * their relative ratios.
 *
 * @param totalBudget - Total budget in INR.
 * @param allocations - Current allocations.
 * @param editedCategory - The category that was manually changed.
 * @param newAmount - The new amount for that category (clamped to 0–totalBudget).
 * @returns Updated allocations. The edited category is marked isManualOverride=true.
 */
export function recalcAfterManualEdit(
  totalBudget: number,
  allocations: BudgetAllocation[],
  editedCategory: BudgetCategory,
  newAmount: number
): BudgetAllocation[] {
  const clampedAmount = Math.max(0, Math.min(totalBudget, Math.round(newAmount)));

  const otherAllocations = allocations.filter(
    (a) => a.category !== editedCategory && !a.isManualOverride
  );
  const otherManualAllocations = allocations.filter(
    (a) => a.category !== editedCategory && a.isManualOverride
  );

  const manualTotal = otherManualAllocations.reduce((s, a) => s + a.amount, 0);
  const remaining = totalBudget - clampedAmount - manualTotal;

  // Proportionally distribute remaining among non-manual categories
  const otherPercentSum = otherAllocations.reduce((s, a) => s + a.percentage, 0);

  let newAllocations: BudgetAllocation[];

  if (otherPercentSum > 0 && remaining >= 0) {
    const rawOtherAmounts = otherAllocations.map((a) => ({
      ...a,
      rawAmount: (a.percentage / otherPercentSum) * remaining,
    }));

    const flooredOther = rawOtherAmounts.map((r) => ({
      ...r,
      flooredAmount: Math.floor(r.rawAmount),
      remainder: r.rawAmount - Math.floor(r.rawAmount),
    }));

    const otherSum = flooredOther.reduce((s, f) => s + f.flooredAmount, 0);
    let otherResidual = remaining - otherSum;

    const sortedIndices = flooredOther
      .map((_, i) => i)
      .sort((a, b) => flooredOther[b].remainder - flooredOther[a].remainder);

    const finalOtherAmounts = flooredOther.map((f) => f.flooredAmount);
    for (const idx of sortedIndices) {
      if (otherResidual <= 0) break;
      finalOtherAmounts[idx] += 1;
      otherResidual -= 1;
    }

    newAllocations = allocations.map((a) => {
      if (a.category === editedCategory) {
        return {
          ...a,
          amount: clampedAmount,
          percentage: (clampedAmount / totalBudget) * 100,
          isManualOverride: true,
        };
      }
      if (a.isManualOverride) {
        return a;
      }
      const otherIdx = otherAllocations.findIndex(
        (oa) => oa.category === a.category
      );
      if (otherIdx === -1) return a;
      const newAmt = finalOtherAmounts[otherIdx];
      return {
        ...a,
        amount: newAmt,
        percentage: (newAmt / totalBudget) * 100,
      };
    });
  } else {
    // Edge case: no room left or no other categories
    newAllocations = allocations.map((a) => {
      if (a.category === editedCategory) {
        return {
          ...a,
          amount: clampedAmount,
          percentage: (clampedAmount / totalBudget) * 100,
          isManualOverride: true,
        };
      }
      return a;
    });
  }

  return newAllocations;
}

/**
 * Check whether the allocations sum equals the total budget exactly.
 */
export function isBudgetBalanced(
  totalBudget: number,
  allocations: BudgetAllocation[]
): boolean {
  const sum = allocations.reduce((s, a) => s + a.amount, 0);
  return sum === totalBudget;
}

/**
 * Compute the overbudget or underbudget amount.
 * Positive = over budget, negative = under budget, 0 = balanced.
 */
export function budgetDifference(
  totalBudget: number,
  allocations: BudgetAllocation[]
): number {
  const sum = allocations.reduce((s, a) => s + a.amount, 0);
  return sum - totalBudget;
}

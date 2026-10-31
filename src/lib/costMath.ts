/**
 * Deterministic cost math for Quote X-Ray.
 *
 * CRITICAL RULE: All arithmetic is done strictly in code, never by the AI.
 * Computes:
 * - Variable Per-Guest Component = (perUnitPrice || 0) * guestCount
 * - Fixed Charges Component = fixedCharges + extraCharges
 * - Taxes Component = tax percentage applied to subtotal (if not already included)
 * - Ambiguity / Contingency Buffer for unpriced items ("as per actuals", "generator diesel extra", etc.)
 * - Transparent formula string
 * - Estimated cost range (min / max)
 */

import type { ExtractedQuote, TrueCostCalculation } from '@/types';
import { formatINR } from '@/lib/formatters';

/**
 * Calculates the deterministic True Cost of a vendor quote for a specific guest count.
 *
 * @param quote - The structured quote extracted from raw text
 * @param guestCount - Live guest count (e.g. from slider)
 * @returns Complete TrueCostCalculation with itemized components and formula
 */
export function calculateTrueCost(
  quote: ExtractedQuote,
  guestCount: number
): TrueCostCalculation {
  const safeGuests = Math.max(1, Math.min(5000, Math.round(guestCount)));

  // 1. Variable per-guest cost (e.g. caterer plates)
  const perUnitPrice = quote.perUnitPrice || 0;
  const perGuestComponent = Math.round(perUnitPrice * safeGuests);

  // 2. Fixed cost components (venue rent, stage decor base, sound setup, known extras)
  const baseFixed = quote.fixedCharges || 0;
  const extrasSum = (quote.extraCharges || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  const fixedComponent = Math.round(baseFixed + extrasSum);

  // Subtotal before tax
  const subtotal = perGuestComponent + fixedComponent;

  // 3. Taxes
  let taxesComponent = 0;
  if (quote.taxPercentage && quote.taxPercentage > 0 && !quote.taxIncludedInBase) {
    taxesComponent = Math.round((subtotal * quote.taxPercentage) / 100);
  } else if (quote.taxAmountStated && quote.taxAmountStated > 0 && !quote.taxIncludedInBase) {
    taxesComponent = Math.round(quote.taxAmountStated);
  }

  const totalTrueCost = subtotal + taxesComponent;

  // 4. Ambiguity / Contingency Buffer
  // If quote mentions unquantified extras ("generator fuel extra", "waitstaff tip extra"),
  // compute a reasonable 5%-15% buffer
  const hasAmbiguities = (quote.ambiguities && quote.ambiguities.length > 0) ||
                         (quote.potentialHiddenCosts && quote.potentialHiddenCosts.length > 0);

  const contingencyRate = hasAmbiguities ? 0.10 : 0.03; // 10% contingency if ambiguous, 3% baseline buffer
  const contingencyComponent = Math.round(totalTrueCost * contingencyRate);
  const totalCostWithContingency = totalTrueCost + contingencyComponent;

  // Transparent formula explanation
  const parts: string[] = [];
  if (perUnitPrice > 0) {
    parts.push(`(₹${perUnitPrice.toLocaleString('en-IN')}/head × ${safeGuests} guests = ${formatINR(perGuestComponent)})`);
  }
  if (fixedComponent > 0) {
    parts.push(`Fixed Charges (${formatINR(fixedComponent)})`);
  }
  if (taxesComponent > 0) {
    parts.push(`Taxes (${quote.taxPercentage ? `${quote.taxPercentage}% GST` : 'Stated'} = ${formatINR(taxesComponent)})`);
  }

  const formulaDescription = parts.length > 0 ? parts.join(' + ') : `${formatINR(totalTrueCost)} (Flat charge)`;

  // Realistic range estimation
  const minRange = totalTrueCost;
  const maxRange = Math.round(totalCostWithContingency * (hasAmbiguities ? 1.08 : 1.02));

  return {
    guestCount: safeGuests,
    perGuestComponent,
    fixedComponent,
    taxesComponent,
    contingencyComponent,
    totalTrueCost,
    totalCostWithContingency,
    formulaDescription,
    hasAmbiguities,
    estimatedCostRange: {
      min: minRange,
      max: maxRange,
    },
  };
}

/**
 * Calculates budget proportion and returns warning if category consumes excessive share.
 * Typical middle-class Indian wedding benchmarks:
 * - Catering: 25% - 40%
 * - Venue: 15% - 30%
 * - Decoration: 8% - 18%
 * - Photography: 6% - 15%
 */
export function checkBudgetSensibility(
  vendorType: string,
  totalCost: number,
  totalBudget: number
): {
  percentageOfBudget: number;
  isSensible: boolean;
  benchmarkRange: { min: number; max: number };
  warningMessage: string | null;
} {
  if (totalBudget <= 0) {
    return {
      percentageOfBudget: 0,
      isSensible: true,
      benchmarkRange: { min: 10, max: 35 },
      warningMessage: null,
    };
  }

  const percentage = Math.round((totalCost / totalBudget) * 100);

  const benchmarks: Record<string, { min: number; max: number; label: string }> = {
    caterer: { min: 25, max: 40, label: 'Catering' },
    venue: { min: 15, max: 30, label: 'Venue' },
    decorator: { min: 8, max: 18, label: 'Decoration' },
    photographer: { min: 6, max: 15, label: 'Photography' },
    other: { min: 5, max: 20, label: 'Vendor' },
  };

  const bm = benchmarks[vendorType] || benchmarks.other;

  let warningMessage: string | null = null;
  const isSensible = percentage <= bm.max + 5;

  if (percentage > bm.max + 5) {
    warningMessage = `This quote consumes ${percentage}% of your total budget, which significantly exceeds the typical ${bm.min}%–${bm.max}% benchmark for ${bm.label}.`;
  } else if (percentage > bm.max) {
    warningMessage = `At ${percentage}% of budget, this quote is on the higher side of typical ${bm.label} allocations (${bm.min}%–${bm.max}%).`;
  }

  return {
    percentageOfBudget: percentage,
    isSensible,
    benchmarkRange: { min: bm.min, max: bm.max },
    warningMessage,
  };
}

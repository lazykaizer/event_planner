/**
 * Deterministic rationale generator for comparing vendor quotes.
 * Strictly in code, zero AI calls.
 */

import type { QuoteAnalysisReport } from '@/types';
import { formatINR } from '@/lib/formatters';

export interface ComparisonRationaleResult {
  bestValueId: string | null;
  bestValueRationale: string | null;
  safestOptionId: string | null;
  safestRationale: string | null;
  combinedHighlight: string | null;
  isPriceTooClose: boolean;
  isRiskTooClose: boolean;
}

/**
 * Computes deterministic rationales for "Best Value" and "Safest Option"
 * across up to 3 analyzed quotes.
 */
export function computeComparisonRationales(
  reports: QuoteAnalysisReport[]
): ComparisonRationaleResult {
  if (!reports || reports.length < 2) {
    return {
      bestValueId: null,
      bestValueRationale: null,
      safestOptionId: null,
      safestRationale: null,
      combinedHighlight: null,
      isPriceTooClose: false,
      isRiskTooClose: false,
    };
  }

  // 1. BEST VALUE EVALUATION (lowest true cost)
  const sortedByCost = [...reports].sort(
    (a, b) => a.trueCost.totalTrueCost - b.trueCost.totalTrueCost
  );

  const lowest = sortedByCost[0];
  const secondLowest = sortedByCost[1];
  const costDiff = secondLowest.trueCost.totalTrueCost - lowest.trueCost.totalTrueCost;

  // If cost difference is within 1% or ₹500, consider it too close to call
  const isPriceTooClose = costDiff <= 500 || costDiff / secondLowest.trueCost.totalTrueCost < 0.01;

  let bestValueId: string | null = lowest.id;
  let bestValueRationale: string | null = null;

  if (isPriceTooClose) {
    bestValueRationale = `Price is too close to call between the top options (difference is only ${formatINR(costDiff)}). Compare deliverables and risk instead.`;
  } else {
    bestValueRationale = `Lowest true cost: ${formatINR(lowest.trueCost.totalTrueCost)}, which is ${formatINR(costDiff)} less than the next option (${secondLowest.extracted.vendorName}).`;
  }

  // 2. SAFEST OPTION EVALUATION (lowest risk score, lowest advance, written agreement, no high flags)
  // Scoring function (lower is safer):
  // high risk flag = +50 pts each
  // medium risk flag = +15 pts each
  // advancePercentage = +1 pt per %
  // no written agreement = +30 pts
  const getRiskScore = (r: QuoteAnalysisReport) => {
    const highFlags = r.redFlags.filter((f) => f.severity === 'high').length;
    const medFlags = r.redFlags.filter((f) => f.severity === 'medium').length;
    const advance = r.extracted.advancePercentage ?? 40;
    const agreementPenalty = r.extracted.writtenAgreementMentioned ? 0 : 30;
    return highFlags * 50 + medFlags * 15 + advance + agreementPenalty;
  };

  const sortedBySafety = [...reports].sort((a, b) => getRiskScore(a) - getRiskScore(b));
  const safest = sortedBySafety[0];
  const secondSafest = sortedBySafety[1];
  const scoreDiff = getRiskScore(secondSafest) - getRiskScore(safest);

  const isRiskTooClose = scoreDiff <= 3;
  let safestOptionId: string | null = safest.id;
  let safestRationale: string | null = null;

  if (isRiskTooClose) {
    safestRationale = `Safety terms are too close to call between ${safest.extracted.vendorName} and ${secondSafest.extracted.vendorName}. Verify refund policies in writing.`;
  } else {
    const parts: string[] = [];
    if (safest.extracted.advancePercentage !== null) {
      parts.push(`advance only ${safest.extracted.advancePercentage}%`);
    }
    if (safest.extracted.writtenAgreementMentioned) {
      parts.push('written agreement mentioned');
    }
    const highFlags = safest.redFlags.filter((f) => f.severity === 'high').length;
    if (highFlags === 0) {
      parts.push('no high-severity flags');
    } else {
      parts.push(`${highFlags} high-severity flag(s)`);
    }

    safestRationale = `Lowest risk: ${parts.join(', ')}.`;
  }

  // 3. COMBINED HIGHLIGHT (If the same quote wins both)
  let combinedHighlight: string | null = null;
  if (bestValueId === safestOptionId && !isPriceTooClose && !isRiskTooClose) {
    combinedHighlight = `🌟 Double Winner: ${safest.extracted.vendorName} is both the Best Value (${formatINR(lowest.trueCost.totalTrueCost)}) and the Safest Option. Highly recommended to negotiate on their terms.`;
  }

  return {
    bestValueId,
    bestValueRationale,
    safestOptionId,
    safestRationale,
    combinedHighlight,
    isPriceTooClose,
    isRiskTooClose,
  };
}

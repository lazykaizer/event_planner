/**
 * Vendor red-flag rules — deterministic, unit-tested checks.
 *
 * These rules run BEFORE the AI analysis. Each rule inspects the parsed
 * vendor quote and emits a flag if conditions are met. The AI then adds
 * contextual flags on top.
 */

import type { VendorQuoteParsed, VendorRedFlag, RiskLevel } from '@/types';

interface RedFlagRule {
  id: string;
  /** Check a parsed quote and return a flag if triggered, or null. */
  check: (quote: VendorQuoteParsed) => VendorRedFlag | null;
}

/** Typical price-per-plate range in INR for Indian events. */
const TYPICAL_PRICE_PER_PLATE = { min: 300, max: 3500 };

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'advance_above_50',
    check: (q) => {
      if (q.advancePercentage !== null && q.advancePercentage > 50) {
        return {
          ruleId: 'advance_above_50',
          severity: 'high',
          message: `Advance of ${q.advancePercentage}% is very high. Typically, 20–30% is standard. This increases your financial risk.`,
          source: 'rule',
        };
      }
      return null;
    },
  },
  {
    id: 'advance_above_30',
    check: (q) => {
      if (
        q.advancePercentage !== null &&
        q.advancePercentage > 30 &&
        q.advancePercentage <= 50
      ) {
        return {
          ruleId: 'advance_above_30',
          severity: 'medium',
          message: `Advance of ${q.advancePercentage}% is above the typical 20–25% range. Negotiate for a lower advance tied to milestones.`,
          source: 'rule',
        };
      }
      return null;
    },
  },
  {
    id: 'full_payment_before_event',
    check: (q) => {
      if (q.advancePercentage === 100) {
        return {
          ruleId: 'full_payment_before_event',
          severity: 'high',
          message:
            'Full payment before the event is a major risk. Always retain at least 20–30% as final payment after service delivery.',
          source: 'rule',
        };
      }
      return null;
    },
  },
  {
    id: 'no_written_agreement',
    check: (q) => {
      const text = [
        q.cancellationTerms,
        ...q.included,
        ...q.notIncluded,
        ...q.extraCharges,
      ]
        .join(' ')
        .toLowerCase();
      const hasAgreementMention =
        text.includes('contract') ||
        text.includes('agreement') ||
        text.includes('invoice') ||
        text.includes('receipt') ||
        text.includes('written');
      if (!hasAgreementMention) {
        return {
          ruleId: 'no_written_agreement',
          severity: 'medium',
          message:
            'No mention of a written agreement, contract, or invoice. Always insist on a detailed written agreement before paying.',
          source: 'rule',
        };
      }
      return null;
    },
  },
  {
    id: 'cash_only_payment',
    check: (q) => {
      const text = [
        q.cancellationTerms,
        ...q.extraCharges,
        ...q.included,
      ]
        .join(' ')
        .toLowerCase();
      const cashOnly =
        (text.includes('cash only') || text.includes('cash payment')) &&
        !text.includes('bank') &&
        !text.includes('cheque');
      const personalUpi =
        text.includes('personal upi') ||
        text.includes('personal account') ||
        text.includes('personal gpay');
      if (cashOnly || personalUpi) {
        return {
          ruleId: 'cash_only_payment',
          severity: 'medium',
          message:
            'Payment only by cash or to a personal UPI/account. Prefer bank transfers to a business account for a paper trail.',
          source: 'rule',
        };
      }
      return null;
    },
  },
  {
    id: 'hidden_venue_charges',
    check: (q) => {
      const allText = [
        ...q.included,
        ...q.notIncluded,
        ...q.extraCharges,
      ]
        .join(' ')
        .toLowerCase();
      const freeVenue =
        allText.includes('venue free') ||
        allText.includes('no venue charge') ||
        allText.includes('complimentary venue');
      const perHeadFee =
        allText.includes('per head') ||
        allText.includes('per plate') ||
        allText.includes('per person');
      if (freeVenue && perHeadFee) {
        return {
          ruleId: 'hidden_venue_charges',
          severity: 'medium',
          message:
            '"Free venue" combined with per-head/per-plate fees often means the venue cost is bundled into catering charges. Clarify the breakdown.',
          source: 'rule',
        };
      }
      return null;
    },
  },
  {
    id: 'no_cancellation_terms',
    check: (q) => {
      if (
        !q.cancellationTerms ||
        q.cancellationTerms.trim().length === 0 ||
        q.cancellationTerms.toLowerCase() === 'not mentioned' ||
        q.cancellationTerms.toLowerCase() === 'none' ||
        q.cancellationTerms.toLowerCase() === 'n/a'
      ) {
        return {
          ruleId: 'no_cancellation_terms',
          severity: 'medium',
          message:
            'No cancellation or refund terms mentioned. Clarify what happens if you need to cancel or if the vendor cancels.',
          source: 'rule',
        };
      }
      return null;
    },
  },
  {
    id: 'price_per_plate_outlier',
    check: (q) => {
      if (
        q.vendorType === 'caterer' &&
        q.pricePerUnit !== null &&
        (q.pricePerUnit < TYPICAL_PRICE_PER_PLATE.min ||
          q.pricePerUnit > TYPICAL_PRICE_PER_PLATE.max)
      ) {
        const direction =
          q.pricePerUnit < TYPICAL_PRICE_PER_PLATE.min ? 'below' : 'above';
        return {
          ruleId: 'price_per_plate_outlier',
          severity: 'low',
          message: `Price per plate (₹${q.pricePerUnit.toLocaleString('en-IN')}) is ${direction} the typical ₹${TYPICAL_PRICE_PER_PLATE.min}–₹${TYPICAL_PRICE_PER_PLATE.max} range. Verify menu quality and hidden extras.`,
          source: 'rule',
        };
      }
      return null;
    },
  },
];

/**
 * Run all deterministic red-flag rules against a parsed vendor quote.
 * @returns Array of triggered VendorRedFlag objects.
 */
export function checkRedFlags(quote: VendorQuoteParsed): VendorRedFlag[] {
  const flags: VendorRedFlag[] = [];
  for (const rule of RED_FLAG_RULES) {
    const flag = rule.check(quote);
    if (flag) {
      flags.push(flag);
    }
  }
  return flags;
}

/**
 * Determine the overall risk level from a list of flags.
 * If any flag is 'high', overall is 'high'. Otherwise if any is 'medium', it's 'medium'.
 */
export function computeOverallRisk(flags: VendorRedFlag[]): RiskLevel {
  if (flags.some((f) => f.severity === 'high')) return 'high';
  if (flags.some((f) => f.severity === 'medium')) return 'medium';
  return 'low';
}

/**
 * Generate a safer payment schedule suggestion.
 */
export function suggestPaymentSchedule(quote: VendorQuoteParsed): string[] {
  const schedule = [
    '20–25% advance at the time of booking (with a written agreement)',
    '25–30% after confirming menu/design details (2–4 weeks before event)',
    '25–30% on the day of setup or delivery',
    '15–20% final balance within 3 days after the event (only after satisfactory service)',
  ];

  if (quote.totalPrice && quote.totalPrice > 500000) {
    schedule.push(
      'For amounts above ₹5 lakh, consider staged payments with clear milestone sign-offs.'
    );
  }

  return schedule;
}

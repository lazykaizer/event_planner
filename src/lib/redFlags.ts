/**
 * Deterministic Red-Flag Rules for Quote X-Ray.
 *
 * Rules run BEFORE AI analysis. Each rule inspects the quote
 * data and flags known traps common in the Indian wedding and event vendor ecosystem.
 */

import type { ExtractedQuote, VendorQuoteParsed, RedFlag, RiskLevel } from '@/types';

type AnyQuote = ExtractedQuote | VendorQuoteParsed;

function isExtracted(q: AnyQuote): q is ExtractedQuote {
  return 'fixedCharges' in q;
}

export interface RedFlagRule {
  id: string;
  check: (quote: AnyQuote, rawText?: string) => RedFlag | null;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  // 1. Advance > 50% = High Risk
  {
    id: 'advance_above_50',
    check: (q) => {
      if (q.advancePercentage !== null && q.advancePercentage > 50 && q.advancePercentage < 100) {
        return {
          ruleId: 'advance_above_50',
          severity: 'high',
          title: 'Unusually High Advance Deposit (>50%)',
          message: `The vendor demands a ${q.advancePercentage}% deposit upfront. Market norm for wedding vendors is 20%–25%. Paying more than 50% leaves families with zero leverage if service is subpar.`,
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 2. Advance > 30% (and <= 50%) = Medium Risk
  {
    id: 'advance_above_30',
    check: (q) => {
      if (q.advancePercentage !== null && q.advancePercentage > 30 && q.advancePercentage <= 50) {
        return {
          ruleId: 'advance_above_30',
          severity: 'medium',
          title: 'Above-Average Advance Deposit (30%–50%)',
          message: `An advance of ${q.advancePercentage}% is higher than the standard 20%–25% booking deposit. Negotiate down to 20% upon signing, with subsequent payments tied to tangible milestones.`,
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 3. Full 100% Prepayment = High Risk
  {
    id: 'full_prepayment',
    check: (q) => {
      if (q.advancePercentage === 100) {
        return {
          ruleId: 'full_prepayment',
          severity: 'high',
          title: '100% Full Prepayment Demanded',
          message: 'The vendor requests 100% full payment before the celebration day. This is a severe red flag. Always retain at least 15%–20% payable 24–48 hours after satisfactory service completion.',
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 4. No Written Agreement Mentioned = Warning (Medium Risk)
  {
    id: 'no_written_agreement',
    check: (q) => {
      if (isExtracted(q)) {
        if (!q.writtenAgreementMentioned) {
          return {
            ruleId: 'no_written_agreement',
            severity: 'medium',
            title: 'No Service Agreement / GST Invoice',
            message: 'No formal written agreement or itemized contract was mentioned. Verbal WhatsApp promises frequently lead to disputes over promised quantities and staff coverage.',
            source: 'rule',
          };
        }
      } else {
        const text = [q.cancellationTerms, ...q.included, ...q.notIncluded, ...q.extraCharges].join(' ').toLowerCase();
        const hasAgreement = text.includes('contract') || text.includes('agreement') || text.includes('invoice') || text.includes('written');
        if (!hasAgreement) {
          return {
            ruleId: 'no_written_agreement',
            severity: 'medium',
            title: 'No Service Agreement / GST Invoice',
            message: 'No mention of a written agreement, contract, or invoice. Always insist on a detailed written agreement before paying.',
            source: 'rule',
          };
        }
      }
      return null;
    },
  },

  // 5. Cash or Personal UPI Only = Warning (Medium Risk)
  {
    id: 'cash_or_personal_upi',
    check: (q) => {
      const mode = (isExtracted(q) ? q.paymentMode : q.extraCharges.join(' ')).toLowerCase();
      const isCash = mode.includes('cash');
      const isPersonalUpi = mode.includes('personal') || mode.includes('sharma') || mode.includes('individual') || mode.includes('gpay');
      if (isCash || isPersonalUpi) {
        return {
          ruleId: 'cash_or_personal_upi',
          severity: 'medium',
          title: 'Cash or Personal UPI Payment Traps',
          message: 'The quote suggests cash payment or personal UPI transfers. This eliminates audit trails, chargeback protection, and GST invoice validity.',
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 6. "Free Venue" plus Per-Head Fees = Hidden-Charge Warning
  {
    id: 'free_venue_with_per_head',
    check: (q) => {
      const allIncluded = q.included.join(' ').toLowerCase();
      const hasFreeVenue = allIncluded.includes('free venue') || allIncluded.includes('venue free') || allIncluded.includes('complimentary hall');
      const unitType = (isExtracted(q) ? q.unitType : q.unitDescription).toLowerCase();
      const unitPrice = isExtracted(q) ? q.perUnitPrice : q.pricePerUnit;
      const hasPerHead = (unitPrice !== null && unitPrice !== undefined && unitPrice > 0) ||
                        unitType.includes('plate') || unitType.includes('head');

      if (hasFreeVenue && hasPerHead) {
        return {
          ruleId: 'free_venue_with_per_head',
          severity: 'medium',
          title: '"Free Venue" Marketing Trap',
          message: 'Offers of a "free lawn/banquet hall" tied to per-plate catering usually hide venue rental fees inside inflated food rates, and frequently slap extra charges for cleaning, generator, and air-conditioning.',
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 7. No Refund or Cancellation Terms = Warning (Medium Risk)
  {
    id: 'no_refund_terms',
    check: (q) => {
      const terms = (q.cancellationTerms || '').trim().toLowerCase();
      if (!terms || terms === 'not mentioned' || terms === 'none' || terms === 'n/a' || terms === 'no refund') {
        return {
          ruleId: 'no_refund_terms',
          severity: 'medium',
          title: 'Missing or Non-Refundable Cancellation Clause',
          message: terms === 'no refund'
            ? 'The vendor enforces a strict "No Refund" policy under any condition. If wedding dates shift, your entire deposit is forfeited.'
            : 'No clear cancellation policy stated. Always clarify refund percentages in writing for notice given 30 or 60 days before the event.',
          source: 'rule',
        };
      }
      return null;
    },
  },
];

/**
 * Runs all deterministic rules against an extracted quote.
 */
export function checkRedFlags(quote: AnyQuote, rawText?: string): RedFlag[] {
  const flags: RedFlag[] = [];
  for (const rule of RED_FLAG_RULES) {
    const flag = rule.check(quote, rawText);
    if (flag) {
      flags.push(flag);
    }
  }
  return flags;
}

/**
 * Determines overall risk score:
 */
export function computeOverallRisk(flags: RedFlag[]): RiskLevel {
  if (flags.some((f) => f.severity === 'high')) return 'high';
  if (flags.filter((f) => f.severity === 'medium').length >= 1) return 'medium';
  return 'low';
}

/**
 * Generates standard milestone-based payment schedule
 */
export function generateSafePaymentSchedule(quote: AnyQuote): string[] {
  return [
    '20%–25% advance upon signing a written, itemized service contract',
    '30% midway milestone (after menu tasting, decor 3D mock-up, or schedule confirmation)',
    '30% on the event morning / setup arrival at the venue',
    '15%–20% final settlement 24–48 hours AFTER the event (only upon full satisfaction and return of undamaged goods)',
  ];
}

export const suggestPaymentSchedule = generateSafePaymentSchedule;

/**
 * Generates essential "Get This in Writing" checklist
 */
export function generateInWritingChecklist(vendorType: string): string[] {
  const common = [
    'Official GST registered invoice with business PAN and registered address',
    'Clear milestone payment schedule with dates (never 100% upfront)',
    'Written cancellation and refund clause with notice timeframes',
    'Backup staffing and equipment replacement guarantee if primary team falls sick',
  ];

  const categorySpecific: Record<string, string[]> = {
    caterer: [
      'Guaranteed minimum plate count vs actual plate audit counter mechanism',
      'Leftover food policy (packed and handed to family in clean containers)',
      'Uniformed waitstaff count and supervisor ratio included',
      'Disposal, trash clearance, and cleaning responsibility at the venue',
    ],
    decorator: [
      'Fresh flower specifications (e.g. fresh Marigolds/Roses vs artificial silk flowers)',
      'Exact setup completion time (e.g. 4 hours before guest arrival)',
      'Generator and power backup responsibility for stage lighting and truss',
      'Breakage penalty terms explicitly stated',
    ],
    photographer: [
      'Exact deliverable counts (e.g. minimum 350 edited photos, 3-minute teaser, 30-minute film)',
      'Delivery deadline in writing (e.g. raw footage within 7 days, album in 45 days)',
      'Photographer seniority: guarantee of primary lead shooter vs junior interns',
      'Drone permission and drone pilot licensing',
    ],
    venue: [
      'AC operating hours and temperature guarantee',
      'Generator diesel fuel charges: inclusive or billed separately?',
      'Rooms provided with clean linens, working hot water, and key handovers',
      'Corkage, DJ royalty, and outside vendor entry fee policy',
    ],
  };

  return [...common, ...(categorySpecific[vendorType] || categorySpecific.caterer)];
}

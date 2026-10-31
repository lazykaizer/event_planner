import { describe, it, expect } from 'vitest';
import { checkRedFlags, computeOverallRisk } from '@/lib/redFlags';
import type { ExtractedQuote } from '@/types';

function createSampleQuote(overrides: Partial<ExtractedQuote> = {}): ExtractedQuote {
  return {
    vendorName: 'Standard Wedding Caterer',
    vendorType: 'caterer',
    perUnitPrice: 1000,
    unitType: 'per plate',
    baseGuests: 200,
    fixedCharges: 0,
    fixedChargesBreakdown: [],
    extraCharges: [],
    taxPercentage: 5,
    taxAmountStated: null,
    taxIncludedInBase: false,
    advanceRequested: 50000,
    advancePercentage: 25,
    cancellationTerms: '50% refund 30 days prior',
    paymentMode: 'Bank Transfer',
    writtenAgreementMentioned: true,
    included: ['Buffet'],
    notIncluded: [],
    ambiguities: [],
    potentialHiddenCosts: [],
    ...overrides,
  };
}

describe('Red Flag Rules for Quote X-Ray', () => {
  it('Rule 1: advance > 50% triggers High Risk', () => {
    const quote = createSampleQuote({ advancePercentage: 60 });
    const flags = checkRedFlags(quote);
    const flag = flags.find((f) => f.ruleId === 'advance_above_50');
    expect(flag).toBeDefined();
    expect(flag?.severity).toBe('high');
    expect(computeOverallRisk(flags)).toBe('high');
  });

  it('Rule 2: advance > 30% and <= 50% triggers Medium Risk', () => {
    const quote = createSampleQuote({ advancePercentage: 40 });
    const flags = checkRedFlags(quote);
    const flag = flags.find((f) => f.ruleId === 'advance_above_30');
    expect(flag).toBeDefined();
    expect(flag?.severity).toBe('medium');
    expect(computeOverallRisk(flags)).toBe('medium');
  });

  it('Normal advance (20-25%) does not trigger high/medium advance flags', () => {
    const quote = createSampleQuote({ advancePercentage: 20 });
    const flags = checkRedFlags(quote);
    expect(flags.find((f) => f.ruleId === 'advance_above_50')).toBeUndefined();
    expect(flags.find((f) => f.ruleId === 'advance_above_30')).toBeUndefined();
  });

  it('Rule 3: 100% full prepayment triggers High Risk', () => {
    const quote = createSampleQuote({ advancePercentage: 100 });
    const flags = checkRedFlags(quote);
    const flag = flags.find((f) => f.ruleId === 'full_prepayment');
    expect(flag).toBeDefined();
    expect(flag?.severity).toBe('high');
    expect(computeOverallRisk(flags)).toBe('high');
  });

  it('Rule 4: no written agreement mentioned triggers Warning', () => {
    const quote = createSampleQuote({ writtenAgreementMentioned: false });
    const flags = checkRedFlags(quote);
    const flag = flags.find((f) => f.ruleId === 'no_written_agreement');
    expect(flag).toBeDefined();
    expect(flag?.severity).toBe('medium');
  });

  it('Rule 5: cash or personal UPI only triggers Warning', () => {
    const quote = createSampleQuote({ paymentMode: 'Cash only preferred or GooglePay to personal number' });
    const flags = checkRedFlags(quote);
    const flag = flags.find((f) => f.ruleId === 'cash_or_personal_upi');
    expect(flag).toBeDefined();
    expect(flag?.severity).toBe('medium');
  });

  it('Rule 6: "free venue" claim with per-head catering fees triggers Hidden-Charge Warning', () => {
    const quote = createSampleQuote({
      included: ['Free Venue lawn included', 'Dinner buffet'],
      perUnitPrice: 1400,
      unitType: 'per plate',
    });
    const flags = checkRedFlags(quote);
    const flag = flags.find((f) => f.ruleId === 'free_venue_with_per_head');
    expect(flag).toBeDefined();
    expect(flag?.severity).toBe('medium');
  });

  it('Rule 7: no cancellation or refund terms mentioned triggers Warning', () => {
    const quote = createSampleQuote({ cancellationTerms: 'Not mentioned' });
    const flags = checkRedFlags(quote);
    const flag = flags.find((f) => f.ruleId === 'no_refund_terms');
    expect(flag).toBeDefined();
    expect(flag?.severity).toBe('medium');
  });

  it('Strict "No Refund" triggers Warning', () => {
    const quote = createSampleQuote({ cancellationTerms: 'No refund' });
    const flags = checkRedFlags(quote);
    const flag = flags.find((f) => f.ruleId === 'no_refund_terms');
    expect(flag).toBeDefined();
    expect(flag?.message).toContain('strict "No Refund" policy');
  });

  it('Safe quote with contract and low advance produces Low Risk', () => {
    const quote = createSampleQuote({
      advancePercentage: 20,
      writtenAgreementMentioned: true,
      paymentMode: 'Official Bank NEFT/RTGS',
      cancellationTerms: '75% refund if cancelled 45 days prior',
    });
    const flags = checkRedFlags(quote);
    expect(flags.length).toBe(0);
    expect(computeOverallRisk(flags)).toBe('low');
  });
});

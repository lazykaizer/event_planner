import { describe, it, expect } from 'vitest';
import { calculateTrueCost, checkBudgetSensibility } from '@/lib/costMath';
import type { ExtractedQuote } from '@/types';

function createSampleQuote(overrides: Partial<ExtractedQuote> = {}): ExtractedQuote {
  return {
    vendorName: 'Royal Swagath Caterers',
    vendorType: 'caterer',
    perUnitPrice: 1000,
    unitType: 'per plate',
    baseGuests: 250,
    fixedCharges: 20000,
    fixedChargesBreakdown: [{ name: 'Kitchen Setup', amount: 20000 }],
    extraCharges: [{ name: 'Generator Diesel', amount: 5000 }],
    taxPercentage: 5,
    taxAmountStated: null,
    taxIncludedInBase: false,
    advanceRequested: 100000,
    advancePercentage: 35,
    cancellationTerms: '50% refund 30 days prior',
    paymentMode: 'Bank Transfer',
    writtenAgreementMentioned: true,
    included: ['Dinner Buffet', 'Starters', 'Mocktails'],
    notIncluded: ['Waitstaff tipping'],
    ambiguities: [],
    potentialHiddenCosts: [],
    ...overrides,
  };
}

describe('Deterministic Cost Math', () => {
  it('calculates all-in true cost correctly: per-plate x guests + fixed + taxes', () => {
    const quote = createSampleQuote({
      perUnitPrice: 1000,
      fixedCharges: 20000,
      extraCharges: [{ name: 'Diesel', amount: 5000 }],
      taxPercentage: 5,
      taxIncludedInBase: false,
    });

    const guests = 200;
    const result = calculateTrueCost(quote, guests);

    // Expected:
    // perGuestComponent = 1000 * 200 = 200,000
    // fixedComponent = 20000 + 5000 = 25,000
    // subtotal = 225,000
    // taxes = 5% of 225,000 = 11,250
    // totalTrueCost = 236,250
    expect(result.perGuestComponent).toBe(200000);
    expect(result.fixedComponent).toBe(25000);
    expect(result.taxesComponent).toBe(11250);
    expect(result.totalTrueCost).toBe(236250);
    expect(result.formulaDescription).toContain('200 guests');
  });

  it('live guest slider recalculates dynamically without altering fixed costs', () => {
    const quote = createSampleQuote({
      perUnitPrice: 1200,
      fixedCharges: 50000,
      extraCharges: [],
      taxPercentage: null,
    });

    const at200 = calculateTrueCost(quote, 200);
    const at350 = calculateTrueCost(quote, 350);

    // Fixed charges stay identical
    expect(at200.fixedComponent).toBe(50000);
    expect(at350.fixedComponent).toBe(50000);

    // Variable scales strictly per head
    expect(at200.perGuestComponent).toBe(1200 * 200); // 240,000
    expect(at350.perGuestComponent).toBe(1200 * 350); // 420,000

    expect(at200.totalTrueCost).toBe(290000);
    expect(at350.totalTrueCost).toBe(470000);
  });

  it('handles quotes with flat charges and zero per-head rates (e.g. decorators)', () => {
    const quote = createSampleQuote({
      vendorType: 'decorator',
      perUnitPrice: null,
      unitType: 'flat package',
      fixedCharges: 150000,
      extraCharges: [{ name: 'Stage Truss', amount: 25000 }],
      taxPercentage: 18,
      taxIncludedInBase: false,
    });

    const result = calculateTrueCost(quote, 300);
    expect(result.perGuestComponent).toBe(0);
    expect(result.fixedComponent).toBe(175000);
    // 18% of 175,000 = 31,500
    expect(result.taxesComponent).toBe(31500);
    expect(result.totalTrueCost).toBe(206500);
  });

  it('does not double count tax if taxes are already included in base rate', () => {
    const quote = createSampleQuote({
      perUnitPrice: 1000,
      fixedCharges: 0,
      extraCharges: [],
      taxPercentage: 5,
      taxIncludedInBase: true,
    });

    const result = calculateTrueCost(quote, 100);
    expect(result.taxesComponent).toBe(0);
    expect(result.totalTrueCost).toBe(100000);
  });

  it('includes contingency buffer when ambiguities or hidden costs are detected', () => {
    const quote = createSampleQuote({
      ambiguities: ['generator fuel billed as per actuals meter'],
      potentialHiddenCosts: ['waitstaff overtime if sangeet exceeds 11pm'],
    });

    const result = calculateTrueCost(quote, 200);
    expect(result.hasAmbiguities).toBe(true);
    expect(result.contingencyComponent).toBeGreaterThan(0);
    expect(result.totalCostWithContingency).toBeGreaterThan(result.totalTrueCost);
  });
});

describe('Budget Sensibility Checker', () => {
  it('flags catering quote when consuming over 50% of total family budget', () => {
    const totalBudget = 1000000; // 10 Lakhs
    const cateringCost = 550000; // 55%
    const check = checkBudgetSensibility('caterer', cateringCost, totalBudget);

    expect(check.percentageOfBudget).toBe(55);
    expect(check.isSensible).toBe(false);
    expect(check.warningMessage).toContain('exceeds the typical 25%–40% benchmark');
  });

  it('approves sensible quote within reasonable benchmark', () => {
    const totalBudget = 1000000; // 10 Lakhs
    const decorCost = 120000;    // 12%
    const check = checkBudgetSensibility('decorator', decorCost, totalBudget);

    expect(check.percentageOfBudget).toBe(12);
    expect(check.isSensible).toBe(true);
    expect(check.warningMessage).toBeNull();
  });
});

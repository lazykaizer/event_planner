import { describe, it, expect } from 'vitest';
import { computeComparisonRationales } from '@/lib/compareRationale';
import type { QuoteAnalysisReport } from '@/types';

function createMockReport(overrides: {
  id: string;
  vendorName: string;
  totalTrueCost: number;
  advancePercentage: number | null;
  writtenAgreementMentioned: boolean;
  redFlagsCount?: number;
}): QuoteAnalysisReport {
  return {
    id: overrides.id,
    createdAt: new Date().toISOString(),
    rawQuoteText: 'Sample raw quote text',
    selectedVendorType: 'caterer',
    guestCount: 200,
    extracted: {
      vendorName: overrides.vendorName,
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
      advanceRequested: null,
      advancePercentage: overrides.advancePercentage,
      cancellationTerms: 'standard',
      paymentMode: 'Bank Transfer',
      writtenAgreementMentioned: overrides.writtenAgreementMentioned,
      included: [],
      notIncluded: [],
      ambiguities: [],
      potentialHiddenCosts: [],
    },
    trueCost: {
      guestCount: 200,
      perGuestComponent: overrides.totalTrueCost,
      fixedComponent: 0,
      taxesComponent: 0,
      contingencyComponent: 0,
      totalTrueCost: overrides.totalTrueCost,
      totalCostWithContingency: overrides.totalTrueCost,
      formulaDescription: 'Mock formula',
      hasAmbiguities: false,
      estimatedCostRange: { min: overrides.totalTrueCost, max: overrides.totalTrueCost },
    },
    redFlags: Array.from({ length: overrides.redFlagsCount || 0 }, (_, i) => ({
      ruleId: `flag_${i}`,
      severity: 'medium',
      title: 'Mock Flag',
      message: 'Mock warning message',
      source: 'rule',
    })),
    overallRisk: overrides.redFlagsCount ? 'medium' : 'low',
    saferPaymentPlan: [],
    getInWritingChecklist: [],
    questionsToAsk: [],
    whatsappNegotiationMessage: {
      english: 'msg',
      hinglish: 'msg',
      hindi: 'msg',
    },
  };
}

describe('Deterministic Compare View Rationales', () => {
  it('returns null values when fewer than 2 quotes are provided', () => {
    const report1 = createMockReport({
      id: '1',
      vendorName: 'Vendor A',
      totalTrueCost: 100000,
      advancePercentage: 20,
      writtenAgreementMentioned: true,
    });
    const result = computeComparisonRationales([report1]);
    expect(result.bestValueId).toBeNull();
    expect(result.bestValueRationale).toBeNull();
    expect(result.safestOptionId).toBeNull();
  });

  it('correctly explains why the cheapest quote is Best Value', () => {
    const report1 = createMockReport({
      id: '1',
      vendorName: 'Royal Sweets',
      totalTrueCost: 200000,
      advancePercentage: 40,
      writtenAgreementMentioned: false,
    });
    const report2 = createMockReport({
      id: '2',
      vendorName: 'Grand Feast',
      totalTrueCost: 250000,
      advancePercentage: 20,
      writtenAgreementMentioned: true,
    });

    const result = computeComparisonRationales([report1, report2]);
    expect(result.bestValueId).toBe('1');
    expect(result.bestValueRationale).toContain('Lowest true cost: ₹2,00,000');
    expect(result.bestValueRationale).toContain('₹50,000 less than the next option (Grand Feast)');
  });

  it('correctly explains why a quote is the Safest Option', () => {
    const report1 = createMockReport({
      id: '1',
      vendorName: 'Risky Caterer',
      totalTrueCost: 180000,
      advancePercentage: 60,
      writtenAgreementMentioned: false,
      redFlagsCount: 3,
    });
    const report2 = createMockReport({
      id: '2',
      vendorName: 'Safe Caterer',
      totalTrueCost: 220000,
      advancePercentage: 20,
      writtenAgreementMentioned: true,
      redFlagsCount: 0,
    });

    const result = computeComparisonRationales([report1, report2]);
    expect(result.safestOptionId).toBe('2');
    expect(result.safestRationale).toContain('advance only 20%');
    expect(result.safestRationale).toContain('written agreement mentioned');
    expect(result.safestRationale).toContain('no high-severity flags');
  });

  it('identifies a Double Winner when the same quote is both Best Value and Safest', () => {
    const report1 = createMockReport({
      id: '1',
      vendorName: 'Perfect Caterer',
      totalTrueCost: 150000,
      advancePercentage: 20,
      writtenAgreementMentioned: true,
      redFlagsCount: 0,
    });
    const report2 = createMockReport({
      id: '2',
      vendorName: 'Expensive Risky Caterer',
      totalTrueCost: 240000,
      advancePercentage: 50,
      writtenAgreementMentioned: false,
      redFlagsCount: 2,
    });

    const result = computeComparisonRationales([report1, report2]);
    expect(result.bestValueId).toBe('1');
    expect(result.safestOptionId).toBe('1');
    expect(result.combinedHighlight).toContain('Double Winner');
    expect(result.combinedHighlight).toContain('Perfect Caterer is both the Best Value');
  });

  it('honestly states when quotes are too close to call on price', () => {
    const report1 = createMockReport({
      id: '1',
      vendorName: 'Caterer A',
      totalTrueCost: 200000,
      advancePercentage: 30,
      writtenAgreementMentioned: true,
    });
    const report2 = createMockReport({
      id: '2',
      vendorName: 'Caterer B',
      totalTrueCost: 200300,
      advancePercentage: 30,
      writtenAgreementMentioned: true,
    });

    const result = computeComparisonRationales([report1, report2]);
    expect(result.isPriceTooClose).toBe(true);
    expect(result.bestValueRationale).toContain('too close to call');
  });
});

/**
 * Tests for vendor red-flag rules.
 *
 * Each rule is tested in isolation to verify it triggers correctly
 * and with the right severity level.
 */

import { describe, it, expect } from 'vitest';
import { checkRedFlags, computeOverallRisk } from '@/lib/redFlags';
import type { VendorQuoteParsed } from '@/types';

/** Minimal valid quote for testing. Override specific fields per test. */
function makeQuote(overrides: Partial<VendorQuoteParsed> = {}): VendorQuoteParsed {
  return {
    vendorName: 'Test Vendor',
    vendorType: 'caterer',
    totalPrice: 200000,
    pricePerUnit: 800,
    unitDescription: 'per plate',
    included: ['welcome drinks', 'main course'],
    notIncluded: ['live counters'],
    guestsCovered: 200,
    extraCharges: [],
    advanceRequested: 40000,
    advancePercentage: 20,
    cancellationTerms: 'Full refund if cancelled 30 days before',
    missingInfo: [],
    ...overrides,
  };
}

describe('Red Flag Rules', () => {
  describe('advance_above_50', () => {
    it('triggers high risk for 60% advance', () => {
      const flags = checkRedFlags(makeQuote({ advancePercentage: 60 }));
      const flag = flags.find((f) => f.ruleId === 'advance_above_50');
      expect(flag).toBeDefined();
      expect(flag?.severity).toBe('high');
    });

    it('does not trigger for 30% advance', () => {
      const flags = checkRedFlags(makeQuote({ advancePercentage: 30 }));
      expect(flags.find((f) => f.ruleId === 'advance_above_50')).toBeUndefined();
    });
  });

  describe('advance_above_30', () => {
    it('triggers medium risk for 40% advance', () => {
      const flags = checkRedFlags(makeQuote({ advancePercentage: 40 }));
      const flag = flags.find((f) => f.ruleId === 'advance_above_30');
      expect(flag).toBeDefined();
      expect(flag?.severity).toBe('medium');
    });

    it('does not trigger for 25% advance', () => {
      const flags = checkRedFlags(makeQuote({ advancePercentage: 25 }));
      expect(flags.find((f) => f.ruleId === 'advance_above_30')).toBeUndefined();
    });
  });

  describe('full_payment_before_event', () => {
    it('triggers high risk for 100% advance', () => {
      const flags = checkRedFlags(makeQuote({ advancePercentage: 100 }));
      const flag = flags.find((f) => f.ruleId === 'full_payment_before_event');
      expect(flag).toBeDefined();
      expect(flag?.severity).toBe('high');
    });
  });

  describe('no_written_agreement', () => {
    it('triggers when no contract/agreement/invoice mentioned', () => {
      const flags = checkRedFlags(
        makeQuote({
          cancellationTerms: 'no refund',
          included: ['food only'],
          notIncluded: [],
          extraCharges: [],
        })
      );
      const flag = flags.find((f) => f.ruleId === 'no_written_agreement');
      expect(flag).toBeDefined();
      expect(flag?.severity).toBe('medium');
    });

    it('does not trigger when contract is mentioned', () => {
      const flags = checkRedFlags(
        makeQuote({
          cancellationTerms: 'As per contract terms, 50% refund',
        })
      );
      expect(flags.find((f) => f.ruleId === 'no_written_agreement')).toBeUndefined();
    });
  });

  describe('cash_only_payment', () => {
    it('triggers for cash only payments', () => {
      const flags = checkRedFlags(
        makeQuote({
          extraCharges: ['cash only payment accepted'],
        })
      );
      const flag = flags.find((f) => f.ruleId === 'cash_only_payment');
      expect(flag).toBeDefined();
      expect(flag?.severity).toBe('medium');
    });

    it('triggers for personal UPI', () => {
      const flags = checkRedFlags(
        makeQuote({
          extraCharges: ['pay to personal UPI only'],
        })
      );
      const flag = flags.find((f) => f.ruleId === 'cash_only_payment');
      expect(flag).toBeDefined();
    });
  });

  describe('hidden_venue_charges', () => {
    it('triggers when venue is free but per-head fees exist', () => {
      const flags = checkRedFlags(
        makeQuote({
          included: ['venue free', 'per plate charge ₹800'],
        })
      );
      const flag = flags.find((f) => f.ruleId === 'hidden_venue_charges');
      expect(flag).toBeDefined();
      expect(flag?.severity).toBe('medium');
    });
  });

  describe('no_cancellation_terms', () => {
    it('triggers for empty cancellation terms', () => {
      const flags = checkRedFlags(makeQuote({ cancellationTerms: '' }));
      const flag = flags.find((f) => f.ruleId === 'no_cancellation_terms');
      expect(flag).toBeDefined();
    });

    it('triggers for "not mentioned"', () => {
      const flags = checkRedFlags(makeQuote({ cancellationTerms: 'Not mentioned' }));
      const flag = flags.find((f) => f.ruleId === 'no_cancellation_terms');
      expect(flag).toBeDefined();
    });

    it('does not trigger for actual terms', () => {
      const flags = checkRedFlags(
        makeQuote({ cancellationTerms: '50% refund if cancelled 15 days before' })
      );
      expect(flags.find((f) => f.ruleId === 'no_cancellation_terms')).toBeUndefined();
    });
  });

  describe('price_per_plate_outlier', () => {
    it('triggers for very low price per plate (caterer)', () => {
      const flags = checkRedFlags(makeQuote({ pricePerUnit: 100, vendorType: 'caterer' }));
      const flag = flags.find((f) => f.ruleId === 'price_per_plate_outlier');
      expect(flag).toBeDefined();
      expect(flag?.severity).toBe('low');
    });

    it('triggers for very high price per plate (caterer)', () => {
      const flags = checkRedFlags(makeQuote({ pricePerUnit: 5000, vendorType: 'caterer' }));
      const flag = flags.find((f) => f.ruleId === 'price_per_plate_outlier');
      expect(flag).toBeDefined();
    });

    it('does not trigger for non-caterer vendors', () => {
      const flags = checkRedFlags(
        makeQuote({ pricePerUnit: 100, vendorType: 'decorator' })
      );
      expect(flags.find((f) => f.ruleId === 'price_per_plate_outlier')).toBeUndefined();
    });

    it('does not trigger for normal price range', () => {
      const flags = checkRedFlags(makeQuote({ pricePerUnit: 800 }));
      expect(flags.find((f) => f.ruleId === 'price_per_plate_outlier')).toBeUndefined();
    });
  });
});

describe('computeOverallRisk', () => {
  it('returns high if any flag is high', () => {
    expect(
      computeOverallRisk([
        { ruleId: 'a', severity: 'low', message: '', source: 'rule' },
        { ruleId: 'b', severity: 'high', message: '', source: 'rule' },
      ])
    ).toBe('high');
  });

  it('returns medium if no high but has medium', () => {
    expect(
      computeOverallRisk([
        { ruleId: 'a', severity: 'low', message: '', source: 'rule' },
        { ruleId: 'b', severity: 'medium', message: '', source: 'rule' },
      ])
    ).toBe('medium');
  });

  it('returns low if all are low', () => {
    expect(
      computeOverallRisk([
        { ruleId: 'a', severity: 'low', message: '', source: 'rule' },
      ])
    ).toBe('low');
  });

  it('returns low for empty array', () => {
    expect(computeOverallRisk([])).toBe('low');
  });
});

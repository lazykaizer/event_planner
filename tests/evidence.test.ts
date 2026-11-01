import { describe, it, expect } from 'vitest';
import {
  verifyEvidence,
  verifyAllEvidence,
  UNVERIFIED_EVIDENCE,
} from '@/lib/evidence';

describe('Evidence Snippets Verification (verifyEvidence & verifyAllEvidence)', () => {
  const sampleQuote = `
    Namaste Sharma ji, yeh Royal Swagath Caterers ka estimate hai.
    Plate 1150 padega per head 250 guests ke liye.
    Kitchen setup and buffet counter charges ₹15,000 fixed.
    Generator fuel ₹5000 extra as per actuals.
    5% GST extra lagega.
    50% advance booking ke time chahiye via Bank Transfer or UPI.
    Cancellation policy: No refund within 15 days of event.
  `;

  it('1. verifies exact matching snippet', () => {
    const res = verifyEvidence('Plate 1150 padega', sampleQuote);
    expect(res.verified).toBe(true);
    expect(res.snippet).toBe('Plate 1150 padega');
  });

  it('2. verifies case-insensitive snippet match', () => {
    const res = verifyEvidence('plate 1150 PADEGA', sampleQuote);
    expect(res.verified).toBe(true);
    expect(res.snippet).toBe('plate 1150 PADEGA');
  });

  it('3. trims snippet and succeeds if contained in quote', () => {
    const res = verifyEvidence('   5% GST extra lagega   ', sampleQuote);
    expect(res.verified).toBe(true);
    expect(res.snippet).toBe('5% GST extra lagega');
  });

  it('4. marks snippet unverified when not present in the quote', () => {
    const res = verifyEvidence('18% GST included', sampleQuote);
    expect(res.verified).toBe(false);
    expect(res.snippet).toBe(UNVERIFIED_EVIDENCE);
  });

  it('5. handles null, undefined, or empty snippet safely', () => {
    expect(verifyEvidence(null, sampleQuote)).toEqual({
      verified: false,
      snippet: UNVERIFIED_EVIDENCE,
    });
    expect(verifyEvidence(undefined, sampleQuote)).toEqual({
      verified: false,
      snippet: UNVERIFIED_EVIDENCE,
    });
    expect(verifyEvidence('   ', sampleQuote)).toEqual({
      verified: false,
      snippet: UNVERIFIED_EVIDENCE,
    });
  });

  it('6. returns unverified when quote text is empty', () => {
    const res = verifyEvidence('Plate 1150', '');
    expect(res.verified).toBe(false);
    expect(res.snippet).toBe(UNVERIFIED_EVIDENCE);
  });

  it('7. verifyAllEvidence verifies all 6 key quote fields', () => {
    const rawEvidence = {
      perUnitPrice: 'Plate 1150 padega',
      fixedCharges: 'Kitchen setup and buffet counter charges ₹15,000 fixed',
      advance: '50% advance booking ke time',
      taxes: '5% GST extra',
      paymentMode: 'Bank Transfer',
      cancellationTerms: 'Fake terms not in quote text',
    };

    const results = verifyAllEvidence(rawEvidence, sampleQuote);

    expect(results.perUnitPrice?.verified).toBe(true);
    expect(results.fixedCharges?.verified).toBe(true);
    expect(results.advance?.verified).toBe(true);
    expect(results.taxes?.verified).toBe(true);
    expect(results.paymentMode?.verified).toBe(true);

    // Fake cancellation terms should fail verification
    expect(results.cancellationTerms?.verified).toBe(false);
    expect(results.cancellationTerms?.snippet).toBe(UNVERIFIED_EVIDENCE);
  });
});

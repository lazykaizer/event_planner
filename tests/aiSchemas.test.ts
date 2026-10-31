import { describe, it, expect } from 'vitest';
import { AIQuoteExtractionSchema } from '@/lib/schemas';

describe('AIQuoteExtractionSchema Validation', () => {
  const validAIResponse = {
    vendorName: 'Royal Swagath Caterers',
    vendorType: 'caterer',
    perUnitPrice: 1100,
    unitType: 'per plate',
    baseGuests: 250,
    fixedCharges: 15000,
    fixedChargesBreakdown: [{ name: 'Kitchen Setup', amount: 15000 }],
    extraCharges: [{ name: 'Generator Diesel', amount: 6000 }],
    taxPercentage: 5,
    taxAmountStated: null,
    taxIncludedInBase: false,
    advanceRequested: 100000,
    advancePercentage: 35,
    cancellationTerms: '50% forfeit on cancellation',
    paymentMode: 'Cash only preferred',
    writtenAgreementMentioned: false,
    included: ['Welcome Drinks', 'Dinner Buffet', 'Desserts'],
    notIncluded: ['Waitstaff tipping', 'Live Chaat counter'],
    ambiguities: ['Diesel billed as per actuals meter'],
    potentialHiddenCosts: ['Crockery breakage deposit', 'Extra hours surcharge'],
    aiFlags: [
      {
        severity: 'high',
        title: 'Cash Only Request',
        message: 'Paying in cash prevents tax invoices and legal proof of payment.',
      },
    ],
    whatsappMessages: {
      english: 'Dear Vendor, thank you for sharing the estimate...',
      hinglish: 'Namaste ji, quote bhejne ke liye shukriya...',
      hindi: 'नमस्ते जी, कोटेशन साझा करने के लिए धन्यवाद...',
    },
  };

  it('accepts comprehensive valid AI extraction response', () => {
    const result = AIQuoteExtractionSchema.safeParse(validAIResponse);
    expect(result.success).toBe(true);
  });

  it('rejects AI response missing required whatsapp negotiation messages', () => {
    const invalid = {
      ...validAIResponse,
      whatsappMessages: {
        english: 'Hello',
        // missing hinglish and hindi
      },
    };
    const result = AIQuoteExtractionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid vendor type in AI response', () => {
    const invalid = {
      ...validAIResponse,
      vendorType: 'dj_sound',
    };
    const result = AIQuoteExtractionSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('gracefully applies defaults for optional arrays if empty', () => {
    const minimal = {
      vendorName: 'Simple Decorator',
      vendorType: 'decorator',
      perUnitPrice: null,
      unitType: 'flat',
      baseGuests: null,
      fixedCharges: 50000,
      taxPercentage: null,
      taxAmountStated: null,
      advanceRequested: null,
      advancePercentage: null,
      whatsappMessages: {
        english: 'Msg in English',
        hinglish: 'Msg in Hinglish',
        hindi: 'Msg in Hindi',
      },
    };
    const result = AIQuoteExtractionSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.included).toEqual([]);
      expect(result.data.notIncluded).toEqual([]);
      expect(result.data.ambiguities).toEqual([]);
    }
  });
});

import type { ExtractedQuote } from '@/types';
import { calculateTrueCost } from '@/lib/costMath';
import { checkRedFlags, computeOverallRisk } from '@/lib/redFlags';

export const SAMPLE_LANDING_QUOTE_TEXT = `Namaste Sharma ji, catering estimate for wedding:
Per plate ₹1200 padega (Veg + Non-Veg buffet).
Kitchen setup and service counter ₹20,000 fixed charge.
AC Generator diesel ₹6000 extra as per actuals.
GST 5% extra on total bill.
Advance 60% booking time pe cash or UPI payment chahiye.
No refund on cancellation.`;

export const SAMPLE_LANDING_EXTRACTED: ExtractedQuote = {
  vendorName: 'Royal Swagath Caterers',
  vendorType: 'caterer',
  perUnitPrice: 1200,
  unitType: 'per plate',
  baseGuests: 250,
  fixedCharges: 20000,
  fixedChargesBreakdown: [{ name: 'Kitchen Setup & Counter', amount: 20000 }],
  extraCharges: [{ name: 'Generator Diesel', amount: 6000 }],
  taxPercentage: 5,
  taxAmountStated: null,
  taxIncludedInBase: false,
  advanceRequested: 198000,
  advancePercentage: 60,
  cancellationTerms: 'No refund on cancellation',
  paymentMode: 'Cash or UPI',
  writtenAgreementMentioned: false,
  included: ['Veg + Non-Veg Buffet', 'Welcome Drinks', 'Desserts Counter'],
  notIncluded: ['Waitstaff tipping', 'Live Tawa Counter'],
  ambiguities: ['AC Generator diesel extra as per actuals'],
  potentialHiddenCosts: [
    'Generator diesel consumption meters',
    'Overtime charges past 11pm',
    'Waitstaff service bakhshish',
  ],
  aiFlags: [],
  whatsappMessages: {
    english: 'Dear Sharma Ji, thank you for sharing the estimate...',
    hinglish: 'Namaste ji, quote bhejne ke liye shukriya...',
    hindi: 'नमस्ते जी, कोटेशन साझा करने के लिए धन्यवाद...',
  },
  evidence: {
    perUnitPrice: 'Per plate ₹1200 padega',
    fixedCharges: 'Kitchen setup and service counter ₹20,000 fixed',
    advance: 'Advance 60% booking time pe',
    taxes: 'GST 5% extra',
    paymentMode: 'cash or UPI payment',
    cancellationTerms: 'No refund on cancellation',
  },
};

/**
 * Computes deterministic true cost and red flags for the sample landing quote at any guest count.
 */
export function getLandingDemoCalculation(guestCount: number) {
  const trueCost = calculateTrueCost(SAMPLE_LANDING_EXTRACTED, guestCount);
  const redFlags = checkRedFlags(SAMPLE_LANDING_EXTRACTED, SAMPLE_LANDING_QUOTE_TEXT);
  const overallRisk = computeOverallRisk(redFlags);

  return {
    quote: SAMPLE_LANDING_EXTRACTED,
    rawText: SAMPLE_LANDING_QUOTE_TEXT,
    trueCost,
    redFlags,
    overallRisk,
  };
}

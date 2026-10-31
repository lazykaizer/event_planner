import { describe, it, expect } from 'vitest';
import { XRayRequestSchema } from '@/lib/schemas';

describe('XRayRequestSchema Validation', () => {
  const validRequest = {
    quoteText: 'Shree Ganesh Caterers: Grand Wedding Package for 250 guests at ₹1,100 per plate with welcome drinks.',
    vendorType: 'caterer',
    guestCount: 250,
    totalBudget: 1000000,
    language: 'en',
  };

  it('accepts valid quote request', () => {
    const result = XRayRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('rejects quote text under 20 characters', () => {
    const result = XRayRequestSchema.safeParse({
      ...validRequest,
      quoteText: 'Too short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects quote text exceeding 8,000 characters', () => {
    const result = XRayRequestSchema.safeParse({
      ...validRequest,
      quoteText: 'A'.repeat(8001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects guest count of 0', () => {
    const result = XRayRequestSchema.safeParse({
      ...validRequest,
      guestCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects guest count over 5000', () => {
    const result = XRayRequestSchema.safeParse({
      ...validRequest,
      guestCount: 5001,
    });
    expect(result.success).toBe(false);
  });

  it('strips unsafe HTML tags from raw input', () => {
    const result = XRayRequestSchema.safeParse({
      ...validRequest,
      quoteText: '<script>alert("hack")</script>Catering quote with 250 guests at 1100 per plate with sweet counter.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quoteText).not.toContain('<script>');
    }
  });

  it('rejects invalid vendor type', () => {
    const result = XRayRequestSchema.safeParse({
      ...validRequest,
      vendorType: 'magician',
    });
    expect(result.success).toBe(false);
  });

  it('defaults language to en if unspecified', () => {
    const { language, ...rest } = validRequest;
    const result = XRayRequestSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe('en');
    }
  });
});

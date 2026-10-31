/**
 * Tests for input validation schemas.
 */

import { describe, it, expect } from 'vitest';
import { IntakeRequestSchema, VendorQuoteRequestSchema } from '@/lib/schemas';

describe('IntakeRequestSchema', () => {
  const validInput = {
    occasion: 'wedding',
    budget: 800000,
    guestCount: 200,
    city: 'Mumbai',
    eventDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    style: 'traditional',
    priorities: ['food', 'venue', 'photography'],
    mustHaves: 'Live band',
    culturalNotes: 'North Indian wedding',
    language: 'en',
  };

  it('accepts valid input', () => {
    const result = IntakeRequestSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects zero budget', () => {
    const result = IntakeRequestSchema.safeParse({ ...validInput, budget: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative budget', () => {
    const result = IntakeRequestSchema.safeParse({ ...validInput, budget: -1000 });
    expect(result.success).toBe(false);
  });

  it('rejects guest count of 0', () => {
    const result = IntakeRequestSchema.safeParse({ ...validInput, guestCount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects guest count above 5000', () => {
    const result = IntakeRequestSchema.safeParse({ ...validInput, guestCount: 5001 });
    expect(result.success).toBe(false);
  });

  it('rejects past date', () => {
    const result = IntakeRequestSchema.safeParse({
      ...validInput,
      eventDate: '2020-01-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty city', () => {
    const result = IntakeRequestSchema.safeParse({ ...validInput, city: '' });
    expect(result.success).toBe(false);
  });

  it('rejects city over 100 chars', () => {
    const result = IntakeRequestSchema.safeParse({
      ...validInput,
      city: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it('strips HTML from city', () => {
    const result = IntakeRequestSchema.safeParse({
      ...validInput,
      city: '<script>alert("xss")</script>Mumbai',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.city).toBe('alert("xss")Mumbai');
    }
  });

  it('rejects empty priorities', () => {
    const result = IntakeRequestSchema.safeParse({ ...validInput, priorities: [] });
    expect(result.success).toBe(false);
  });

  it('rejects invalid occasion type', () => {
    const result = IntakeRequestSchema.safeParse({
      ...validInput,
      occasion: 'concert',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mustHaves over 2000 chars', () => {
    const result = IntakeRequestSchema.safeParse({
      ...validInput,
      mustHaves: 'A'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('defaults language to en', () => {
    const { language, ...rest } = validInput;
    const result = IntakeRequestSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe('en');
    }
  });
});

describe('VendorQuoteRequestSchema', () => {
  it('rejects quotes with text over 8000 chars', () => {
    const result = VendorQuoteRequestSchema.safeParse({
      quotes: [{ text: 'A'.repeat(8001) }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty quotes array', () => {
    const result = VendorQuoteRequestSchema.safeParse({ quotes: [] });
    expect(result.success).toBe(false);
  });

  it('rejects more than 5 quotes', () => {
    const quotes = Array(6).fill({ text: 'Some quote text' });
    const result = VendorQuoteRequestSchema.safeParse({ quotes });
    expect(result.success).toBe(false);
  });

  it('accepts valid vendor quote', () => {
    const result = VendorQuoteRequestSchema.safeParse({
      quotes: [{ text: 'Catering quote for 200 guests at ₹800 per plate', vendorType: 'caterer' }],
    });
    expect(result.success).toBe(true);
  });
});

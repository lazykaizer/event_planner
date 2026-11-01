import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/xray/route';
import { checkRateLimit } from '@/lib/rateLimit';

const mockCallGeminiJSON = vi.fn();

vi.mock('@/lib/gemini', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/gemini')>();
  return {
    ...actual,
    callGeminiJSON: vi.fn(async (...args: any[]) => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
        throw new Error(
          'AI service is not configured. Please check server environment settings.'
        );
      }
      return mockCallGeminiJSON(...args);
    }),
  };
});

const VALID_MOCK_AI_EXTRACTION = {
  vendorName: 'Royal Swagath Caterers',
  vendorType: 'caterer',
  perUnitPrice: 1150,
  unitType: 'per plate',
  baseGuests: 250,
  fixedCharges: 15000,
  fixedChargesBreakdown: [{ name: 'Kitchen Setup', amount: 15000 }],
  extraCharges: [{ name: 'Generator Fuel', amount: 5000 }],
  taxPercentage: 5,
  taxAmountStated: null,
  taxIncludedInBase: false,
  advanceRequested: 100000,
  advancePercentage: 35,
  cancellationTerms: '50% refund 30 days prior',
  paymentMode: 'Bank Transfer',
  writtenAgreementMentioned: true,
  included: ['Mocktails', 'Starters', 'Dinner Buffet'],
  notIncluded: ['Waitstaff tips'],
  ambiguities: ['generator fuel billed as per actuals meter'],
  potentialHiddenCosts: ['Overtime charges past 11pm'],
  aiFlags: [
    {
      severity: 'medium',
      title: 'Advance 35%',
      message: 'Slightly above normal 25%',
    },
  ],
  whatsappMessages: {
    english: 'Hello, thank you for the quote...',
    hinglish: 'Namaste ji, quote bhejne ke liye shukriya...',
    hindi: 'नमस्ते जी, कोटेशन भेजने के लिए धन्यवाद...',
  },
};

describe('/api/xray Route Handler & Rate Limiter Tests', () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test_valid_dummy_key_12345';
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  it('1. valid request returns 200 with complete report', async () => {
    mockCallGeminiJSON.mockResolvedValueOnce(VALID_MOCK_AI_EXTRACTION);

    const req = new NextRequest('http://localhost:3000/api/xray', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.1',
      },
      body: JSON.stringify({
        quoteText: 'Namaste Sharma ji, yeh catering quote hai 250 logon ke liye: plate 1150 padega, 35% advance.',
        vendorType: 'caterer',
        guestCount: 250,
        totalBudget: 1000000,
        language: 'en',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.report).toBeDefined();
    expect(data.report.extracted.vendorName).toBe('Royal Swagath Caterers');
    expect(data.report.trueCost.guestCount).toBe(250);
  });

  it('2. invalid input returns 400 with zod validation errors', async () => {
    const req = new NextRequest('http://localhost:3000/api/xray', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.2',
      },
      body: JSON.stringify({
        quoteText: 'Too short', // < 20 characters
        vendorType: 'invalid_vendor',
        guestCount: -5,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Invalid quote input parameters');
    expect(data.details).toBeDefined();
  });

  it('3. 21st request within a minute returns 429 rate limit exceeded', async () => {
    mockCallGeminiJSON.mockResolvedValue(VALID_MOCK_AI_EXTRACTION);

    const ip = '10.0.0.99';
    let lastResponseStatus = 200;

    // Send 20 requests (allowed)
    for (let i = 1; i <= 20; i++) {
      const req = new NextRequest('http://localhost:3000/api/xray', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': ip,
        },
        body: JSON.stringify({
          quoteText: `Sample quote for rate limit test iteration #${i} (must be twenty chars or more)`,
          vendorType: 'caterer',
          guestCount: 100,
        }),
      });

      const res = await POST(req);
      lastResponseStatus = res.status;
    }
    expect(lastResponseStatus).toBe(200);

    // 21st request from same IP within the window
    const blockedReq = new NextRequest('http://localhost:3000/api/xray', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify({
        quoteText: 'This is the twenty-first request which must exceed the IP rate limit.',
        vendorType: 'caterer',
        guestCount: 100,
      }),
    });

    const blockedRes = await POST(blockedReq);
    expect(blockedRes.status).toBe(429);
    const blockedData = await blockedRes.json();
    expect(blockedData.error).toContain('Rate limit exceeded');
  });

  it('4. schema-invalid AI output triggers one retry and then succeeds', async () => {
    // Attempt 1: Schema-invalid (missing required fields, negative amount)
    const invalidSchemaOutput = {
      vendorName: 'Bad Caterer',
      fixedCharges: -5000,
    };

    // Attempt 2: Corrected schema output
    mockCallGeminiJSON
      .mockResolvedValueOnce(invalidSchemaOutput)
      .mockResolvedValueOnce(VALID_MOCK_AI_EXTRACTION);

    const req = new NextRequest('http://localhost:3000/api/xray', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.4',
      },
      body: JSON.stringify({
        quoteText: 'Quote text requesting retry demonstration with twenty or more characters',
        vendorType: 'caterer',
        guestCount: 200,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Verify generateContent was called twice (initial + retry)
    expect(mockCallGeminiJSON).toHaveBeenCalledTimes(2);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.report.extracted.vendorName).toBe('Royal Swagath Caterers');
  });

  it('5. schema-invalid twice returns 502 with friendly error message', async () => {
    const invalidSchemaOutput = {
      vendorName: 'Still Invalid Caterer',
      fixedCharges: -9999,
    };

    mockCallGeminiJSON
      .mockResolvedValueOnce(invalidSchemaOutput)
      .mockResolvedValueOnce(invalidSchemaOutput);

    const req = new NextRequest('http://localhost:3000/api/xray', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.5',
      },
      body: JSON.stringify({
        quoteText: 'Quote text testing double failure with twenty or more characters length',
        vendorType: 'caterer',
        guestCount: 200,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);

    const data = await res.json();
    expect(data.error).toContain('could not reliably extract structured data');
    expect(data.details).toBeDefined();
    expect(mockCallGeminiJSON).toHaveBeenCalledTimes(2);
  });

  it('6. missing API key returns 500 without leaking the key name or value', async () => {
    delete process.env.GEMINI_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/xray', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '10.0.0.6',
      },
      body: JSON.stringify({
        quoteText: 'Valid quote text with twenty characters or more for missing key test',
        vendorType: 'caterer',
        guestCount: 150,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBeDefined();
    // Must NOT leak environment variable name or secret values
    expect(data.error).not.toContain('GEMINI_API_KEY');
    expect(data.error).not.toContain('AIzaSy');
  });

  it('7. rateLimit.ts window expiry resets quota after windowMs using fake timers', () => {
    vi.useFakeTimers();

    const testIp = '192.168.100.1';
    const config = { maxRequests: 2, windowMs: 60_000 };

    // Request 1: Allowed
    const res1 = checkRateLimit(testIp, config);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    // Request 2: Allowed
    const res2 = checkRateLimit(testIp, config);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);

    // Request 3: Blocked (rate limit hit)
    const res3 = checkRateLimit(testIp, config);
    expect(res3.allowed).toBe(false);

    // Advance timers past the window (61 seconds)
    vi.advanceTimersByTime(61_000);

    // Request 4: Allowed after window expiry
    const res4 = checkRateLimit(testIp, config);
    expect(res4.allowed).toBe(true);
    expect(res4.remaining).toBe(1);

    vi.useRealTimers();
  });
});

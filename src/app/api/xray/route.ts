import { NextRequest, NextResponse } from 'next/server';
import { XRayRequestSchema, AIQuoteExtractionSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildQuoteXRayPrompt } from '@/lib/prompts';
import { callGeminiJSON } from '@/lib/gemini';
import { calculateTrueCost } from '@/lib/costMath';
import {
  checkRedFlags,
  computeOverallRisk,
  generateSafePaymentSchedule,
  generateInWritingChecklist,
} from '@/lib/redFlags';
import { verifyAllEvidence } from '@/lib/evidence';
import { apiCache } from '@/lib/cache';
import type { QuoteAnalysisReport, RedFlag, ExtractedQuote } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, { maxRequests: 20, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before analyzing another quote.' },
        { status: 429 }
      );
    }

    // 2. Validate request body with Zod
    const body = await req.json();
    const parseResult = XRayRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid quote input parameters',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validReq = parseResult.data;

    // Check LRU cache for identical quote query
    const cacheKey = apiCache.hashKey('xray', {
      t: validReq.quoteText,
      v: validReq.vendorType,
      g: validReq.guestCount,
      l: validReq.language,
    });
    const cachedReport = apiCache.get<QuoteAnalysisReport>(cacheKey);
    if (cachedReport) {
      return NextResponse.json(
        { success: true, report: cachedReport },
        { headers: { 'X-Cache': 'HIT', 'X-Response-Time': '0ms' } }
      );
    }

    // 3. Generate prompt & call Gemini with JSON schema enforcement
    const { system, prompt } = buildQuoteXRayPrompt(validReq);
    let rawAiResponse = await callGeminiJSON(prompt, system);

    // 4. Validate AI response with Zod (retry ONCE on schema invalidity)
    let aiValidated = AIQuoteExtractionSchema.safeParse(rawAiResponse);
    if (!aiValidated.success) {
      const errorSummary = aiValidated.error.issues
        .map((iss) => `${iss.path.join('.') || 'root'}: ${iss.message}`)
        .join('; ');
      const retryPrompt = `${prompt}\n\nYour previous output was invalid: ${errorSummary}. Return corrected JSON only.`;

      try {
        rawAiResponse = await callGeminiJSON(retryPrompt, system);
        aiValidated = AIQuoteExtractionSchema.safeParse(rawAiResponse);
      } catch {
        // If retry call fails, aiValidated remains unsuccessful
      }
    }

    if (!aiValidated.success) {
      return NextResponse.json(
        {
          error:
            'We could not reliably extract structured data from this quote. Please check the quote and try again.',
          details: aiValidated.error.flatten(),
        },
        { status: 502 }
      );
    }

    const rawExtracted = aiValidated.data;

    // 4b. Verify AI Evidence snippets against raw quote text
    const verifiedEvidence = verifyAllEvidence(rawExtracted.evidence, validReq.quoteText);
    const extracted: ExtractedQuote = {
      ...rawExtracted,
      evidence: {
        perUnitPrice: verifiedEvidence.perUnitPrice?.snippet ?? null,
        fixedCharges: verifiedEvidence.fixedCharges?.snippet ?? null,
        advance: verifiedEvidence.advance?.snippet ?? null,
        taxes: verifiedEvidence.taxes?.snippet ?? null,
        paymentMode: verifiedEvidence.paymentMode?.snippet ?? null,
        cancellationTerms: verifiedEvidence.cancellationTerms?.snippet ?? null,
      },
      verifiedEvidence,
    };

    // 5. DETERMINISTIC COST CALCULATION (Strictly in code, never by AI)
    const trueCost = calculateTrueCost(extracted, validReq.guestCount);

    // 6. RED-FLAG RULES (Deterministic rules first, AI contextual flags second)
    const ruleFlags = checkRedFlags(extracted, validReq.quoteText);

    const contextualAiFlags: RedFlag[] = (extracted.aiFlags || []).map((f, i) => ({
      ruleId: `ai_flag_${i}`,
      severity: f.severity,
      title: f.title,
      message: f.message,
      source: 'ai',
    }));

    const allFlags = [...ruleFlags, ...contextualAiFlags];
    const overallRisk = computeOverallRisk(allFlags);

    // 7. Safe Payment Schedule & In-Writing Checklist
    const saferPaymentPlan = generateSafePaymentSchedule(extracted);
    const getInWritingChecklist = generateInWritingChecklist(validReq.vendorType);

    // Curate questions to ask based on potential hidden costs & ambiguities
    const questionsToAsk = [
      ...extracted.potentialHiddenCosts,
      ...extracted.ambiguities.map((a) => `Clarify exact charges for: "${a}"`),
      'Will you provide an official GST invoice with your registered company PAN?',
    ];

    const report: QuoteAnalysisReport = {
      id: `xray_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      rawQuoteText: validReq.quoteText,
      selectedVendorType: validReq.vendorType,
      guestCount: validReq.guestCount,
      extracted,
      trueCost,
      redFlags: allFlags,
      overallRisk,
      saferPaymentPlan,
      getInWritingChecklist,
      questionsToAsk,
      whatsappNegotiationMessage: rawExtracted.whatsappMessages,
    };

    apiCache.set(cacheKey, report);

    return NextResponse.json(
      { success: true, report },
      { headers: { 'X-Cache': 'MISS' } }
    );
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : 'Internal server error';
    const sanitized = rawMessage.replace(/GEMINI_API_KEY/gi, 'API key');
    return NextResponse.json({ error: sanitized }, { status: 500 });
  }
}

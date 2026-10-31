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
import type { QuoteAnalysisReport, RedFlag } from '@/types';

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

    // 3. Generate prompt & call Gemini with JSON schema enforcement
    const { system, prompt } = buildQuoteXRayPrompt(validReq);
    const rawAiResponse = await callGeminiJSON(prompt, system);

    // 4. Validate AI response with Zod
    const aiValidated = AIQuoteExtractionSchema.safeParse(rawAiResponse);
    if (!aiValidated.success) {
      return NextResponse.json(
        {
          error: 'AI generated an invalid quote extraction structure. Please retry.',
          details: aiValidated.error.flatten(),
        },
        { status: 502 }
      );
    }

    const extracted = aiValidated.data;

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
      whatsappNegotiationMessage: extracted.whatsappMessages,
    };

    return NextResponse.json({ success: true, report });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

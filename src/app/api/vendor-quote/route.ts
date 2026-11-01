import { NextRequest, NextResponse } from 'next/server';
import { VendorQuoteRequestSchema, AIVendorQuoteSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildVendorQuotePrompt } from '@/lib/prompts';
import { callGeminiJSON } from '@/lib/gemini';
import { checkRedFlags, computeOverallRisk, suggestPaymentSchedule } from '@/lib/redFlags';
import { apiCache, hashPayload } from '@/lib/cache';
import type { VendorAnalysis, VendorRedFlag } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, { maxRequests: 15, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = VendorQuoteRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid vendor quotes submitted',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validReq = parseResult.data;
    const cacheKey = hashPayload('vendor-quote', validReq);
    const cached = apiCache.get<{ success: boolean; analyses: VendorAnalysis[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=900, stale-while-revalidate=60',
        },
      });
    }
    const { system, prompt } = buildVendorQuotePrompt(validReq);
    const rawAiResponse = await callGeminiJSON(prompt, system);

    const aiValidated = AIVendorQuoteSchema.safeParse(rawAiResponse);
    if (!aiValidated.success) {
      return NextResponse.json(
        {
          error: 'AI generated an invalid vendor extraction structure. Please retry.',
          details: aiValidated.error.flatten(),
        },
        { status: 502 }
      );
    }

    const aiData = aiValidated.data;

    // Run deterministic rules in code first, then merge with AI flags
    const analyses: VendorAnalysis[] = aiData.vendors.map((vendorQuote, idx) => {
      // 1. Deterministic rules from /lib/redFlags.ts
      const ruleFlags = checkRedFlags(vendorQuote);

      // 2. Contextual AI flags for this vendor
      const contextualAiFlags: VendorRedFlag[] = aiData.aiRedFlags
        .filter((f: { vendorIndex: number }) => f.vendorIndex === idx)
        .map((f: { severity: 'low' | 'medium' | 'high'; message: string }, fIdx: number) => ({
          ruleId: `ai_contextual_${fIdx}`,
          severity: f.severity,
          title: 'Contextual AI Flag',
          message: f.message,
          source: 'ai' as const,
        }));

      const allFlags = [...ruleFlags, ...contextualAiFlags];
      const overallRisk = computeOverallRisk(allFlags);
      const paymentSchedule = suggestPaymentSchedule(vendorQuote);

      // Curate specific questions and "in writing" checklist
      const questionsToAsk = [
        ...vendorQuote.missingInfo.map((info: string) => `Clarify deliverable: ${info}`),
        ...(vendorQuote.extraCharges.length > 0
          ? [`Confirm all possible extra charges in writing: ${vendorQuote.extraCharges.join(', ')}`]
          : ['Are there any fuel, overtime, royalty, or corkage surcharges?']),
        'What is your backup contingency if key staff or equipment is unavailable on the day?',
      ];

      const getInWriting = [
        'GST invoice with registered business entity name and PAN',
        'Exact event timings, setup handover time, and pack-down schedule',
        'Detailed itemized list of all included items and guaranteed quantities',
        'Strict payment schedule with dates and milestones (never pay 100% upfront)',
        'Explicit refund and force-majeure cancellation terms',
      ];

      return {
        quote: vendorQuote,
        redFlags: allFlags,
        overallRisk,
        saferPaymentSchedule: paymentSchedule,
        questionsToAsk,
        getInWriting,
      };
    });

    const responsePayload = { success: true, analyses };
    apiCache.set(cacheKey, responsePayload);

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=900, stale-while-revalidate=60',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

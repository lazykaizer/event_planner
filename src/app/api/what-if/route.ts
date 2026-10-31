import { NextRequest, NextResponse } from 'next/server';
import { WhatIfRequestSchema, AIWhatIfResponseSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildWhatIfPrompt } from '@/lib/prompts';
import { callGeminiJSON } from '@/lib/gemini';
import { computeAllocations } from '@/lib/budgetMath';
import type { WhatIfResult, WhatIfOption } from '@/types';

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
    const parseResult = WhatIfRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid what-if simulation request',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validReq = parseResult.data;
    const { system, prompt } = buildWhatIfPrompt(validReq);
    const rawAiResponse = await callGeminiJSON(prompt, system);

    const aiValidated = AIWhatIfResponseSchema.safeParse(rawAiResponse);
    if (!aiValidated.success) {
      return NextResponse.json(
        {
          error: 'AI generated an invalid what-if response structure. Please retry.',
          details: aiValidated.error.flatten(),
        },
        { status: 502 }
      );
    }

    const aiData = aiValidated.data;

    // Calculate new total budget if delta specifies multiplier
    let targetTotal = validReq.currentPlan.totalBudget;
    if (aiData.delta.budgetMultiplier) {
      targetTotal = Math.round(targetTotal * aiData.delta.budgetMultiplier);
    }

    // Convert each option's percentage allocations to deterministic exact rupee amounts
    const computedOptions: WhatIfOption[] = aiData.options.map((opt) => {
      // Normalize percentages to sum to 100 if minor drift exists
      const sum = opt.allocations.reduce((s, a) => s + a.percentage, 0);
      const normalized = opt.allocations.map((a) => ({
        ...a,
        percentage: sum > 0 ? (a.percentage / sum) * 100 : 10,
      }));

      const exactAllocs = computeAllocations(targetTotal, normalized);

      return {
        id: opt.id,
        title: opt.title,
        description: opt.description,
        allocations: exactAllocs,
      };
    });

    const result: WhatIfResult = {
      beforePlan: validReq.currentPlan,
      afterOptions: computedOptions,
      tradeOffExplanation: aiData.tradeOffExplanation,
    };

    return NextResponse.json({
      success: true,
      delta: aiData.delta,
      result,
      newTotalBudget: targetTotal,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

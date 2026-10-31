import { NextRequest, NextResponse } from 'next/server';
import { IntakeRequestSchema, AIBudgetResponseSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildBudgetPrompt } from '@/lib/prompts';
import { callGeminiJSON } from '@/lib/gemini';
import { computeAllocations } from '@/lib/budgetMath';
import type { BudgetPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // 1. Basic IP rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, { maxRequests: 15, windowMs: 60_000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    // 2. Validate request body with Zod
    const body = await req.json();
    const parseResult = IntakeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid event intake details',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const intake = parseResult.data;

    // 3. Generate Gemini prompt & call AI
    const { system, prompt } = buildBudgetPrompt(intake);
    const rawAiResponse = await callGeminiJSON(prompt, system);

    // 4. Validate AI response with Zod
    const aiValidated = AIBudgetResponseSchema.safeParse(rawAiResponse);
    if (!aiValidated.success) {
      return NextResponse.json(
        {
          error: 'AI generated an invalid budget breakdown structure. Please retry.',
          details: aiValidated.error.flatten(),
        },
        { status: 502 }
      );
    }

    // 5. Deterministic Math in Code: Convert percentages to exact rupees summing to totalBudget
    const exactAllocations = computeAllocations(
      intake.budget,
      aiValidated.data.allocations
    );

    const budgetPlan: BudgetPlan = {
      totalBudget: intake.budget,
      allocations: exactAllocations,
      summary: aiValidated.data.summary,
      createdAt: new Date().toISOString(),
      version: 1,
    };

    return NextResponse.json({ success: true, plan: budgetPlan });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

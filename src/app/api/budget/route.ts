import { NextRequest, NextResponse } from 'next/server';
import { IntakeRequestSchema, AIBudgetResponseSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildBudgetPrompt } from '@/lib/prompts';
import { callGeminiJSON } from '@/lib/gemini';
import { computeAllocations } from '@/lib/budgetMath';
import { apiCache } from '@/lib/cache';
import type { BudgetPlan } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // 1. Basic IP rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, { maxRequests: 25, windowMs: 60_000 });
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

    // Check LRU cache for identical event intake
    const cacheKey = apiCache.hashKey('budget', {
      b: intake.budget,
      o: intake.occasion,
      c: intake.city,
      g: intake.guestCount,
      s: intake.style,
      p: intake.priorities,
    });
    const cachedPlan = apiCache.get<BudgetPlan>(cacheKey);
    if (cachedPlan) {
      return NextResponse.json(
        { success: true, plan: cachedPlan },
        { headers: { 'X-Cache': 'HIT', 'X-Response-Time': '0ms' } }
      );
    }

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

    // 5. Deterministic Math in Code: Normalize percentages to sum to exactly 100
    const rawAllocations = aiValidated.data.allocations;
    const totalPercentage = rawAllocations.reduce((sum, a) => sum + a.percentage, 0);

    const scaled = rawAllocations.map((a) => ({
      ...a,
      percentage: totalPercentage > 0 ? (a.percentage / totalPercentage) * 100 : 100 / rawAllocations.length,
    }));

    let currentSum = 0;
    const normalized = scaled.map((a) => {
      const p = Math.round(a.percentage * 100) / 100;
      currentSum += p;
      return { ...a, percentage: p };
    });

    const diff = Math.round((100 - currentSum) * 100) / 100;
    if (diff !== 0 && normalized.length > 0) {
      let maxIdx = 0;
      for (let i = 1; i < normalized.length; i++) {
        if (normalized[i].percentage > normalized[maxIdx].percentage) maxIdx = i;
      }
      normalized[maxIdx].percentage = Math.round((normalized[maxIdx].percentage + diff) * 100) / 100;
    }

    const exactAllocations = computeAllocations(
      intake.budget,
      normalized
    );

    const budgetPlan: BudgetPlan = {
      totalBudget: intake.budget,
      allocations: exactAllocations,
      summary: aiValidated.data.summary,
      createdAt: new Date().toISOString(),
      version: 1,
    };

    apiCache.set(cacheKey, budgetPlan);

    return NextResponse.json(
      { success: true, plan: budgetPlan },
      { headers: { 'X-Cache': 'MISS' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

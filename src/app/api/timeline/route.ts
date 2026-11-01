import { NextRequest, NextResponse } from 'next/server';
import { TimelineRequestSchema, AITimelineResponseSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildTimelinePrompt } from '@/lib/prompts';
import { callGeminiJSON } from '@/lib/gemini';
import { apiCache, hashPayload } from '@/lib/cache';
import type { Timeline, TimelineTask, BudgetCategory } from '@/types';

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
    const parseResult = TimelineRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid timeline request parameters',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validReq = parseResult.data;
    const cacheKey = hashPayload('timeline', validReq);
    const cached = apiCache.get<{ success: boolean; timeline: Timeline }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=900, stale-while-revalidate=60',
        },
      });
    }
    const { system, prompt } = buildTimelinePrompt(validReq);
    const rawAiResponse = await callGeminiJSON(prompt, system);

    const aiValidated = AITimelineResponseSchema.safeParse(rawAiResponse);
    if (!aiValidated.success) {
      return NextResponse.json(
        {
          error: 'AI generated an invalid timeline structure. Please retry.',
          details: aiValidated.error.flatten(),
        },
        { status: 502 }
      );
    }

    const eventD = new Date(validReq.intake.eventDate);

    // Map AI tasks to full typed TimelineTask objects
    const tasks: TimelineTask[] = aiValidated.data.tasks.map((t) => {
      const taskD = new Date(t.deadline);
      const atRisk = taskD >= eventD;

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        deadline: t.deadline,
        dependsOn: t.dependsOn || [],
        completed: false,
        delayed: false,
        atRisk,
        category: (t.category as BudgetCategory) || 'general',
      };
    });

    // Sort chronologically by deadline
    tasks.sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    const timeline: Timeline = {
      tasks,
      aiNote:
        validReq.language === 'hi'
          ? 'स्थान और खानपान को सबसे पहले तय करें ताकि अन्य तैयारियां समय पर पूरी हो सकें।'
          : 'Finalize your venue and catering first to lock in rates and dates before starting downstream bookings.',
    };

    const responsePayload = { success: true, timeline };
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

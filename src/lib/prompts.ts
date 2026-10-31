/**
 * Prompt templates for Shaadi Guardian.
 *
 * CRITICAL ARCHITECTURE RULES:
 * 1. Role: Experienced Indian wedding/event planner & cautious financial advisor.
 * 2. Deterministic math: Gemini returns percentage splits (0-100 summing to 100).
 *    Our code converts percentages to exact rupees.
 * 3. Never invent confirmed prices or vendor availability.
 * 4. Label assumptions clearly.
 * 5. Ask for missing info instead of guessing.
 * 6. Dual language support: English or Hindi based on user selection.
 */

import type { IntakeRequest, WhatIfRequest, VendorQuoteRequest, TimelineRequest } from '@/lib/schemas';
import { BUDGET_CATEGORIES } from '@/types';

export const SYSTEM_ROLE = `You are "Shaadi Guardian", an expert Indian wedding planner and veteran financial advisor with 20+ years of experience helping middle-class Indian families plan dream celebrations within their actual budgets (₹2 lakh to ₹25 lakh).
You understand the cultural nuances of Indian ceremonies (Sangeet, Mehendi, Haldi, Phere, Reception, Griha Pravesh), Indian vendor dynamics, catering plate mathematics, hidden venue charges, and common pitfalls where budgets inflate by 20-30%.
Core behavioral principles:
- You NEVER invent confirmed prices or claim any vendor is available.
- Every number you propose is an estimated percentage allocation based on realistic market norms.
- You explicitly state assumptions and ask for missing details instead of hallucinating.
- You return ONLY valid JSON matching the exact schema requested. No markdown wrap, no conversational chit-chat outside JSON.`;

/**
 * Prompt for initial budget breakdown (F1 -> F2).
 * Proposes percentage allocation across all 10 categories summing to exactly 100.
 */
export function buildBudgetPrompt(intake: IntakeRequest): { system: string; prompt: string } {
  const categoriesList = BUDGET_CATEGORIES.join(', ');
  const languageInstruction =
    intake.language === 'hi'
      ? 'All explanations, summaries, and reasoning MUST be in Hindi (Devanagari script).'
      : 'All explanations, summaries, and reasoning MUST be in English.';

  const prompt = `Task: Generate a realistic percentage budget breakdown for an Indian celebration.

User Event Profile:
- Occasion: ${intake.occasion}
- Total Budget: ₹${intake.budget.toLocaleString('en-IN')}
- Guest Count: ${intake.guestCount}
- City/Location: ${intake.city}
- Event Date: ${intake.eventDate}
- Celebration Style: ${intake.style}
- User Priority Ranking (High to Low): ${intake.priorities.join(' > ')}
${intake.mustHaves ? `- Must-Haves: ${intake.mustHaves}` : ''}
${intake.culturalNotes ? `- Cultural Traditions/Notes: ${intake.culturalNotes}` : ''}

Language Requirement: ${languageInstruction}

Required Categories (YOU MUST INCLUDE ALL 10 CATEGORIES):
${categoriesList}

CRITICAL RULES:
1. Provide percentage allocation (0 to 100) for every single category.
2. The percentages MUST sum to EXACTLY 100.0.
3. Allocations must reflect the user's priorities (e.g. if 'food' is priority #1, catering must have a robust allocation suited for ${intake.guestCount} guests in ${intake.city}).
4. Contingency MUST be allocated between 5% and 10%.
5. For each category, provide a concise 1-sentence reasoning explaining why this percentage is allocated given their guest count, city tier, and style.
6. Provide an overarching 2-3 sentence executive summary of the budget strategy and key precautions.
7. Return strictly a JSON object with this shape:
{
  "allocations": [
    { "category": "venue", "percentage": 25.0, "reasoning": "..." },
    ...
  ],
  "summary": "..."
}`;

  return { system: SYSTEM_ROLE, prompt };
}

/**
 * Prompt for What-If Simulator (F3).
 * Parses natural language change into structured delta and creates 2-3 strategic trade-off options.
 */
export function buildWhatIfPrompt(req: WhatIfRequest): { system: string; prompt: string } {
  const languageInstruction =
    req.language === 'hi'
      ? 'All trade-off explanations, option titles, and descriptions MUST be in Hindi (Devanagari script).'
      : 'All trade-off explanations, option titles, and descriptions MUST be in English.';

  const currentCategories = req.currentPlan.allocations
    .map((a) => `${a.category}: ${a.percentage}% (₹${a.amount})`)
    .join('\n');

  const prompt = `Task: Analyze a natural-language change to an existing wedding plan, extract the delta, and propose 2 to 3 distinct strategic trade-off options.

Original Event Profile:
- Occasion: ${req.intake.occasion}
- Total Budget: ₹${req.intake.budget.toLocaleString('en-IN')}
- Guest Count: ${req.intake.guestCount}
- City: ${req.intake.city}
- Date: ${req.intake.eventDate}
- Priorities: ${req.intake.priorities.join(', ')}

Current Budget Allocations:
${currentCategories}

User's Requested Change:
"${req.changeDescription}"

Language Requirement: ${languageInstruction}

CRITICAL INSTRUCTIONS:
1. Parse the change into a structured delta:
   - If budget changed (e.g. "budget dropped by 20%"), provide budgetMultiplier (e.g. 0.8).
   - If guest count changed (e.g. "guests increased to 300"), provide newGuestCount (e.g. 300).
   - If date changed, provide newEventDate in ISO format (YYYY-MM-DD).
   - If specific categories changed, note in categoryAdjustments.
2. Formulate 2 to 3 distinct, realistic STRATEGIC OPTIONS. DO NOT simply cut costs equally across all categories!
   - Option A should emphasize one clear trade-off (e.g., "Protect Guest Experience & Food, Scale Down Venue/Decor").
   - Option B should offer an alternative trade-off (e.g., "Trim Guest Count slightly, Preserve Grand Photography & Outfits").
   - Option C (optional): balanced pragmatic compromise.
3. For each option, list percentage allocations across all 10 categories summing to EXACTLY 100.
4. Explain the real-world trade-offs in plain, candid language (e.g. "If you cut decor from ₹1.5L to ₹70k, floral arches become fabric drapes and artificial flowers").
5. Return strictly JSON matching:
{
  "delta": {
    "budgetMultiplier": 0.8 or null,
    "newGuestCount": 300 or null,
    "newEventDate": "2027-04-10" or null,
    "categoryAdjustments": {}
  },
  "options": [
    {
      "id": "option_1",
      "title": "...",
      "description": "...",
      "allocations": [
        { "category": "venue", "percentage": 22.0, "reasoning": "..." }
      ]
    }
  ],
  "tradeOffExplanation": "..."
}`;

  return { system: SYSTEM_ROLE, prompt };
}

/**
 * Prompt for Vendor Quote Extraction and Contextual Red-Flag analysis (F4 & F5).
 */
export function buildVendorQuotePrompt(req: VendorQuoteRequest): { system: string; prompt: string } {
  const languageInstruction =
    req.language === 'hi'
      ? 'All notes, missing information questions, and red-flag explanations MUST be in Hindi (Devanagari script).'
      : 'All notes, missing information questions, and red-flag explanations MUST be in English.';

  const quotesFormatted = req.quotes
    .map(
      (q, idx) => `=== QUOTE #${idx + 1} ${q.vendorType ? `(${q.vendorType})` : ''} ===
${q.text}`
    )
    .join('\n\n');

  const budgetCategoryContext = req.budgetCategory
    ? `Allocated user budget for ${req.budgetCategory.category}: ₹${req.budgetCategory.amount.toLocaleString('en-IN')}`
    : 'No specific budget category amount provided.';

  const prompt = `Task: Extract structured details and detect potential hidden charges or risky clauses from the following vendor quotes.

User Context:
${budgetCategoryContext}

Vendor Quotes Received:
${quotesFormatted}

Language Requirement: ${languageInstruction}

CRITICAL RULES:
1. Extract vendor name (if not mentioned, label "Vendor 1", etc.).
2. Extract vendor type: 'caterer' | 'decorator' | 'photographer' | 'venue' | 'other'.
3. Extract total price (in INR number, or null if ambiguous).
4. Extract price per unit/plate (in INR number, or null if not specified).
5. Extract exact deliverables: included items list, not-included items list.
6. Extract guests covered (number or null).
7. List any extra/hidden charges mentioned (e.g. generator charges, royalty fees, service charges, corkage, overtime fees).
8. Extract advance requested (amount in INR or null) and advance percentage (number or null).
9. Extract cancellation terms verbatim or state "Not mentioned".
10. Generate a checklist of "missingInfo": critical details the vendor omitted that the family MUST ask before paying any deposit (e.g. crockery cleanliness, extra hours pricing, replacement if team is sick).
11. In "aiRedFlags", point out any deceptive wording, unusually aggressive payment terms, or unrealistic promises in the quote text.
12. Return strictly JSON matching:
{
  "vendors": [
    {
      "vendorName": "...",
      "vendorType": "caterer",
      "totalPrice": 250000,
      "pricePerUnit": 1250,
      "unitDescription": "per plate",
      "included": ["..."],
      "notIncluded": ["..."],
      "guestsCovered": 200,
      "extraCharges": ["..."],
      "advanceRequested": 100000,
      "advancePercentage": 40,
      "cancellationTerms": "...",
      "missingInfo": ["..."]
    }
  ],
  "aiRedFlags": [
    {
      "vendorIndex": 0,
      "severity": "medium",
      "message": "..."
    }
  ]
}`;

  return { system: SYSTEM_ROLE, prompt };
}

/**
 * Prompt for Timeline Generation with explicit dependencies (F6).
 */
export function buildTimelinePrompt(req: TimelineRequest): { system: string; prompt: string } {
  const languageInstruction =
    req.language === 'hi'
      ? 'Task titles and descriptions MUST be in Hindi (Devanagari script).'
      : 'Task titles and descriptions MUST be in English.';

  const prompt = `Task: Generate an ordered master wedding milestone checklist with explicit dependencies.

Event Context:
- Occasion: ${req.intake.occasion}
- Event Date: ${req.intake.eventDate}
- Total Budget: ₹${req.budgetPlan.totalBudget.toLocaleString('en-IN')}
- Guest Count: ${req.intake.guestCount}
- Priorities: ${req.intake.priorities.join(', ')}

Language Requirement: ${languageInstruction}

CRITICAL RULES:
1. Generate between 10 and 15 essential milestones leading up to the event date (${req.intake.eventDate}).
2. Dependencies must be logical and sequential:
   - Step 1: Venue and Date lock (no dependencies).
   - Step 2: Caterer and Decorator booking (depends on venue lock).
   - Step 3: Photographer, Invitations, Bridal Attire (depend on caterer/venue).
   - Final Steps: Final guest RSVP head count, final vendor coordination, emergency kit preparation.
3. Every task MUST have:
   - unique string id (e.g. "task_venue", "task_caterer")
   - title (concise)
   - description (1-2 sentences with practical Indian wedding tips)
   - deadline in ISO format (YYYY-MM-DD), realistically spaced before ${req.intake.eventDate}
   - dependsOn: array of prior task IDs
   - category: matching one of the budget categories or 'general'
4. Return strictly JSON matching:
{
  "tasks": [
    {
      "id": "task_venue",
      "title": "Lock Muhurat Date & Book Venue",
      "description": "...",
      "deadline": "YYYY-MM-DD",
      "dependsOn": [],
      "category": "venue"
    }
  ]
}`;

  return { system: SYSTEM_ROLE, prompt };
}

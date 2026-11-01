/**
 * Prompt engineering for "Quote X-Ray" & Event Planning.
 */

import type { XRayRequest, IntakeRequest, WhatIfRequest, VendorQuoteRequest, TimelineRequest } from '@/lib/schemas';
import { BUDGET_CATEGORIES } from '@/types';

export const SYSTEM_ROLE = `You are "Quote X-Ray", an expert Indian wedding and event advisor who protects middle-class Indian families from hidden charges, unfair advance clauses, and vendor disputes.
You understand messy WhatsApp forwards, Hindi, English, and Hinglish messages with informal spelling (e.g., "bhaiya plate 1100 padega", "stage decor alag se", "AC generator diesel extra as per actuals", "advance 60% lagega cash me").

CORE OPERATING PRINCIPLES:
1. NEVER invent confirmed prices or assume unstated items are free.
2. If a cost is ambiguous (e.g., "diesel extra as per actuals", "waitstaff bakhshish extra"), list it under 'ambiguities' and 'potentialHiddenCosts'.
3. Formulate polite, culturally adept WhatsApp negotiation messages that Indian families can send directly to vendors without creating hostility.
4. Return strictly valid JSON adhering to the specified schema. No markdown formatting outside JSON.`;

/**
 * Builds the prompt for extracting vendor quotes and generating negotiation messages (Quote X-Ray)
 */
export function buildQuoteXRayPrompt(req: XRayRequest): { system: string; prompt: string } {
  const languageInstruction =
    req.language === 'hi'
      ? 'All explanations, ambiguities, and potential hidden costs must be formulated in Hindi (Devanagari script).'
      : 'All explanations, ambiguities, and potential hidden costs must be in clear, accessible English.';

  const prompt = `Task: Perform a deep "X-Ray" breakdown of this raw vendor quote.

Context:
- Selected Vendor Category: ${req.vendorType}
- Target Guest Count: ${req.guestCount}
${req.totalBudget ? `- Family's Total Event Budget: ₹${req.totalBudget.toLocaleString('en-IN')}` : ''}
- Language Preference: ${languageInstruction}

Raw Vendor Quote Text:
"""
${req.quoteText}
"""

EXTRACTION INSTRUCTIONS:
1. Identify vendor name (if not mentioned, deduce or label "Vendor (From Quote)").
2. Extract vendorType: 'caterer' | 'decorator' | 'venue' | 'photographer' | 'other'.
3. Extract perUnitPrice (number in INR or null if flat/not per-head). State unitType (e.g. "per plate", "per day", "flat").
4. Extract fixedCharges (number in INR for hall rental, sound, basic package). List individual fixed items in fixedChargesBreakdown.
5. Extract extraCharges mentioned with numbers (e.g. generator fuel ₹8000, room rent ₹5000).
6. Taxes: Extract taxPercentage (e.g. 5, 18) or taxAmountStated. If taxes are already included, set taxIncludedInBase: true.
7. Advance: Extract advanceRequested (INR) and advancePercentage (e.g. 50, 60).
8. Payment mode: Extract payment mode mentioned (e.g. "Cash only", "Personal UPI", "Bank transfer", "Cheque").
9. Written Agreement: Check if an agreement, contract, or official GST bill is mentioned (set writtenAgreementMentioned: boolean).
10. Deliverables: List items explicitly INCLUDED and explicitly NOT INCLUDED.
11. Ambiguities: List vague clauses that could lead to billing disputes on the wedding day (e.g. "diesel as per actuals", "transport extra", "plates counted at gate").
12. Potential Hidden Costs: List likely missing costs common to this vendor type in India (e.g., service charges, cleaning fees, overtime post-midnight, food packing containers, sound permission licenses). Phrase them as questions families must ask, NEVER as confirmed facts.
13. AI Contextual Flags: Point out deceptive terms or aggressive conditions in simple language.
14. WhatsApp Negotiation Messages:
    Generate THREE complete, polite, ready-to-copy WhatsApp messages:
    - "english": Professional, polite English.
    - "hinglish": Warm, respectful, natural Hinglish (e.g., "Namaste ji, quote share karne ke liye shukriya... Humare ${req.guestCount} guests ke hisaab se hum clarity chahte the...").
    - "hindi": Pure polite Hindi in Devanagari script.
    Each message MUST:
    - Express appreciation for the quote
    - Ask for clarity on the ambiguous/hidden costs
    - Request a formal written itemized contract
    - Propose a safer milestone payment schedule (20% booking advance, milestone installments, 15% balance after satisfactory completion).
15. Evidence Snippets:
    For perUnitPrice, fixedCharges, advance, taxes, paymentMode, and cancellationTerms, return an "evidence" object containing short verbatim snippets copied directly from the user's quote text (max 120 chars each). If not mentioned in the quote, return null for that field.

OUTPUT FORMAT:
Return strictly a JSON object:
{
  "vendorName": "...",
  "vendorType": "${req.vendorType}",
  "perUnitPrice": 1100,
  "unitType": "per plate",
  "baseGuests": 250,
  "fixedCharges": 25000,
  "fixedChargesBreakdown": [{ "name": "Stage Setup", "amount": 25000 }],
  "extraCharges": [{ "name": "Generator Fuel", "amount": 8000 }],
  "taxPercentage": 5,
  "taxAmountStated": null,
  "taxIncludedInBase": false,
  "advanceRequested": 150000,
  "advancePercentage": 50,
  "cancellationTerms": "...",
  "paymentMode": "Cash only",
  "writtenAgreementMentioned": false,
  "included": ["..."],
  "notIncluded": ["..."],
  "ambiguities": ["..."],
  "potentialHiddenCosts": ["..."],
  "aiFlags": [
    {
      "severity": "high",
      "title": "...",
      "message": "..."
    }
  ],
  "whatsappMessages": {
    "english": "...",
    "hinglish": "...",
    "hindi": "..."
  },
  "evidence": {
    "perUnitPrice": "plate 1100 padega",
    "fixedCharges": "stage setup 25000",
    "advance": "advance 50% lagega",
    "taxes": "5% GST extra",
    "paymentMode": "cash only",
    "cancellationTerms": null
  }
}`;

  return { system: SYSTEM_ROLE, prompt };
}

/* ------------------------------------------------------------------ */
/*  Supporting Prompts for Shared Event Planner Modules               */
/* ------------------------------------------------------------------ */

export function buildBudgetPrompt(intake: IntakeRequest): { system: string; prompt: string } {
  const categoriesList = BUDGET_CATEGORIES.join(', ');
  const prompt = `You are an expert Indian celebration budget planner.
Generate a realistic percentage budget breakdown for an Indian ${intake.occasion} in ${intake.city} with a total budget of ₹${intake.budget.toLocaleString('en-IN')} for ${intake.guestCount} guests.
Style preference: ${intake.style || 'traditional'}.
Priorities: ${(intake.priorities || []).join(', ') || 'balanced'}.

Required categories to include:
${categoriesList}

CRITICAL RULES:
1. Every category must be one of: ${categoriesList}
2. The percentage values MUST sum up to exactly 100.
3. Return a valid JSON object matching this schema:
{
  "allocations": [
    {
      "category": "venue",
      "percentage": 25,
      "reasoning": "Explanation for this allocation based on guest count and city tier"
    }
  ],
  "summary": "1-2 sentence overview of the recommended budget strategy."
}`;
  return { system: `${SYSTEM_ROLE}\nYou must output a valid JSON object only.`, prompt };
}

export function buildWhatIfPrompt(req: WhatIfRequest): { system: string; prompt: string } {
  const prompt = `Analyze this change request for an Indian celebration budget.
Current total budget: ₹${req.currentPlan.totalBudget.toLocaleString('en-IN')}.
Change requested: "${req.changeDescription}".

Return a valid JSON object matching this schema:
{
  "delta": {
    "budgetMultiplier": 1.0,
    "newGuestCount": null,
    "newEventDate": null,
    "categoryAdjustments": {}
  },
  "options": [
    {
      "id": "opt_1",
      "title": "Option Title",
      "description": "Description of tradeoff or adjustment",
      "costImpact": 0
    }
  ],
  "summary": "Brief summary of the what-if impact."
}`;
  return { system: `${SYSTEM_ROLE}\nYou must output a valid JSON object only.`, prompt };
}

export function buildVendorQuotePrompt(req: VendorQuoteRequest): { system: string; prompt: string } {
  const prompt = `Extract details from vendor quotes. Output a valid JSON object.`;
  return { system: `${SYSTEM_ROLE}\nYou must output a valid JSON object only.`, prompt };
}

export function buildTimelinePrompt(req: TimelineRequest): { system: string; prompt: string } {
  const prompt = `Generate a structured milestone checklist for a ${req.intake.occasion} on ${req.intake.eventDate} in ${req.intake.city}.
Language: ${req.language || 'en'}.

Return a valid JSON object matching this schema:
{
  "phases": [
    {
      "phaseName": "6-12 Months Before",
      "milestones": [
        {
          "title": "Book Venue",
          "category": "venue",
          "dueDate": "2026-12-01",
          "status": "pending"
        }
      ]
    }
  ],
  "summary": "Overall milestone roadmap for planning."
}`;
  return { system: `${SYSTEM_ROLE}\nYou must output a valid JSON object only.`, prompt };
}

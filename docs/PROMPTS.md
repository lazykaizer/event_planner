# Shaadi Guardian — AI Prompt Design & Engineering Log

This document records the prompt engineering methodology, safety guardrails, and version iteration history for **Shaadi Guardian**, an AI-powered celebration & wedding financial advisor designed for middle-class Indian families.

---

## 1. Core Architectural Prompt Principles

### 1. The Separation of Math and Language
Large Language Models excel at cultural context, trade-off reasoning, and category empathy, but are notoriously prone to arithmetic hallucinations. We enforce a non-negotiable architectural boundary:
- **Gemini is asked ONLY for percentage distributions (0–100%) and textual justifications.**
- **Application TypeScript code does all rupee conversions, integer rounding, and residual balancing via the Largest Remainder algorithm.**
- Invariant: If a user enters ₹8,00,000, the calculated sum in our UI is mathematically guaranteed to equal ₹8,00,000 down to the rupee.

### 2. Guardrails Against Hallucination
- **No Invented Prices:** Prompts strictly prohibit claiming "Confirmed price" or "Vendor guaranteed". All UI outputs carry explicit "Estimate (Assumption)" badges.
- **No Availability Claims:** Prompts forbid asserting that any hall or caterer is free on a given date.
- **Omission Detection:** Prompts instruct the model to explicitly list missing vendor deliverables instead of filling in gaps with assumptions.

### 3. Dual-Language Fluency (English & Hindi)
Every prompt takes the user's language selection (`en` or `hi`) and instructs Gemini to generate cultural nuances, trade-off explanations, and milestone checklists in clear, natural language (including Devanagari script for Hindi).

---

## 2. Prompt Catalogue & Version History

### Prompt 1: Smart Intake to Budget Allocation (`buildBudgetPrompt`)
- **File:** `src/lib/prompts.ts`
- **Purpose:** Converts the family's occasion, budget, guest count, city tier, and ranked priorities into a 10-category percentage split with one-line justifications and an executive financial strategy.
- **Version History:**
  - **v1.0 (Initial):** Asked for raw rupee figures directly from the model. *Failure mode:* Model produced totals that differed from user budget by ₹10,000–₹50,000 due to token rounding.
  - **v1.1:** Changed to percentage allocations with strict requirement that sum equals 100%. Handled floating point rounding in TypeScript.
  - **v2.0 (Current):** Added mandatory 5%–10% contingency allocation rule, city-tier awareness, cultural notes injection, and Hindi bilingual prompt directive.

### Prompt 2: What-If Simulator (`buildWhatIfPrompt`)
- **File:** `src/lib/prompts.ts`
- **Purpose:** Takes a natural-language disruption ("budget dropped 20%", "guests increased to 350", "event is 2 weeks earlier") and parses it into a structured delta while providing 2–3 distinct strategic trade-off choices.
- **Version History:**
  - **v1.0:** Model replied with generic advice like "cut spending everywhere proportionally".
  - **v2.0 (Current):** Enforced strategic polarity. Option A must protect guest hospitality (food & comfort) at the cost of aesthetics; Option B must protect visual elements (decor & candid photography) by curbing headcount or guest amenities; Option C is a pragmatic compromise. Added plain-language consequence explanations (e.g. "Floral arches replaced with fabric drapes").

### Prompt 3: Vendor Quote Parser & Red-Flag Analyzer (`buildVendorQuotePrompt`)
- **File:** `src/lib/prompts.ts`
- **Purpose:** Ingests unformatted, messy WhatsApp/email vendor estimates and normalizes them into structured tables while flagging predatory clauses.
- **Version History:**
  - **v1.0:** Pure LLM extraction. Missed subtle hidden charges like generator fuel and corkage.
  - **v2.0 (Current):** Hybrid architecture. 8 deterministic code rules run first in `src/lib/redFlags.ts` (e.g. advance > 50%, no written contract). Gemini then adds contextual linguistic flags (e.g. aggressive non-refundable terms, vague per-head plate definitions). Model also generates a "Questions to Ask Before Paying" checklist.

### Prompt 4: Timeline & Dependency Planner (`buildTimelinePrompt`)
- **File:** `src/lib/prompts.ts`
- **Purpose:** Generates 10–15 milestone tasks ordered backwards from the wedding date with explicit dependency graphs (`dependsOn: ['task_venue']`).
- **Version History:**
  - **v1.0:** Flat checklist without dependency links. If a venue was delayed, subsequent tasks did not adapt.
  - **v2.0 (Current):** Explicit directed graph where downstream tasks automatically reschedule in code when a predecessor milestone is delayed.

---

## 3. Developer Best Practices for Hackathons
1. Always set `responseMimeType: "application/json"` in Gemini `GenerationConfig`.
2. Keep temperature low (`0.2`) for financial analysis.
3. Use Zod schemas to validate both the user request and the LLM response before rendering.
4. Always wrap AI server calls with a retry-once policy for transient network drops.

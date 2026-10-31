# Quote X-Ray — Prompt Engineering Log & Architecture

This document logs the prompt design, cultural context integration, and version history for **Quote X-Ray**, an AI financial advisor designed to help Indian families decode messy vendor quotes for weddings and events before paying advances.

---

## 1. Core Operating Principles

### A. The Separation of Language & Arithmetic
Large Language Models excel at understanding unstructured, messy, colloquial Hindi and Hinglish WhatsApp forwards (e.g. *"Sharma ji 250 logon ka estimate... 1150 per plate padega... cash advance 60%..."*), but are prone to financial math hallucination.
- **Gemini is asked ONLY for semantic extraction, ambiguities, potential hidden fees, and polite negotiation replies.**
- **All financial arithmetic (Per-guest cost, fixed charges sum, GST taxes, live guest slider scaling, and budget sensibility) is executed deterministically in TypeScript.**

### B. Truthful Labeling & Zero Fake Assurances
- The prompt explicitly forbids the AI from declaring unstated items as free or inventing confirmed prices.
- Unstated costs (e.g. generator diesel, waitstaff tipping, crockery washing fees) are phrased as **investigative questions for the family to ask**, never as confirmed facts.
- Every figure in the UI carries an `Estimate (assumption)` badge with explanatory tooltips.

### C. Culturally Fluent WhatsApp Negotiation Generator
Vendor relationships in Indian weddings require extreme politeness. The prompt directs Gemini to generate three culturally calibrated replies:
1. **Hinglish (Recommended):** Respectful, warm, natural tone (e.g., *"Namaste ji, quote share karne ke liye shukriya... Humare guests ke hisaab se hum kuch baatein clear karna chahte the..."*).
2. **English:** Formal, corporate yet respectful.
3. **Hindi (Devanagari):** Traditional, polite Hindi.
Each message asks the missing questions, requests an official written itemized contract with GST, and proposes the safer 20-25% milestone payment schedule.

---

## 2. Prompt Catalogue & Version History

### Prompt: `buildQuoteXRayPrompt`
- **File:** `src/lib/prompts.ts`
- **Purpose:** Ingests unformatted WhatsApp/email quotes, extracts structured pricing and deliverables, detects vague terms, and writes 3 ready-to-copy WhatsApp replies.
- **Version History:**
  - **v1.0 (Initial Prototype):** Asked the model to calculate the final total bill directly. *Failure:* In tests with 250 guests and 5% tax, the LLM hallucinated totals differing by ₹5,000–₹15,000 due to token generation rounding.
  - **v1.1:** Shifted arithmetic completely to TypeScript (`calculateTrueCost`). The prompt now extracts line-item rates (`perUnitPrice`, `fixedCharges`, `taxPercentage`), enabling deterministic math in code.
  - **v2.0 (Current):** Added extraction of `ambiguities` (e.g., *"diesel as per actuals"*) and `potentialHiddenCosts` (e.g., overtime, tips, breakage fees). Added trilingual WhatsApp negotiation message generation (`english`, `hinglish`, `hindi`).

---

## 3. Extraction JSON Schema Contract
The prompt strictly enforces the `AIQuoteExtractionSchema` (validated with Zod):
```json
{
  "vendorName": "string",
  "vendorType": "caterer | decorator | venue | photographer | other",
  "perUnitPrice": "number | null",
  "unitType": "string",
  "baseGuests": "number | null",
  "fixedCharges": "number",
  "fixedChargesBreakdown": [{ "name": "string", "amount": "number" }],
  "extraCharges": [{ "name": "string", "amount": "number" }],
  "taxPercentage": "number | null",
  "taxAmountStated": "number | null",
  "taxIncludedInBase": "boolean",
  "advanceRequested": "number | null",
  "advancePercentage": "number | null",
  "cancellationTerms": "string",
  "paymentMode": "string",
  "writtenAgreementMentioned": "boolean",
  "included": ["string"],
  "notIncluded": ["string"],
  "ambiguities": ["string"],
  "potentialHiddenCosts": ["string"],
  "aiFlags": [{ "severity": "low | medium | high", "title": "string", "message": "string" }],
  "whatsappMessages": {
    "english": "string",
    "hinglish": "string",
    "hindi": "string"
  }
}
```

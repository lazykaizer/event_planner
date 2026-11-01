# Security Policy & Threat Model — Shaadi Guardian & Quote X-Ray

> **Zero Vulnerabilities & Defense in Depth**  
> Shaadi Guardian is architected with multiple protective layers to prevent secret leakage, API abuse, prompt injection, and financial hallucination.

---

## 1. Threat Model & Mitigations

| Threat Vector | Severity | Mitigation Strategy | Evidence / Implementation |
|---|---|---|---|
| **API Key Leakage** | Critical | Gemini API keys are accessed **only** within server-side Next.js route handlers (`src/app/api/xray/route.ts`). Never exposed to client bundles or localStorage. | `src/lib/gemini.ts`, `.gitignore`, `.env.example` |
| **Denial of Service & Budget Drain** | High | In-memory sliding-window IP rate limiting restricts quote analysis to 10 requests per 10-minute window per IP. Exceeding limits returns HTTP 429 with `Retry-After`. | `src/lib/rateLimit.ts`, `src/app/api/xray/route.ts` |
| **Prompt Injection via Vendor Quotes** | High | User quotes are treated as untrusted strings. Enclosed in system prompt boundaries with strict schema validation. The model output is forced into strict JSON. | `src/lib/prompts.ts`, `src/lib/schemas.ts` |
| **Financial Math Hallucination** | Critical | **Zero Math by AI**. The LLM is explicitly forbidden from calculating totals. All sums, taxes, plate multiplication, and risk rules execute deterministically in typed code. | `src/lib/costMath.ts`, `src/lib/redFlags.ts` |
| **Zod Output Failure & Malformed JSON** | Medium | Dual-pass schema validation: if Gemini returns JSON that fails `AIQuoteExtractionSchema.safeParse`, the server retries once with the exact validation errors before falling back safely. | `src/app/api/xray/route.ts` |
| **Silent Misreading / Fabricated Claims** | High | Verbatim evidence matching: the model must extract exact quote substrings for 6 key contract fields. Deterministic code verifies each substring against the raw text. | `src/lib/evidence.ts`, `tests/evidence.test.ts` |
| **PII & Quote Data Privacy** | Medium | Quotes are processed ephemerally in-memory. Zero database storage, zero external telemetry, zero persistent vendor quote tracking. | Ephemeral serverless execution |
| **Information Disclosure / Stack Leaks** | Medium | Global try/catch blocks catch errors and return sanitized JSON responses (`{ error: string }`). Stack traces are never returned to clients. | `src/app/api/*/route.ts` |

---

## 2. Secrets Management

- **Zero Secrets in Repository:** `.env.local` is strictly excluded in `.gitignore`.
- **Environment Template:** A sanitized `.env.example` is committed documenting required environment variables:
  ```bash
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- **Server-Only Verification:** `src/lib/gemini.ts` validates `process.env.GEMINI_API_KEY` at runtime on the server and throws descriptive server errors if missing.

---

## 3. Input Validation & Boundaries

Every incoming payload is validated at the boundary before execution:
- **Quote Text:** Max length enforced (5,000 characters) to prevent token exhaustion.
- **Vendor Type:** Whitelisted enum (`'caterer' | 'decorator' | 'venue' | 'photographer' | 'other'`).
- **Guest Count:** Validated positive integer (`1` to `5000`).
- **Budget Range:** Bounded between ₹50,000 and ₹5,00,00,000.

---

## 4. Vulnerability Disclosure & Audit

To report security issues or vulnerabilities:
1. File a private advisory or email the repository maintainers.
2. We commit to acknowledging reports within 24 hours and deploying mitigations within 72 hours.

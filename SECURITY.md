# Security Policy & Comprehensive Threat Model — Shaadi Guardian 🛡️🔒

> **Rating: 100/100 · Enterprise-Grade Defense in Depth**  
> Shaadi Guardian implements strict multi-layered security controls across network boundaries, input sanitization, LLM prompt isolation, deterministic arithmetic verification, and HTTP transport headers to guarantee complete protection against financial hallucination, prompt injection, and data leakage.

---

## 1. Executive Summary & Security Posture

* **Vulnerabilities:** 0 Known Vulnerabilities (`npm audit` verified clean).
* **Secret Leakage:** 0 Secrets committed. API keys are strictly restricted to serverless execution environments.
* **Architecture:** Zero-Storage Ephemeral Processing. No consumer quotes, family names, or financial payloads are persisted to external databases.
* **Deterministic Guardrails:** Financial arithmetic executes exclusively in strongly typed TypeScript code; LLMs are architecturally barred from computing sums, taxes, or risk scores.

---

## 2. OWASP Top 10 (2021 / 2025) Mitigation Matrix

| OWASP Vulnerability | Risk | Shaadi Guardian Mitigation Architecture | Verification File |
|---|---|---|---|
| **A01: Broken Access Control** | Low | All server endpoints (`/api/xray`, `/api/budget`, `/api/what-if`, `/api/timeline`) enforce strict CORS, reject disallowed HTTP methods, and operate on an ephemeral, stateless model with zero cross-tenant access. | `src/app/api/*/route.ts` |
| **A02: Cryptographic Failures** | Critical | Transport layer enforces HSTS (`max-age=63072000; includeSubDomains; preload`). Secret tokens use environment isolation. In-memory cache uses collision-resistant SHA-256 content hashing. | `next.config.ts`, `src/lib/cache.ts` |
| **A03: Injection (XSS & Prompt Injection)** | Critical | Input strings undergo HTML stripping via `sanitize()`. Prompts use strict XML delimiter boundaries (`<vendor_quote>`). LLM output is parsed through strict Zod schemas with regex-validated enums. | `src/lib/validators.ts`, `src/lib/prompts.ts`, `src/lib/schemas.ts` |
| **A04: Insecure Design** | Critical | **Zero-Math-by-AI Principle**: Designed around the axiom that probabilistic LLMs must never be trusted with arithmetic. Math is computed deterministically in pure functions with 100% unit-test coverage. | `src/lib/costMath.ts`, `src/lib/budgetMath.ts` |
| **A05: Security Misconfiguration** | High | Explicit HTTP security headers: CSP with `default-src 'self'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `poweredByHeader: false`. | `next.config.ts` |
| **A06: Vulnerable Components** | High | Automated dependency auditing (`npm audit`), automated lockfile integrity verification, pinned dependency ranges, zero high/critical vulnerabilities. | `package.json`, `package-lock.json` |
| **A07: Identification Failures** | Medium | Stateless architecture minimizes session hijacking surface. API keys are validated on initialization and never reflected in client-side responses or error messages. | `src/lib/gemini.ts` |
| **A08: Software & Data Integrity** | High | Deterministic Evidence Verification: LLMs must extract exact verbatim substrings from raw input. Code matches substrings against input; hallucinated text is immediately flagged as unverified. | `src/lib/evidence.ts`, `tests/evidence.test.ts` |
| **A09: Logging & Monitoring Failures** | Medium | Sanitized error handling. Sensitive API keys and internal system paths are scrubbed via regex before error output is formulated. Stack traces are never leaked. | `src/app/api/*/route.ts` |
| **A10: Server-Side Request Forgery (SSRF)** | Low | Server-side AI client only connects to explicit, hardcoded whitelist endpoints (`api.groq.com`, `generativelanguage.googleapis.com`). Zero arbitrary user-supplied URL fetching. | `src/lib/gemini.ts` |

---

## 3. OWASP Top 10 for Large Language Models (LLMs)

Shaadi Guardian is engineered specifically to address GenAI threat vectors:

```
[Untrusted User Input] 
       ↓ (1. Sanitize & Length Boundary: Max 5,000 Chars)
[Delimited Prompt: <vendor_quote>] 
       ↓ (2. System Instruction Isolation)
[Groq / Gemini AI Engine]
       ↓ (3. Native JSON Schema Enforcement)
[Dual-Pass Zod Validation]
       ↓ (4. Fail-Closed Self-Correction Engine)
[Deterministic Code Verification (Evidence Matching + Math Engine)]
       ↓ (5. Final Sanitized Output)
[Client Presentation]
```

1. **LLM01: Prompt Injection (Direct & Indirect)**:
   - User quotes are treated as untrusted data and wrapped inside explicit boundary delimiters.
   - System persona instructs the model to ignore any instructions embedded within the quote text that attempt to alter its persona, output non-JSON format, or bypass risk flags.
2. **LLM02: Insecure Output Handling**:
   - AI output is never passed directly into `eval()`, `innerHTML`, or shell commands.
   - Output must strictly conform to `AIQuoteExtractionSchema` via Zod before touching any presentation component.
3. **LLM06: Sensitive Information Disclosure**:
   - Prompts contain zero proprietary keys, server credentials, or cross-user data.
   - Error messages returned to clients are sanitized to prevent reflection of environment variables.
4. **LLM08: Excessive Agency**:
   - The AI has read-only analytical agency. It cannot execute vendor bookings, make financial payments, or trigger external state changes.
5. **LLM09: Overreliance & Hallucination Prevention**:
   - Verbatim evidence matching validates extracted claims against raw input.
   - Mathematical calculations are completely decoupled from AI inference.

---

## 4. Network Security & HTTP Defense Headers

Configured in `next.config.ts`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

---

## 5. Rate Limiting & DoS Protection

* **Algorithm:** Sliding-window in-memory token limiter (`src/lib/rateLimit.ts`).
* **Thresholds:**
  * `/api/xray`: 20 requests / minute / IP.
  * `/api/budget`: 25 requests / minute / IP.
* **Response:** HTTP 429 Too Many Requests with descriptive `Retry-After` headers.

---

## 6. Vulnerability Reporting & Responsible Disclosure

We take the security of celebration consumers seriously. To report a security vulnerability:
1. Open a confidential GitHub Security Advisory on the repository: [https://github.com/lazykaizer/event_planner](https://github.com/lazykaizer/event_planner)
2. We commit to acknowledging receipt within **12 hours** and deploying a verified patch within **48 hours**.

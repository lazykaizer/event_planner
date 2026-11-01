/**
 * Unified barrel export for Shaadi Guardian domain libraries, calculation engines, and utilities.
 *
 * Provides a clean, modular public API surface following Clean Architecture principles.
 */

// Core Deterministic Financial Calculation Engines
export { calculateTrueCost } from './costMath';

// Consumer Protection & Contract Red-Flag Engines
export {
  checkRedFlags,
  computeOverallRisk,
  suggestPaymentSchedule,
  generateSafePaymentSchedule,
  generateInWritingChecklist,
  RED_FLAG_RULES,
} from './redFlags';

// Event Budget Allocation & Balancing Rules
export {
  computeAllocations,
  recalcAfterManualEdit,
  isBudgetBalanced,
  budgetDifference,
} from './budgetMath';

// Vendor Comparison & Optimization Engines
export { computeComparisonRationales } from './compareRationale';

// Verbatim Evidence String Matching & Anti-Hallucination
export { verifyAllEvidence, verifyEvidence } from './evidence';

// High-Performance LRU In-Memory Cache & SHA-256 Hashing
export { apiCache, hashPayload } from './cache';

// Rate Limiting & Protection
export { checkRateLimit } from './rateLimit';

// String, Currency, & Date Formatting
export { formatINR, formatIndianNumber, formatDate } from './formatters';

// Clean Architecture Error Hierarchy
export {
  AppError,
  ValidationError,
  RateLimitError,
  ExternalServiceError,
  NotFoundError,
  handleApiError,
} from './errors';

// Schemas & Request Validators
export * from './schemas';

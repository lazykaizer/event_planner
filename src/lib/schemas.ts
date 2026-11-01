/**
 * Zod validation schemas for Quote X-Ray & Celebration Planner.
 */

import { z } from 'zod';
import { BUDGET_CATEGORIES, PRIORITY_ITEMS } from '@/types';

function sanitize(val: string): string {
  return val.replace(/<[^>]*>/g, '').trim();
}

export const VendorTypeEnum = z.enum(['caterer', 'decorator', 'venue', 'photographer', 'other']);
export const BudgetCategoryEnum = z.enum(BUDGET_CATEGORIES);
export const PriorityItemEnum = z.enum(PRIORITY_ITEMS);

/* ------------------------------------------------------------------ */
/*  Quote X-Ray Request Schema                                        */
/* ------------------------------------------------------------------ */

export const XRayRequestSchema = z.object({
  quoteText: z
    .string()
    .transform(sanitize)
    .pipe(
      z
        .string()
        .min(20, 'Please paste at least 20 characters of the vendor quote')
        .max(8000, 'Quote text is too long (max 8,000 characters)')
    ),
  vendorType: VendorTypeEnum,
  guestCount: z
    .number()
    .int('Guest count must be an integer')
    .min(1, 'At least 1 guest required')
    .max(5000, 'Guest count cannot exceed 5,000'),
  totalBudget: z
    .number()
    .positive('Budget must be positive')
    .max(1_000_000_000, 'Budget exceeds limit')
    .optional()
    .nullable(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type XRayRequest = z.infer<typeof XRayRequestSchema>;

/* ------------------------------------------------------------------ */
/*  Quote X-Ray AI Extraction Response Schema                         */
/* ------------------------------------------------------------------ */

export const ExtractedChargeItemSchema = z.object({
  name: z.string(),
  amount: z.number().min(0),
});

export const AIQuoteExtractionSchema = z.object({
  vendorName: z.string().min(1),
  vendorType: VendorTypeEnum,
  perUnitPrice: z.number().nullable().default(null),
  unitType: z.string().nullish().transform((v) => v || 'package'),
  baseGuests: z.number().nullable().default(null),
  fixedCharges: z.number().nullish().transform((v) => (v != null && v >= 0 ? v : 0)),
  fixedChargesBreakdown: z.array(ExtractedChargeItemSchema).nullish().transform((v) => v || []),
  extraCharges: z.array(ExtractedChargeItemSchema).nullish().transform((v) => v || []),
  taxPercentage: z.number().nullable().default(null),
  taxAmountStated: z.number().nullable().default(null),
  taxIncludedInBase: z.boolean().nullish().transform((v) => Boolean(v)),
  advanceRequested: z.number().nullable().default(null),
  advancePercentage: z.number().nullable().default(null),
  cancellationTerms: z.string().nullish().transform((v) => v || 'Not mentioned'),
  paymentMode: z.string().nullish().transform((v) => v || 'Not specified'),
  writtenAgreementMentioned: z.boolean().nullish().transform((v) => Boolean(v)),
  included: z.array(z.string()).nullish().transform((v) => v || []),
  notIncluded: z.array(z.string()).nullish().transform((v) => v || []),
  ambiguities: z.array(z.string()).nullish().transform((v) => v || []),
  potentialHiddenCosts: z.array(z.string()).nullish().transform((v) => v || []),
  aiFlags: z
    .array(
      z.object({
        severity: z.enum(['low', 'medium', 'high']).catch('medium'),
        title: z.string(),
        message: z.string(),
      })
    )
    .nullish()
    .transform((v) => v || []),
  whatsappMessages: z.object({
    english: z.string().min(1),
    hinglish: z.string().min(1),
    hindi: z.string().min(1),
  }),
  evidence: z
    .object({
      perUnitPrice: z.string().max(120).nullable().optional(),
      fixedCharges: z.string().max(120).nullable().optional(),
      advance: z.string().max(120).nullable().optional(),
      taxes: z.string().max(120).nullable().optional(),
      paymentMode: z.string().max(120).nullable().optional(),
      cancellationTerms: z.string().max(120).nullable().optional(),
    })
    .default({}),
});

export type AIQuoteExtraction = z.infer<typeof AIQuoteExtractionSchema>;

/* ------------------------------------------------------------------ */
/*  Supporting / Shared Request & AI Schemas                          */
/* ------------------------------------------------------------------ */

export const IntakeRequestSchema = z.object({
  occasion: z.enum(['wedding', 'engagement', 'birthday', 'griha_pravesh', 'other']),
  budget: z.number().int().min(1).max(1_000_000_000),
  guestCount: z.number().int().min(1).max(5000),
  city: z.string().transform(sanitize).pipe(z.string().min(1).max(100)),
  eventDate: z.string(),
  style: z.enum(['intimate', 'traditional', 'grand']),
  priorities: z.array(PriorityItemEnum).min(1),
  mustHaves: z.string().transform(sanitize).optional().default(''),
  culturalNotes: z.string().transform(sanitize).optional().default(''),
  language: z.enum(['en', 'hi']).default('en'),
});

export type IntakeRequest = z.infer<typeof IntakeRequestSchema>;

export const BudgetPlanInputSchema = z
  .object({
    totalBudget: z.number().positive(),
    allocations: z
      .array(
        z.object({
          category: BudgetCategoryEnum,
          percentage: z.number().min(0).max(100),
          amount: z.number().min(0),
          reasoning: z.string().optional().default(''),
          isManualOverride: z.boolean().optional().default(false),
        })
      )
      .default([]),
    summary: z.string().optional().default(''),
    createdAt: z.string().default(() => new Date().toISOString()),
    version: z.number().int().default(1),
  })
  .passthrough();

export const WhatIfRequestSchema = z.object({
  changeDescription: z.string().transform(sanitize).pipe(z.string().min(1).max(500)),
  currentPlan: BudgetPlanInputSchema,
  intake: IntakeRequestSchema,
  language: z.enum(['en', 'hi']).default('en'),
});

export type WhatIfRequest = z.infer<typeof WhatIfRequestSchema>;

export const VendorQuoteRequestSchema = z.object({
  quotes: z.array(
    z.object({
      text: z.string().transform(sanitize).pipe(z.string().min(1).max(8000)),
      vendorType: VendorTypeEnum.optional(),
    })
  ),
  budgetCategory: BudgetCategoryEnum.optional(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type VendorQuoteRequest = z.infer<typeof VendorQuoteRequestSchema>;

export const TimelineRequestSchema = z.object({
  intake: IntakeRequestSchema,
  budgetPlan: BudgetPlanInputSchema.optional().nullable(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type TimelineRequest = z.infer<typeof TimelineRequestSchema>;

export const AIBudgetResponseSchema = z.object({
  allocations: z.array(
    z.object({
      category: BudgetCategoryEnum,
      percentage: z.number().min(0).max(100),
      reasoning: z.string().min(1),
    })
  ),
  summary: z.string().min(1),
});

export type AIBudgetResponse = z.infer<typeof AIBudgetResponseSchema>;

export const AIWhatIfDeltaSchema = z.object({
  budgetMultiplier: z.number().optional().nullable(),
  newGuestCount: z.number().optional().nullable(),
  newEventDate: z.string().optional().nullable(),
  categoryAdjustments: z.record(z.number()).optional().nullable(),
});

export const AIWhatIfResponseSchema = z.object({
  delta: AIWhatIfDeltaSchema,
  options: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      allocations: z.array(
        z.object({
          category: BudgetCategoryEnum,
          percentage: z.number(),
          reasoning: z.string(),
        })
      ),
    })
  ),
  tradeOffExplanation: z.string(),
});

export type AIWhatIfResponse = z.infer<typeof AIWhatIfResponseSchema>;

export const AIVendorItemSchema = z
  .object({
    vendorName: z.string().default('Vendor'),
    vendorType: VendorTypeEnum.default('other'),
    totalPrice: z.number().nullable().default(null),
    pricePerUnit: z.number().nullable().default(null),
    unitDescription: z.string().default(''),
    included: z.array(z.string()).default([]),
    notIncluded: z.array(z.string()).default([]),
    guestsCovered: z.number().nullable().default(null),
    extraCharges: z.array(z.string()).default([]),
    advanceRequested: z.number().nullable().default(null),
    advancePercentage: z.number().nullable().default(null),
    cancellationTerms: z.string().default(''),
    missingInfo: z.array(z.string()).default([]),
    // Compatibility fields for ExtractedQuote & rule engines
    perUnitPrice: z.number().default(0),
    unitType: z.enum(['per_plate', 'per_day', 'per_event', 'lump_sum']).default('lump_sum'),
    baseGuests: z.number().default(100),
    fixedCharges: z.number().default(0),
    fixedChargesBreakdown: z.array(z.object({ name: z.string(), amount: z.number() })).default([]),
    taxPercentage: z.number().nullable().default(null),
    taxAmountStated: z.number().nullable().default(null),
    taxIncludedInBase: z.boolean().default(false),
    paymentMode: z.string().default('Bank transfer / UPI'),
    writtenAgreementMentioned: z.boolean().default(false),
    ambiguities: z.array(z.string()).default([]),
    potentialHiddenCosts: z.array(z.string()).default([]),
  })
  .passthrough();

export const AIRedFlagItemSchema = z
  .object({
    vendorIndex: z.number().default(0),
    severity: z.enum(['low', 'medium', 'high']).default('medium'),
    title: z.string().default('Notice'),
    message: z.string().default(''),
  })
  .passthrough();

export const AIVendorQuoteSchema = z.object({
  vendors: z.array(AIVendorItemSchema).default([]),
  aiRedFlags: z.array(AIRedFlagItemSchema).default([]),
});

export const AITimelineTaskItemSchema = z
  .object({
    id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
    title: z.string(),
    description: z.string().default(''),
    deadline: z.string().default(() => new Date().toISOString()),
    dependsOn: z.array(z.string()).default([]),
    completed: z.boolean().default(false),
    delayed: z.boolean().default(false),
    atRisk: z.boolean().default(false),
    category: z.string().default('misc'),
  })
  .passthrough();

export const AITimelineResponseSchema = z.object({
  tasks: z.array(AITimelineTaskItemSchema).default([]),
});

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
  perUnitPrice: z.number().nullable(),
  unitType: z.string(),
  baseGuests: z.number().nullable(),
  fixedCharges: z.number().min(0).default(0),
  fixedChargesBreakdown: z.array(ExtractedChargeItemSchema).default([]),
  extraCharges: z.array(ExtractedChargeItemSchema).default([]),
  taxPercentage: z.number().nullable(),
  taxAmountStated: z.number().nullable(),
  taxIncludedInBase: z.boolean().default(false),
  advanceRequested: z.number().nullable(),
  advancePercentage: z.number().nullable(),
  cancellationTerms: z.string().default('Not mentioned'),
  paymentMode: z.string().default('Not specified'),
  writtenAgreementMentioned: z.boolean().default(false),
  included: z.array(z.string()).default([]),
  notIncluded: z.array(z.string()).default([]),
  ambiguities: z.array(z.string()).default([]),
  potentialHiddenCosts: z.array(z.string()).default([]),
  aiFlags: z
    .array(
      z.object({
        severity: z.enum(['low', 'medium', 'high']),
        title: z.string(),
        message: z.string(),
      })
    )
    .default([]),
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

export const WhatIfRequestSchema = z.object({
  changeDescription: z.string().transform(sanitize).pipe(z.string().min(1).max(500)),
  currentPlan: z.any(),
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
  budgetCategory: z.any().optional(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type VendorQuoteRequest = z.infer<typeof VendorQuoteRequestSchema>;

export const TimelineRequestSchema = z.object({
  intake: IntakeRequestSchema,
  budgetPlan: z.any(),
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

export const AIVendorQuoteSchema = z.object({
  vendors: z.array(z.any()),
  aiRedFlags: z.array(z.any()),
});

export const AITimelineResponseSchema = z.object({
  tasks: z.array(z.any()),
});

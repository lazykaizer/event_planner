/**
 * Zod schemas for validating user input and AI responses.
 *
 * Two categories:
 * 1. **Request schemas** — validate user-supplied data before processing.
 * 2. **AI response schemas** — validate JSON returned by Gemini so we never
 *    trust unstructured output.
 */

import { z } from 'zod';
import { BUDGET_CATEGORIES, PRIORITY_ITEMS, BudgetCategory } from '@/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Strip HTML tags and trim whitespace. */
function sanitize(val: string): string {
  return val.replace(/<[^>]*>/g, '').trim();
}

export const BudgetCategoryEnum = z.enum(BUDGET_CATEGORIES);
export const PriorityItemEnum = z.enum(PRIORITY_ITEMS);

/* ------------------------------------------------------------------ */
/*  Request Schemas                                                   */
/* ------------------------------------------------------------------ */

export const IntakeRequestSchema = z.object({
  occasion: z.enum(['wedding', 'engagement', 'birthday', 'griha_pravesh', 'other']),
  budget: z
    .number()
    .int('Budget must be a whole number')
    .min(1, 'Budget must be at least ₹1')
    .max(1_000_000_000, 'Budget cannot exceed ₹100 crore'),
  guestCount: z
    .number()
    .int('Guest count must be a whole number')
    .min(1, 'At least 1 guest is required')
    .max(5000, 'Guest count cannot exceed 5,000'),
  city: z
    .string()
    .transform(sanitize)
    .pipe(z.string().min(1, 'City is required').max(100, 'City name too long')),
  eventDate: z.string().refine(
    (val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    },
    { message: 'Event date must be today or in the future' }
  ),
  style: z.enum(['intimate', 'traditional', 'grand']),
  priorities: z
    .array(PriorityItemEnum)
    .min(1, 'At least one priority is required')
    .max(PRIORITY_ITEMS.length),
  mustHaves: z
    .string()
    .transform(sanitize)
    .pipe(z.string().max(2000, 'Must-haves text too long'))
    .optional()
    .default(''),
  culturalNotes: z
    .string()
    .transform(sanitize)
    .pipe(z.string().max(2000, 'Cultural notes text too long'))
    .optional()
    .default(''),
  language: z.enum(['en', 'hi']).default('en'),
});

export type IntakeRequest = z.infer<typeof IntakeRequestSchema>;

export const WhatIfRequestSchema = z.object({
  changeDescription: z
    .string()
    .transform(sanitize)
    .pipe(z.string().min(1, 'Describe the change').max(500, 'Change description too long')),
  currentPlan: z.object({
    totalBudget: z.number().positive(),
    allocations: z.array(
      z.object({
        category: BudgetCategoryEnum,
        percentage: z.number().min(0).max(100),
        amount: z.number().min(0),
        reasoning: z.string(),
        isManualOverride: z.boolean(),
      })
    ),
    summary: z.string(),
    createdAt: z.string(),
    version: z.number().int().min(0),
  }),
  intake: IntakeRequestSchema,
  language: z.enum(['en', 'hi']).default('en'),
});

export type WhatIfRequest = z.infer<typeof WhatIfRequestSchema>;

export const VendorQuoteRequestSchema = z.object({
  quotes: z
    .array(
      z.object({
        text: z
          .string()
          .transform(sanitize)
          .pipe(z.string().min(1, 'Quote text is required').max(8000, 'Quote text too long (max 8,000 chars)')),
        vendorType: z.enum(['caterer', 'decorator', 'photographer', 'venue', 'other']).optional(),
      })
    )
    .min(1, 'At least 1 quote is required')
    .max(5, 'Maximum 5 quotes at a time'),
  budgetCategory: z
    .object({
      category: BudgetCategoryEnum,
      amount: z.number().min(0),
    })
    .optional(),
  language: z.enum(['en', 'hi']).default('en'),
});

export type VendorQuoteRequest = z.infer<typeof VendorQuoteRequestSchema>;

export const TimelineRequestSchema = z.object({
  intake: IntakeRequestSchema,
  budgetPlan: z.object({
    totalBudget: z.number().positive(),
    allocations: z.array(z.any()),
    summary: z.string(),
    createdAt: z.string(),
    version: z.number().int().min(0),
  }),
  language: z.enum(['en', 'hi']).default('en'),
});

export type TimelineRequest = z.infer<typeof TimelineRequestSchema>;

/* ------------------------------------------------------------------ */
/*  AI Response Schemas                                               */
/* ------------------------------------------------------------------ */

/** AI returns percentage allocations; code computes rupee amounts. */
export const AIBudgetResponseSchema = z.object({
  allocations: z
    .array(
      z.object({
        category: BudgetCategoryEnum,
        percentage: z.number().min(0).max(100),
        reasoning: z.string().min(1),
      })
    )
    .refine(
      (allocs) => {
        const sum = allocs.reduce((s, a) => s + a.percentage, 0);
        return Math.abs(sum - 100) < 0.01;
      },
      { message: 'Allocation percentages must sum to 100' }
    ),
  summary: z.string().min(1),
});

export type AIBudgetResponse = z.infer<typeof AIBudgetResponseSchema>;

export const AIWhatIfDeltaSchema = z.object({
  budgetMultiplier: z.number().min(0.01).max(100).optional().nullable(),
  newGuestCount: z.number().int().min(1).max(5000).optional().nullable(),
  newEventDate: z.string().optional().nullable(),
  categoryAdjustments: z
    .record(z.number().min(-100).max(100))
    .optional()
    .nullable(),
});

export type AIWhatIfDelta = z.infer<typeof AIWhatIfDeltaSchema>;

export const AIWhatIfResponseSchema = z.object({
  delta: AIWhatIfDeltaSchema,
  options: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        description: z.string().min(1),
        allocations: z.array(
          z.object({
            category: BudgetCategoryEnum,
            percentage: z.number().min(0).max(100),
            reasoning: z.string(),
          })
        ),
      })
    )
    .min(1)
    .max(4),
  tradeOffExplanation: z.string().min(1),
});

export type AIWhatIfResponse = z.infer<typeof AIWhatIfResponseSchema>;

export const AIVendorQuoteSchema = z.object({
  vendors: z.array(
    z.object({
      vendorName: z.string(),
      vendorType: z.enum(['caterer', 'decorator', 'photographer', 'venue', 'other']),
      totalPrice: z.number().nullable(),
      pricePerUnit: z.number().nullable(),
      unitDescription: z.string(),
      included: z.array(z.string()),
      notIncluded: z.array(z.string()),
      guestsCovered: z.number().nullable(),
      extraCharges: z.array(z.string()),
      advanceRequested: z.number().nullable(),
      advancePercentage: z.number().nullable(),
      cancellationTerms: z.string(),
      missingInfo: z.array(z.string()),
    })
  ),
  aiRedFlags: z.array(
    z.object({
      vendorIndex: z.number().int().min(0),
      severity: z.enum(['low', 'medium', 'high']),
      message: z.string(),
    })
  ),
});

export type AIVendorQuoteResponse = z.infer<typeof AIVendorQuoteSchema>;

export const AITimelineResponseSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      deadline: z.string(),
      dependsOn: z.array(z.string()),
      category: z.string(),
    })
  ),
});

export type AITimelineResponse = z.infer<typeof AITimelineResponseSchema>;

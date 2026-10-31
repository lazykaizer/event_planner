/**
 * Core domain types for Shaadi Guardian.
 *
 * These types describe the application's data model: user intake, budget plans,
 * vendor quotes, timeline tasks, and what-if scenarios. They are intentionally
 * decoupled from the AI response schemas (see /lib/schemas.ts) so that
 * AI output is validated and mapped, never passed through raw.
 */

/* ------------------------------------------------------------------ */
/*  Enums & Literals                                                  */
/* ------------------------------------------------------------------ */

export type OccasionType =
  | 'wedding'
  | 'engagement'
  | 'birthday'
  | 'griha_pravesh'
  | 'other';

export type StylePreference = 'intimate' | 'traditional' | 'grand';

export type Language = 'en' | 'hi';

export type RiskLevel = 'low' | 'medium' | 'high';

/** Budget categories – order matters for UI display. */
export const BUDGET_CATEGORIES = [
  'venue',
  'catering',
  'decoration',
  'photography_video',
  'attire_jewellery',
  'invitations',
  'entertainment',
  'transport_stay',
  'contingency',
  'misc',
] as const;

export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

/** Human-readable labels for each budget category. */
export const CATEGORY_LABELS: Record<BudgetCategory, { en: string; hi: string }> = {
  venue:              { en: 'Venue',               hi: 'स्थान' },
  catering:           { en: 'Catering',            hi: 'खानपान' },
  decoration:         { en: 'Decoration',          hi: 'सजावट' },
  photography_video:  { en: 'Photography & Video', hi: 'फोटोग्राफी और वीडियो' },
  attire_jewellery:   { en: 'Attire & Jewellery',  hi: 'पोशाक और आभूषण' },
  invitations:        { en: 'Invitations',         hi: 'निमंत्रण' },
  entertainment:      { en: 'Entertainment',       hi: 'मनोरंजन' },
  transport_stay:     { en: 'Transport & Stay',    hi: 'परिवहन और ठहराव' },
  contingency:        { en: 'Contingency',         hi: 'आकस्मिक' },
  misc:               { en: 'Miscellaneous',       hi: 'विविध' },
};

/** Priority items the user can rank. */
export const PRIORITY_ITEMS = [
  'food',
  'decoration',
  'photography',
  'venue',
  'entertainment',
  'guest_comfort',
] as const;

export type PriorityItem = (typeof PRIORITY_ITEMS)[number];

/* ------------------------------------------------------------------ */
/*  User Intake                                                       */
/* ------------------------------------------------------------------ */

export interface UserIntake {
  occasion: OccasionType;
  /** Total budget in INR (positive integer). */
  budget: number;
  /** Number of guests (1–5000). */
  guestCount: number;
  /** City name, trimmed, 1-100 chars. */
  city: string;
  /** Event date — ISO-8601 string, must be today or later. */
  eventDate: string;
  style: StylePreference;
  /** Ordered list: index 0 = highest priority. */
  priorities: PriorityItem[];
  /** Optional free-text must-haves. Max 2000 chars. */
  mustHaves?: string;
  /** Optional cultural notes. Max 2000 chars. */
  culturalNotes?: string;
  /** UI language preference. */
  language: Language;
}

/* ------------------------------------------------------------------ */
/*  Budget Plan                                                       */
/* ------------------------------------------------------------------ */

export interface BudgetAllocation {
  category: BudgetCategory;
  /** Percentage (0–100). All percentages must sum to 100. */
  percentage: number;
  /** Amount in INR — computed by code, not AI. */
  amount: number;
  /** AI-provided one-line reasoning. */
  reasoning: string;
  /** Whether the user has manually overridden this amount. */
  isManualOverride: boolean;
}

export interface BudgetPlan {
  totalBudget: number;
  allocations: BudgetAllocation[];
  /** AI-provided summary text. */
  summary: string;
  /** Timestamp when this plan was created / last revised. */
  createdAt: string;
  /** Version counter. Incremented on every what-if revision. */
  version: number;
}

/* ------------------------------------------------------------------ */
/*  What-If                                                           */
/* ------------------------------------------------------------------ */

export interface WhatIfDelta {
  /** Natural-language description of the change. */
  description: string;
  /** Parsed structured change from AI. */
  budgetMultiplier?: number;
  newGuestCount?: number;
  newEventDate?: string;
  categoryAdjustments?: Partial<Record<BudgetCategory, number>>;
}

export interface WhatIfOption {
  id: string;
  title: string;
  description: string;
  allocations: BudgetAllocation[];
}

export interface WhatIfResult {
  beforePlan: BudgetPlan;
  afterOptions: WhatIfOption[];
  tradeOffExplanation: string;
}

export interface PlanHistoryEntry {
  plan: BudgetPlan;
  changeDescription: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Vendor                                                            */
/* ------------------------------------------------------------------ */

export type VendorType =
  | 'caterer'
  | 'decorator'
  | 'photographer'
  | 'venue'
  | 'other';

export interface VendorQuoteParsed {
  vendorName: string;
  vendorType: VendorType;
  totalPrice: number | null;
  pricePerUnit: number | null;
  unitDescription: string;
  included: string[];
  notIncluded: string[];
  guestsCovered: number | null;
  extraCharges: string[];
  advanceRequested: number | null;
  advancePercentage: number | null;
  cancellationTerms: string;
  missingInfo: string[];
}

export interface VendorRedFlag {
  ruleId: string;
  severity: RiskLevel;
  message: string;
  source: 'rule' | 'ai';
}

export interface VendorAnalysis {
  quote: VendorQuoteParsed;
  redFlags: VendorRedFlag[];
  overallRisk: RiskLevel;
  saferPaymentSchedule: string[];
  questionsToAsk: string[];
  getInWriting: string[];
}

/* ------------------------------------------------------------------ */
/*  Timeline                                                          */
/* ------------------------------------------------------------------ */

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  /** ISO-8601 date string for the deadline. */
  deadline: string;
  /** IDs of tasks this depends on. */
  dependsOn: string[];
  /** Whether the user marked this complete. */
  completed: boolean;
  /** Whether the user marked this delayed. */
  delayed: boolean;
  /** Whether downstream recalc shows this task at risk. */
  atRisk: boolean;
  category: BudgetCategory | 'general';
}

export interface Timeline {
  tasks: TimelineTask[];
  /** AI note on what to do next when a task is delayed. */
  aiNote?: string;
}

/* ------------------------------------------------------------------ */
/*  App State (persisted to localStorage)                             */
/* ------------------------------------------------------------------ */

export interface AppState {
  intake: UserIntake | null;
  budgetPlan: BudgetPlan | null;
  planHistory: PlanHistoryEntry[];
  vendorAnalyses: VendorAnalysis[];
  timeline: Timeline | null;
  language: Language;
}

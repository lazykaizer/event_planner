/**
 * Core domain types for "Quote X-Ray" & Event Planning.
 */

/* ------------------------------------------------------------------ */
/*  Quote X-Ray Core Domain Types                                     */
/* ------------------------------------------------------------------ */

export type VendorType = 'caterer' | 'decorator' | 'venue' | 'photographer' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high';
export type Language = 'en' | 'hi';

/** Detailed item or line-item extracted from quote */
export interface QuoteItem {
  name: string;
  category?: string;
  included: boolean;
  notes?: string;
}

/** Raw extracted data from AI */
export interface ExtractedQuote {
  vendorName: string;
  vendorType: VendorType;
  /** Per-plate or per-unit rate in INR (if applicable) */
  perUnitPrice: number | null;
  unitType: string; // e.g. "per plate", "per day", "per hour"
  /** Baseline guest count mentioned in quote, if any */
  baseGuests: number | null;
  /** Fixed lump sum charges (e.g. venue hall rental, sound system setup) */
  fixedCharges: number;
  fixedChargesBreakdown: { name: string; amount: number }[];
  /** Extra charges mentioned with definite numbers */
  extraCharges: { name: string; amount: number }[];
  /** Percentage tax mentioned (e.g. 5% GST, 18% GST), null if not stated or included */
  taxPercentage: number | null;
  taxAmountStated: number | null;
  taxIncludedInBase: boolean;
  /** Advance requested */
  advanceRequested: number | null;
  advancePercentage: number | null;
  /** Cancellation and refund policies */
  cancellationTerms: string;
  paymentMode: string; // e.g. "Cash only", "Bank transfer", "Personal UPI"
  /** Written contract mentioned? */
  writtenAgreementMentioned: boolean;
  /** Deliverables explicitly included */
  included: string[];
  /** Deliverables explicitly NOT included */
  notIncluded: string[];
  /** Ambiguous or vague terms (e.g., "extra as per actuals", "generator fuel extra") */
  ambiguities: string[];
  /** Likely missing hidden charges that the user should be aware of */
  potentialHiddenCosts: string[];
  /** Verbatim evidence snippets copied directly from raw quote */
  evidence?: EvidenceSnippets;
  /** Verification status for each evidence snippet */
  verifiedEvidence?: {
    perUnitPrice?: { verified: boolean; snippet: string };
    fixedCharges?: { verified: boolean; snippet: string };
    advance?: { verified: boolean; snippet: string };
    taxes?: { verified: boolean; snippet: string };
    paymentMode?: { verified: boolean; snippet: string };
    cancellationTerms?: { verified: boolean; snippet: string };
  };
  /** Contextual red flags identified by AI */
  aiFlags?: {
    severity: RiskLevel;
    title: string;
    message: string;
  }[];
  /** Ready-to-copy WhatsApp negotiation messages */
  whatsappMessages?: {
    english: string;
    hinglish: string;
    hindi: string;
  };
}

export interface EvidenceSnippets {
  perUnitPrice?: string | null;
  fixedCharges?: string | null;
  advance?: string | null;
  taxes?: string | null;
  paymentMode?: string | null;
  cancellationTerms?: string | null;
}

/** Deterministic True Cost Calculation result */
export interface TrueCostCalculation {
  guestCount: number;
  perGuestComponent: number; // perUnitPrice * guestCount
  fixedComponent: number;    // fixedCharges + fixed extras
  taxesComponent: number;    // calculated tax amount
  contingencyComponent: number; // estimated allowance for ambiguous extras
  totalTrueCost: number;     // perGuestComponent + fixedComponent + taxesComponent
  totalCostWithContingency: number;
  formulaDescription: string;
  hasAmbiguities: boolean;
  estimatedCostRange: {
    min: number;
    max: number;
  };
}

export interface BilingualText {
  en: string;
  hi: string;
}

/** Individual Red-Flag item */
export interface RedFlag {
  ruleId: string;
  severity: RiskLevel;
  title: string | BilingualText;
  message: string | BilingualText;
  source: 'rule' | 'ai';
}

/** Full Analyzed Quote Report */
export interface QuoteAnalysisReport {
  id: string;
  createdAt: string;
  rawQuoteText: string;
  selectedVendorType: VendorType;
  guestCount: number;
  extracted: ExtractedQuote;
  trueCost: TrueCostCalculation;
  redFlags: RedFlag[];
  overallRisk: RiskLevel;
  saferPaymentPlan: (string | BilingualText)[];
  getInWritingChecklist: (string | BilingualText)[];
  questionsToAsk: string[];
  whatsappNegotiationMessage: {
    english: string;
    hinglish: string;
    hindi: string;
  };
}

/** Supporting Budget Context */
export interface SupportingBudgetPlan {
  totalBudget: number;
  guestCount: number;
}

/* ------------------------------------------------------------------ */
/*  Supporting / Shared Event & Budget Types                          */
/* ------------------------------------------------------------------ */

export type OccasionType =
  | 'wedding'
  | 'engagement'
  | 'birthday'
  | 'griha_pravesh'
  | 'other';

export type StylePreference = 'intimate' | 'traditional' | 'grand';

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

export const PRIORITY_ITEMS = [
  'food',
  'decoration',
  'photography',
  'venue',
  'entertainment',
  'guest_comfort',
] as const;

export type PriorityItem = (typeof PRIORITY_ITEMS)[number];

export interface UserIntake {
  occasion: OccasionType;
  budget: number;
  guestCount: number;
  city: string;
  eventDate: string;
  style: StylePreference;
  priorities: PriorityItem[];
  mustHaves?: string;
  culturalNotes?: string;
  language: Language;
}

export interface BudgetAllocation {
  category: BudgetCategory;
  percentage: number;
  amount: number;
  reasoning: string;
  isManualOverride: boolean;
}

export interface BudgetPlan {
  totalBudget: number;
  allocations: BudgetAllocation[];
  summary: string;
  createdAt: string;
  version: number;
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

export type VendorRedFlag = RedFlag;

export interface VendorAnalysis {
  quote: VendorQuoteParsed;
  redFlags: VendorRedFlag[];
  overallRisk: RiskLevel;
  saferPaymentSchedule: (string | BilingualText)[];
  questionsToAsk: string[];
  getInWriting: (string | BilingualText)[];
}

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  deadline: string;
  dependsOn: string[];
  completed: boolean;
  delayed: boolean;
  atRisk: boolean;
  category: BudgetCategory | 'general';
}

export interface Timeline {
  tasks: TimelineTask[];
  aiNote?: string;
}

export interface AppState {
  intake: UserIntake | null;
  budgetPlan: BudgetPlan | null;
  planHistory: PlanHistoryEntry[];
  vendorAnalyses: VendorAnalysis[];
  timeline: Timeline | null;
  language: Language;
}

/**
 * Deterministic Red-Flag Rules for Quote X-Ray.
 *
 * Rules run BEFORE AI analysis. Each rule inspects the quote
 * data and flags known traps common in the Indian wedding and event vendor ecosystem.
 *
 * All rule titles, messages, and checklist items are bilingual { en, hi }.
 */

import type { ExtractedQuote, VendorQuoteParsed, RedFlag, RiskLevel, BilingualText } from '@/types';

type AnyQuote = ExtractedQuote | VendorQuoteParsed;

function isExtracted(q: AnyQuote): q is ExtractedQuote {
  return 'fixedCharges' in q;
}

export interface RedFlagRule {
  id: string;
  title: BilingualText;
  check: (quote: AnyQuote, rawText?: string) => RedFlag | null;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  // 1. Advance > 50% = High Risk
  {
    id: 'advance_above_50',
    title: {
      en: 'Unusually High Advance Deposit (>50%)',
      hi: 'अत्यधिक एडवांस मांग (>50% जोखिम)',
    },
    check: (q) => {
      if (q.advancePercentage !== null && q.advancePercentage > 50 && q.advancePercentage < 100) {
        return {
          ruleId: 'advance_above_50',
          severity: 'high',
          title: {
            en: 'Unusually High Advance Deposit (>50%)',
            hi: 'अत्यधिक एडवांस मांग (>50% जोखिम)',
          },
          message: {
            en: `The vendor demands a ${q.advancePercentage}% deposit upfront. Market norm for wedding vendors is 20%–25%. Paying more than 50% leaves families with zero leverage if service is subpar.`,
            hi: `वेंडर काम शुरू करने से पहले ही ${q.advancePercentage}% एडवांस मांग रहा है। शादी-ब्याह में सामान्य एडवांस 20%–25% होता है। 50% से अधिक पहले देने पर यदि सेवा खराब रही तो पैसे फंसने का बड़ा जोखिम रहता है।`,
          },
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 2. Advance > 30% (and <= 50%) = Medium Risk
  {
    id: 'advance_above_30',
    title: {
      en: 'Above-Average Advance Deposit (30%–50%)',
      hi: 'सामान्य से अधिक एडवांस (30%–50%)',
    },
    check: (q) => {
      if (q.advancePercentage !== null && q.advancePercentage > 30 && q.advancePercentage <= 50) {
        return {
          ruleId: 'advance_above_30',
          severity: 'medium',
          title: {
            en: 'Above-Average Advance Deposit (30%–50%)',
            hi: 'सामान्य से अधिक एडवांस (30%–50%)',
          },
          message: {
            en: `An advance of ${q.advancePercentage}% is higher than the standard 20%–25% booking deposit. Negotiate down to 20% upon signing, with subsequent payments tied to tangible milestones.`,
            hi: `${q.advancePercentage}% का एडवांस सामान्य 20%–25% से अधिक है। बुकिंग के समय 20% पर बातचीत करें और बाकी भुगतान काम के चरणों के अनुसार तय करें।`,
          },
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 3. Full 100% Prepayment = High Risk
  {
    id: 'full_prepayment',
    title: {
      en: '100% Full Prepayment Demanded',
      hi: '100% पूरा अग्रिम भुगतान मांगा गया (गंभीर जोखिम)',
    },
    check: (q) => {
      if (q.advancePercentage === 100) {
        return {
          ruleId: 'full_prepayment',
          severity: 'high',
          title: {
            en: '100% Full Prepayment Demanded',
            hi: '100% पूरा अग्रिम भुगतान मांगा गया (गंभीर जोखिम)',
          },
          message: {
            en: 'The vendor requests 100% full payment before the celebration day. This is a severe red flag. Always retain at least 15%–20% payable 24–48 hours after satisfactory service completion.',
            hi: 'वेंडर कार्यक्रम से पहले ही 100% पूरा भुगतान मांग रहा है। यह बहुत बड़ा जोखिम है। काम संतोषजनक पूरा होने के बाद के लिए हमेशा 15%–20% राशि रोक कर रखें।',
          },
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 4. No Written Agreement Mentioned = Warning (Medium Risk)
  {
    id: 'no_written_agreement',
    title: {
      en: 'No Service Agreement / GST Invoice',
      hi: 'लिखित अनुबंध / पक्के बिल का अभाव',
    },
    check: (q) => {
      let isMissing = false;
      if (isExtracted(q)) {
        isMissing = !q.writtenAgreementMentioned;
      } else {
        const text = [q.cancellationTerms, ...q.included, ...q.notIncluded, ...q.extraCharges].join(' ').toLowerCase();
        isMissing = !(text.includes('contract') || text.includes('agreement') || text.includes('invoice') || text.includes('written'));
      }

      if (isMissing) {
        return {
          ruleId: 'no_written_agreement',
          severity: 'medium',
          title: {
            en: 'No Service Agreement / GST Invoice',
            hi: 'लिखित अनुबंध / पक्के बिल का अभाव',
          },
          message: {
            en: 'No formal written agreement or itemized contract was mentioned. Verbal WhatsApp promises frequently lead to disputes over promised quantities and staff coverage.',
            hi: 'कोटेशन में किसी लिखित अनुबंध या पक्के बिल का कोई जिक्र नहीं है। केवल मौखिक या व्हाट्सएप वादों से अंतिम समय में मेन्यू और स्टाफ को लेकर विवाद हो सकते हैं।',
          },
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 5. Cash or Personal UPI Only = Warning (Medium Risk)
  {
    id: 'cash_or_personal_upi',
    title: {
      en: 'Cash or Personal UPI Payment Traps',
      hi: 'नकद या व्यक्तिगत UPI भुगतान का जोखिम',
    },
    check: (q) => {
      const mode = (isExtracted(q) ? q.paymentMode : q.extraCharges.join(' ')).toLowerCase();
      const isCash = mode.includes('cash');
      const isPersonalUpi = mode.includes('personal') || mode.includes('sharma') || mode.includes('individual') || mode.includes('gpay');
      if (isCash || isPersonalUpi) {
        return {
          ruleId: 'cash_or_personal_upi',
          severity: 'medium',
          title: {
            en: 'Cash or Personal UPI Payment Traps',
            hi: 'नकद या व्यक्तिगत UPI भुगतान का जोखिम',
          },
          message: {
            en: 'The quote suggests cash payment or personal UPI transfers. This eliminates audit trails, chargeback protection, and GST invoice validity.',
            hi: 'वेंडर नकद या व्यक्तिगत UPI में भुगतान मांग रहा है। इससे कोई पक्का कानूनी प्रमाण नहीं रहता और समस्या होने पर पैसे वापस पाना कठिन हो जाता है।',
          },
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 6. "Free Venue" plus Per-Head Fees = Hidden-Charge Warning
  {
    id: 'free_venue_with_per_head',
    title: {
      en: '"Free Venue" Marketing Trap',
      hi: '"मुफ्त वेन्यू / हॉल" का झांसा',
    },
    check: (q) => {
      const allIncluded = q.included.join(' ').toLowerCase();
      const hasFreeVenue = allIncluded.includes('free venue') || allIncluded.includes('venue free') || allIncluded.includes('complimentary hall');
      const unitType = (isExtracted(q) ? q.unitType : q.unitDescription).toLowerCase();
      const unitPrice = isExtracted(q) ? q.perUnitPrice : q.pricePerUnit;
      const hasPerHead = (unitPrice !== null && unitPrice !== undefined && unitPrice > 0) ||
                        unitType.includes('plate') || unitType.includes('head');

      if (hasFreeVenue && hasPerHead) {
        return {
          ruleId: 'free_venue_with_per_head',
          severity: 'medium',
          title: {
            en: '"Free Venue" Marketing Trap',
            hi: '"मुफ्त वेन्यू / हॉल" का झांसा',
          },
          message: {
            en: 'Offers of a "free lawn/banquet hall" tied to per-plate catering usually hide venue rental fees inside inflated food rates, and frequently slap extra charges for cleaning, generator, and air-conditioning.',
            hi: 'कैटरिंग के साथ "वेन्यू मुफ्त" का दावा अक्सर छलावा होता है। वेन्यू का किराया खाने की प्लेट में जोड़ दिया जाता है और बाद में सफाई, एसी और जनरेटर के भारी बिल थमा दिए जाते हैं।',
          },
          source: 'rule',
        };
      }
      return null;
    },
  },

  // 7. No Refund or Cancellation Terms = Warning (Medium Risk)
  {
    id: 'no_refund_terms',
    title: {
      en: 'Missing or Non-Refundable Cancellation Clause',
      hi: 'रिफंड नीति का अभाव या गैर-वापसी शर्त',
    },
    check: (q) => {
      const terms = (q.cancellationTerms || '').trim().toLowerCase();
      if (!terms || terms === 'not mentioned' || terms === 'none' || terms === 'n/a' || terms === 'no refund') {
        const isNoRefund = terms === 'no refund';
        return {
          ruleId: 'no_refund_terms',
          severity: 'medium',
          title: {
            en: 'Missing or Non-Refundable Cancellation Clause',
            hi: 'रिफंड नीति का अभाव या गैर-वापसी शर्त',
          },
          message: {
            en: isNoRefund
              ? 'The vendor enforces a strict "No Refund" policy under any condition. If wedding dates shift, your entire deposit is forfeited.'
              : 'No clear cancellation policy stated. Always clarify refund percentages in writing for notice given 30 or 60 days before the event.',
            hi: isNoRefund
              ? 'वेंडर ने किसी भी स्थिति में रिफंड न देने (No Refund) की शर्त रखी है। तारीख बदलने पर पूरा एडवांस डूब सकता है।'
              : 'कोटेशन में तारीख रद्द करने पर रिफंड की कोई स्पष्ट शर्त नहीं है। 30 या 60 दिन पहले सूचित करने पर रिफंड की शर्त लिखित में तय करें।',
          },
          source: 'rule',
        };
      }
      return null;
    },
  },
];

/**
 * Runs all deterministic rules against an extracted quote.
 */
export function checkRedFlags(quote: AnyQuote, rawText?: string): RedFlag[] {
  const flags: RedFlag[] = [];
  for (const rule of RED_FLAG_RULES) {
    const flag = rule.check(quote, rawText);
    if (flag) {
      flags.push(flag);
    }
  }
  return flags;
}

/**
 * Determines overall risk score:
 * - 'high' if ANY high flag exists
 * - 'medium' if at least one medium flag exists
 * - 'low' otherwise
 */
export function computeOverallRisk(flags: RedFlag[]): RiskLevel {
  if (flags.some((f) => f.severity === 'high')) return 'high';
  if (flags.filter((f) => f.severity === 'medium').length >= 1) return 'medium';
  return 'low';
}

/**
 * Standard milestone-based payment schedule in bilingual format { en, hi }
 */
export const STANDARD_SAFE_PAYMENT_SCHEDULE: BilingualText[] = [
  {
    en: '20%–25% advance upon signing a written, itemized service contract',
    hi: 'लिखित और मदवार अनुबंध पर हस्ताक्षर करते समय 20%–25% अग्रिम बुकिंग राशि',
  },
  {
    en: '30% midway milestone (after menu tasting, decor 3D mock-up, or schedule confirmation)',
    hi: '30% बीच का पड़ाव (मेन्यू चखने, 3D सजावट डिज़ाइन या तारीख पक्की होने के बाद)',
  },
  {
    en: '30% on the event morning / setup arrival at the venue',
    hi: '30% कार्यक्रम की सुबह जब टीम और सामग्री वेन्यू पर पहुंच जाए',
  },
  {
    en: '15%–20% final settlement 24–48 hours AFTER the event (only upon full satisfaction and return of undamaged goods)',
    hi: '15%–20% अंतिम हिसाब कार्यक्रम के 24–48 घंटे बाद (पूरी संतुष्टि और सही-सलामत काम के बाद)',
  },
];

export function generateSafePaymentSchedule(_quote?: AnyQuote): BilingualText[] {
  return STANDARD_SAFE_PAYMENT_SCHEDULE;
}

export const suggestPaymentSchedule = generateSafePaymentSchedule;

/**
 * Essential "Get This in Writing" checklist in bilingual format { en, hi }
 */
export const COMMON_CHECKLIST_ITEMS: BilingualText[] = [
  {
    en: 'Official GST registered invoice with business PAN and registered address',
    hi: 'व्यावसायिक पैन और पंजीकृत पते के साथ आधिकारिक जीएसटी चालान / पक्का बिल',
  },
  {
    en: 'Clear milestone payment schedule with dates (never 100% upfront)',
    hi: 'तारीखों के साथ स्पष्ट चरणबद्ध भुगतान अनुसूची (कभी भी 100% पहले न दें)',
  },
  {
    en: 'Written cancellation and refund clause with notice timeframes',
    hi: 'समय-सीमा के साथ लिखित रद्दीकरण और धन-वापसी (रिफंड) की स्पष्ट शर्त',
  },
  {
    en: 'Backup staffing and equipment replacement guarantee if primary team falls sick',
    hi: 'मुख्य टीम या उपकरण खराब होने पर तुरंत बैकअप स्टाफ की लिखित गारंटी',
  },
];

export const CATEGORY_CHECKLIST_ITEMS: Record<string, BilingualText[]> = {
  caterer: [
    {
      en: 'Guaranteed minimum plate count vs actual plate audit counter mechanism',
      hi: 'न्यूनतम प्लेट गारंटी और कार्यक्रम में प्लेट गिनने की पारदर्शी व्यवस्था',
    },
    {
      en: 'Leftover food policy (packed and handed to family in clean containers)',
      hi: 'बचा हुआ खाना साफ डिब्बों में पैक करके परिवार को सौंपने की स्पष्ट नीति',
    },
    {
      en: 'Uniformed waitstaff count and supervisor ratio included',
      hi: 'वर्दीधारी वेटर और सुपरवाइजरों की तय संख्या बिना किसी अतिरिक्त शुल्क के',
    },
    {
      en: 'Disposal, trash clearance, and cleaning responsibility at the venue',
      hi: 'वेन्यू पर कचरा निस्तारण और रसोई की सफाई की पूरी जिम्मेदारी',
    },
  ],
  decorator: [
    {
      en: 'Fresh flower specifications (e.g. fresh Marigolds/Roses vs artificial silk flowers)',
      hi: 'असली ताजे फूल (गेंदा/गुलाब) बनाम नकली कृत्रिम फूलों का स्पष्ट विवरण',
    },
    {
      en: 'Exact setup completion time (e.g. 4 hours before guest arrival)',
      hi: 'सजावट पूरी होने का निश्चित समय (उदा. मेहमानों के आने से 4 घंटे पहले)',
    },
    {
      en: 'Generator and power backup responsibility for stage lighting and truss',
      hi: 'स्टेज की रोशनी और ट्रस के लिए जनरेटर व बिजली बैकअप की जिम्मेदारी',
    },
    {
      en: 'Breakage penalty terms explicitly stated',
      hi: 'सामान टूटने-फूटने पर जुर्माने की शर्तें पहले से लिखित में तय हों',
    },
  ],
  photographer: [
    {
      en: 'Exact deliverable counts (e.g. minimum 350 edited photos, 3-minute teaser, 30-minute film)',
      hi: 'तय फोटो-वीडियो संख्या (उदा. 350 एडिटेड फोटो, 3 मिनट का टीज़र, 30 मिनट की मुख्य फिल्म)',
    },
    {
      en: 'Delivery deadline in writing (e.g. raw footage within 7 days, album in 45 days)',
      hi: 'डिलीवरी की समय-सीमा (7 दिन में रॉ फुटेज, 45 दिन में फाइनल एल्बम)',
    },
    {
      en: 'Photographer seniority: guarantee of primary lead shooter vs junior interns',
      hi: 'मुख्य अनुभवी फोटोग्राफर के आने की गारंटी (जूनियर या इंटर्न नहीं)',
    },
    {
      en: 'Drone permission and drone pilot licensing',
      hi: 'ड्रोन उड़ाने की अनुमति और लाइसेंस की जिम्मेदारी',
    },
  ],
  venue: [
    {
      en: 'AC operating hours and temperature guarantee',
      hi: 'एसी (AC) चलने के निश्चित घंटे और तापमान की गारंटी',
    },
    {
      en: 'Generator diesel fuel charges: inclusive or billed separately?',
      hi: 'जनरेटर का डीजल शुल्क: पैकेज में शामिल है या अलग से बिल बनेगा?',
    },
    {
      en: 'Rooms provided with clean linens, working hot water, and key handovers',
      hi: 'कमरों में साफ चादरें, गर्म पानी और चाबियों के समय पर सौंपने की व्यवस्था',
    },
    {
      en: 'Corkage, DJ royalty, and outside vendor entry fee policy',
      hi: 'डीजे रॉयल्टी और बाहर के वेंडरों की एंट्री फीस से जुड़े नियम',
    },
  ],
};

export function generateInWritingChecklist(vendorType: string): BilingualText[] {
  const specific = CATEGORY_CHECKLIST_ITEMS[vendorType] || CATEGORY_CHECKLIST_ITEMS.caterer;
  return [...COMMON_CHECKLIST_ITEMS, ...specific];
}

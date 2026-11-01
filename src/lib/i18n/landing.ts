import type { Language } from '@/types';

export interface LandingCopy {
  nav: {
    howItWorks: string;
    liveDemo: string;
    features: string;
    faq: string;
    ctaButton: string;
  };
  hero: {
    badge: string;
    headline: string;
    subline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustLine: string;
    exampleBadge: string;
    whatsappSender: string;
    chipTrueCost: string;
    chipHiddenCosts: string;
    chipRiskHigh: string;
  };
  problem: {
    heading: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    footnote: string;
  };
  marquee: string[];
  howItWorks: {
    heading: string;
    subline: string;
    steps: {
      number: string;
      title: string;
      desc: string;
    }[];
  };
  demo: {
    badge: string;
    heading: string;
    subline: string;
    quoteTitle: string;
    guestSliderLabel: string;
    trueCostLabel: string;
    formulaLabel: string;
    riskLabel: string;
    riskStatus: string;
    flagsTitle: string;
    flag1: string;
    flag2: string;
    flag3: string;
    demoNote: string;
    ctaButton: string;
  };
  bento: {
    heading: string;
    subline: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    card4Title: string;
    card4Desc: string;
    card5Title: string;
    card5Desc: string;
    card6Title: string;
    card6Desc: string;
    plannerTitle: string;
    plannerDesc: string;
  };
  trustSplit: {
    heading: string;
    subline: string;
    tagline: string;
    aiTitle: string;
    aiPoints: string[];
    codeTitle: string;
    codePoints: string[];
  };
  faq: {
    heading: string;
    subline: string;
    items: { q: string; a: string }[];
  };
  finalCta: {
    headline: string;
    subline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    disclaimer: string;
  };
}

export const LANDING_CONTENT: Record<Language, LandingCopy> = {
  en: {
    nav: {
      howItWorks: 'How it works',
      liveDemo: 'Live demo',
      features: 'Features',
      faq: 'FAQ',
      ctaButton: 'X-Ray a Quote',
    },
    hero: {
      badge: 'Zero-Inflation Wedding Financial Protection',
      headline: "Don't pay the advance until you've X-Rayed the quote.",
      subline:
        'Paste any messy WhatsApp vendor quote. See the real all-in cost, uncover hidden charges, and check financial risk before you pay.',
      ctaPrimary: 'X-Ray a vendor quote',
      ctaSecondary: 'Plan my event budget',
      trustLine: 'Free to try · AI explains, code calculates · Works in English and Hindi',
      exampleBadge: 'Example Live Analysis',
      whatsappSender: 'Sharma Ji Caterers (WhatsApp Quote)',
      chipTrueCost: 'True all-in cost',
      chipHiddenCosts: 'Hidden extras flagged: 3',
      chipRiskHigh: 'Risk: HIGH (60% Advance)',
    },
    problem: {
      heading: 'Where Indian wedding budgets go wrong',
      card1Title: 'The budget that quietly grows',
      card1Desc:
        'Small unpriced items and overlooked add-ons accumulate, causing celebratory budgets to overrun by 20% to 30%.',
      card2Title: 'The advance that vanishes',
      card2Desc:
        'Demands for 50%+ upfront advances paid via personal UPI without milestone agreements leave families vulnerable if issues arise.',
      card3Title: 'The quote that hides charges',
      card3Desc:
        'An attractive per-plate quote looks affordable until generator fuel, crockery cleaning, and labor charges appear on the final night.',
      footnote: 'Based on commonly reported experiences; figures vary.',
    },
    marquee: [
      'Caterers',
      'Decorators',
      'Wedding Venues & Lawns',
      'Photographers & Cinematographers',
      'DJ & Sound Engineers',
      'Bridal Mehendi',
      'Makeup & Hair Stylists',
      'Band, Baaja & Lights',
    ],
    howItWorks: {
      heading: 'How Quote X-Ray protects your family',
      subline: 'Four simple, transparent steps to safeguard every rupee before paying deposits.',
      steps: [
        {
          number: '1',
          title: 'Paste the quote',
          desc: 'Copy any messy WhatsApp forward, email note, or vendor estimate into the box.',
        },
        {
          number: '2',
          title: 'See the real cost',
          desc: 'Deterministic math computes all-in pricing with fixed fees, taxes, and live guest scaling.',
        },
        {
          number: '3',
          title: 'Spot the red flags',
          desc: 'Catch excessive advances, cash-only risks, missing GST, and vague "actuals" clauses.',
        },
        {
          number: '4',
          title: 'Send a polite reply',
          desc: 'Get a culturally respectful WhatsApp negotiation reply with safe milestone payment terms.',
        },
      ],
    },
    demo: {
      badge: 'Interactive Live Demo (No Login · No AI Call)',
      heading: 'See how the calculation engine works in real time',
      subline: 'Slide the guest count below to see how deterministic code instantly calculates true cost and flags predatory terms.',
      quoteTitle: 'Sample Hinglish Caterer Quote (Read-only)',
      guestSliderLabel: 'Guest Count',
      trueCostLabel: 'Deterministic True Cost',
      formulaLabel: 'Calculated in code (plate × guests + fixed fees + taxes)',
      riskLabel: 'Deterministic Risk Level',
      riskStatus: 'HIGH RISK (Predatory Advance & Vague Fuel)',
      flagsTitle: 'Rules Triggered on Sample Quote:',
      flag1: 'Advance requested is 60% (Safe standard is 20-25%)',
      flag2: 'Cash/UPI payment requested with no written contract mentioned',
      flag3: 'Ambiguous "AC Generator diesel extra as per actuals" clause',
      demoNote: 'This demo uses real calculation code on a sample quote. Try your own quote with AI analysis.',
      ctaButton: 'X-Ray This Sample Quote with AI →',
    },
    bento: {
      heading: 'Built to give middle-class families complete clarity',
      subline: 'Every tool is engineered to protect life savings with zero financial ambiguity.',
      card1Title: 'True Cost Calculator',
      card1Desc: 'All-in cost computed in pure code with live guest count slider and formula audit.',
      card2Title: 'Hidden Charge Detector',
      card2Desc: 'Finds omitted generator diesel, waitstaff tips, and post-midnight surcharges.',
      card3Title: 'Risk Score & Red Flags',
      card3Desc: '7 strict deterministic rules scan for cash traps, predatory advances, and missing terms.',
      card4Title: 'Safe Payment Milestone Plan',
      card4Desc: 'Replaces lump-sum demands with a structured 20% / 50% / 15% / 15% payment schedule.',
      card5Title: 'WhatsApp Negotiation Generator',
      card5Desc: 'Polite, ready-to-send messages in Hinglish, English, or Hindi to negotiate terms with dignity.',
      card6Title: 'Compare Up to 3 Quotes',
      card6Desc: 'Side-by-side comparison with clear rationales for "Best Value" and "Safest Option".',
      plannerTitle: 'Full Celebration Financial Planner',
      plannerDesc: 'Need more than quote analysis? Access our AI Budget Breakdown, What-If Tradeoff Simulator, and Milestone Timeline.',
    },
    trustSplit: {
      heading: 'Where AI helps. Where code decides.',
      subline: 'Why families can trust Shaadi Guardian with life-event finances.',
      tagline: 'AI never invents a price.',
      aiTitle: 'AI reads and explains',
      aiPoints: [
        'Understands colloquial WhatsApp forwards and Hinglish spelling',
        'Extracts rate items, inclusions, exclusions, and ambiguities',
        'Frames investigative questions families should ask the vendor',
        'Drafts culturally adept, polite negotiation WhatsApp replies',
      ],
      codeTitle: 'Code calculates and checks',
      codePoints: [
        '100% of arithmetic is computed deterministically in TypeScript',
        'Live guest sliders scale costs with exact math formula',
        '7 strict deterministic red-flag rules check advance and payment traps',
        'Verifies extracted evidence strings directly against quote text',
      ],
    },
    faq: {
      heading: 'Frequently Asked Questions',
      subline: 'Honest answers to help you navigate vendor quotes safely.',
      items: [
        {
          q: 'Is this legal advice?',
          a: 'No. Quote X-Ray provides educational financial and contract risk guidance based on standard consumer protection practices. It is not formal legal counsel.',
        },
        {
          q: 'Does it confirm vendor prices or availability?',
          a: 'No. All amounts and totals are estimates based on your quote text and standard assumptions. Always verify final figures directly with your vendor.',
        },
        {
          q: 'Is my quote or personal data stored?',
          a: 'Quotes analyzed on the web app are processed transiently in memory by Google Gemini and stored only in your browser’s localStorage. We do not sell your vendor data.',
        },
        {
          q: 'Which languages are supported?',
          a: 'The full user interface is available in English and Hindi. The quote analyzer easily understands quotes written in English, Hindi, and colloquial Hinglish.',
        },
        {
          q: 'Is Quote X-Ray free to use?',
          a: 'Yes, Quote X-Ray and Shaadi Guardian are free to use for families planning weddings and milestone celebrations.',
        },
        {
          q: 'How accurate is the AI extraction?',
          a: 'Gemini handles semantic parsing while strict Zod schemas validate the output. Furthermore, our code verifies evidence snippets directly against your quote text so you can inspect where every number came from.',
        },
      ],
    },
    finalCta: {
      headline: 'Check the quote before you pay the advance.',
      subline: 'Avoid wedding budget creep, vanishing deposits, and awkward billing surprises on the wedding night.',
      ctaPrimary: 'X-Ray a vendor quote now',
      ctaSecondary: 'Plan my entire event',
      disclaimer: 'All amounts are estimates based on assumptions. Please confirm real prices with vendors. This is guidance, not legal advice.',
    },
  },
  hi: {
    nav: {
      howItWorks: 'यह कैसे काम करता है',
      liveDemo: 'लाइव डेमो',
      features: 'सुविधाएं',
      faq: 'सवाल-जवाब',
      ctaButton: 'कोट का एक्स-रे करें',
    },
    hero: {
      badge: 'शादी के बजट का विश्वसनीय वित्तीय संरक्षक',
      headline: 'कोटेशन का एक्स-रे किए बिना कभी भी एडवांस न दें!',
      subline:
        'WhatsApp पर मिला वेंडर का कच्चा कोटेशन यहाँ पेस्ट करें। एडवांस देने से पहले वास्तविक कुल खर्च, छिपे शुल्क और वित्तीय जोखिम तुरंत समझें।',
      ctaPrimary: 'वेंडर कोट का एक्स-रे करें',
      ctaSecondary: 'इवेंट बजट प्लान करें',
      trustLine: 'मुफ़्त आज़माएं · AI समझाएगा, कोड हिसाब लगाएगा · अंग्रेज़ी और हिंदी में उपलब्ध',
      exampleBadge: 'लाइव विश्लेषण का नमूना',
      whatsappSender: 'शर्मा जी कैटरर्स (WhatsApp कोटेशन)',
      chipTrueCost: 'वास्तविक कुल खर्च',
      chipHiddenCosts: 'संभावित छिपे शुल्क: 3',
      chipRiskHigh: 'जोखिम: उच्च (60% एडवांस)',
    },
    problem: {
      heading: 'भारतीय शादी का बजट कहाँ गड़बड़ाता है?',
      card1Title: 'चुपके से बढ़ता हुआ बजट',
      card1Desc:
        'छोटे-छोटे अघोषित खर्चे जुड़ते जाते हैं और शादी का बजट बिना किसी पूर्व सूचना के 20% से 30% तक बढ़ जाता है।',
      card2Title: 'डूबता हुआ भारी एडवांस',
      card2Desc:
        'बिना किसी लिखित अनुबंध के 50%+ एडवांस व्यक्तिगत UPI पर देने से विवाद की स्थिति में परिवार लाचार हो जाता है।',
      card3Title: 'छिपे हुए शुल्कों का झटका',
      card3Desc:
        'कम प्लेट रेट पहले अच्छा लगता है, लेकिन शादी की रात जनरेटर डीजल, बर्तन सफाई और लेबर चार्ज का अलग बिल थमा दिया जाता है।',
      footnote: 'आम अनुभवों के आधार पर; वास्तविक आंकड़े भिन्न हो सकते हैं।',
    },
    marquee: [
      'कैटरिंग व हलवाई',
      'टेंट व डेकोरेशन',
      'मैरिज हॉल व लॉन',
      'फोटोग्राफी व वीडियोग्राफी',
      'डीजे व साउंड सिस्टम',
      'दुल्हन मेहंदी आर्टिस्ट',
      'मेकअप व हेयर स्टाइलिस्ट',
      'बैंड बाजा व आतिशबाजी',
    ],
    howItWorks: {
      heading: 'Quote X-Ray 4 आसान चरणों में आपकी सुरक्षा करता है',
      subline: 'एडवांस देने से पहले हर एक रुपये को सुरक्षित रखने की पारदर्शी प्रक्रिया।',
      steps: [
        {
          number: '1',
          title: 'कोटेशन पेस्ट करें',
          desc: 'WhatsApp मैसेज या बिल का कच्चा टेक्स्ट बॉक्स में पेस्ट करें।',
        },
        {
          number: '2',
          title: 'वास्तविक खर्च देखें',
          desc: 'हमारा कोड निश्चित फॉर्मूले से मेहमानों की संख्या के अनुसार कुल खर्च निकालता है।',
        },
        {
          number: '3',
          title: 'जोखिम पहचानें',
          desc: '50%+ एडवांस के जाल, नकद मांग और छिपे जनरेटर चार्ज को तुरंत पकड़ें।',
        },
        {
          number: '4',
          title: 'सुरक्षित वार्ता करें',
          desc: 'वेंडर को भेजने के लिए सुरक्षित किस्तों वाला विनम्र WhatsApp संदेश पाएं।',
        },
      ],
    },
    demo: {
      badge: 'इंटरैक्टिव लाइव डेमो (बिना लॉगिन · बिना AI)',
      heading: 'देखें हमारा गणना कोड लाइव कैसे काम करता है',
      subline: 'नीचे मेहमान संख्या का स्लाइडर चलाकर देखें कि कैसे कोड तुरंत सही खर्च निकालता है और जोखिम पकड़ता है।',
      quoteTitle: 'नमूना हिंग्लिश कैटरर कोट (केवल पढ़ने हेतु)',
      guestSliderLabel: 'मेहमानों की संख्या',
      trueCostLabel: 'गणना किया गया वास्तविक खर्च',
      formulaLabel: 'पारदर्शी कोड सूत्र (प्लेट × मेहमान + स्थिर शुल्क + कर)',
      riskLabel: 'जोखिम स्तर',
      riskStatus: 'उच्च जोखिम (60% भारी एडवांस और अस्पष्ट डीजल)',
      flagsTitle: 'नमूने पर पकड़े गए नियम:',
      flag1: 'मांगा गया एडवांस 60% है (सुरक्षित सीमा केवल 20-25% है)',
      flag2: 'बिना किसी लिखित अनुबंध के नकद/UPI भुगतान की मांग',
      flag3: '"जनरेटर डीजल मीटर के अनुसार अलग" अस्पष्ट शर्त',
      demoNote: 'यह डेमो एक नमूने पर वास्तविक गणना कोड का उपयोग करता है। AI विश्लेषण के साथ अपना कोट आज़माएं।',
      ctaButton: 'इस नमूना कोट का AI एक्स-रे खोलें →',
    },
    bento: {
      heading: 'मध्यमवर्गीय परिवारों को वित्तीय सुरक्षा देने के लिए निर्मित',
      subline: 'हर फीचर आपके परिवार की गाढ़ी कमाई को बचाने के लिए डिज़ाइन किया गया है।',
      card1Title: 'ट्रू कॉस्ट कैलकुलेटर',
      card1Desc: 'लाइव गेस्ट स्लाइडर और गणितीय सूत्र के साथ पारदर्शी वास्तविक खर्च गणना।',
      card2Title: 'हिडन कॉस्ट डिटेक्टर',
      card2Desc: 'जनरेटर डीजल, वेटर बख्शीश और देर रात के एक्स्ट्रा चार्ज पहले ही खोजें।',
      card3Title: 'रिस्क स्कोर व रेड फ्लैग्स',
      card3Desc: '7 सख्त नियम नकद जालसाजी और भारी एडवांस के जोखिमों की पहचान करते हैं।',
      card4Title: 'सेफ पेमेंट प्लान',
      card4Desc: 'एकमुश्त एडवांस के बजाय 20% / 50% / 15% / 15% की सुरक्षित किस्तों की योजना।',
      card5Title: 'WhatsApp वार्ता संदेश',
      card5Desc: 'हिंग्लिश, अंग्रेज़ी और शुद्ध हिंदी में वेंडर को भेजने हेतु सम्मानजनक संदेश।',
      card6Title: '3 कोटेशनों की तुलना',
      card6Desc: '"सबसे किफ़ायती" और "सबसे सुरक्षित" विकल्पों के स्पष्ट कारण के साथ तुलना।',
      plannerTitle: 'सम्पूर्ण समारोह बजट संरक्षक',
      plannerDesc: 'क्या आपको पूरे बजट की योजना चाहिए? हमारे AI बजट आवंटन, व्हाट-इफ़ सिम्युलेटर और समय सारिणी का उपयोग करें।',
    },
    trustSplit: {
      heading: 'जहाँ AI समझता है, और कोड हिसाब लगाता है।',
      subline: 'परिवार अपनी जीवन भर की पूंजी के लिए Shaadi Guardian पर भरोसा क्यों करते हैं?',
      tagline: 'AI कभी भी अपनी मर्ज़ी से कीमत नहीं बनाता।',
      aiTitle: 'AI केवल समझता और समझाता है',
      aiPoints: [
        'कच्चे WhatsApp मैसेज और हिंग्लिश भाषा को सटीकता से समझता है',
        'दरें, शामिल व न शामिल सामान और अस्पष्ट शर्तें अलग करता है',
        'वेंडर से पूछने लायक जरूरी सवाल सुझाता है',
        'वेंडर से विनम्रता से बात करने के लिए सम्मानजनक संदेश लिखता है',
      ],
      codeTitle: 'कोड केवल जोड़-घटाव और जांच करता है',
      codePoints: [
        '100% गणितीय गणना TypeScript कोड में पूरी निष्पक्षता से होती है',
        'मेहमानों के स्लाइडर से सटीक फॉर्मूले द्वारा लागत निकाली जाती है',
        '7 सख्त नियम एडवांस और भुगतान के जोखिमों की बिना पक्षपात जांच करते हैं',
        'निकाले गए हर सबूत का मिलान आपके मूल टेक्स्ट से सुनिश्चित करता है',
      ],
    },
    faq: {
      heading: 'अक्सर पूछे जाने वाले सवाल',
      subline: 'वेंडर कोटेशन को सुरक्षित रूप से समझने के लिए स्पष्ट उत्तर।',
      items: [
        {
          q: 'क्या यह कोई कानूनी सलाह है?',
          a: 'नहीं। Quote X-Ray आम उपभोक्ता सुरक्षा नियमों के आधार पर वित्तीय और अनुबंध जोखिम पर केवल मार्गदर्शन प्रदान करता है। यह औपचारिक कानूनी सलाह नहीं है।',
        },
        {
          q: 'क्या यह वेंडर की कीमतों या उपलब्धता की पुष्टि करता है?',
          a: 'नहीं। सभी कीमतें आपके दिए गए टेक्स्ट और मान्यताओं पर आधारित अनुमान हैं। हमेशा वेंडर से अंतिम कीमतों की पुष्टि स्वयं करें।',
        },
        {
          q: 'क्या मेरा कोटेशन या डेटा कहीं स्टोर होता है?',
          a: 'वेब ऐप पर विश्लेषण केवल कुछ क्षणों के लिए प्रोसेस होता है और केवल आपके ब्राउज़र के localStorage में रहता है। हम आपका डेटा किसी को नहीं बेचते।',
        },
        {
          q: 'यहाँ कौन सी भाषाएं उपलब्ध हैं?',
          a: 'पूरा ऐप हिंदी और अंग्रेज़ी में उपलब्ध है। हमारा विश्लेषक अंग्रेज़ी, शुद्ध हिंदी और WhatsApp पर बोली जाने वाली हिंग्लिश को आसानी से समझता है।',
        },
        {
          q: 'क्या Quote X-Ray का इस्तेमाल मुफ़्त है?',
          a: 'हाँ, परिवारों के लिए Quote X-Ray और Shaadi Guardian का उपयोग 100% मुफ़्त है।',
        },
        {
          q: 'AI द्वारा निकाला गया डेटा कितना सटीक होता है?',
          a: 'AI केवल टेक्स्ट को पढ़ता है, जबकि हमारा कोड हर सबूत का आपके मूल कोटेशन से मिलान करता है। यदि कोई संख्या कोटेशन में नहीं मिलती, तो उसे तुरंत चिन्हित कर दिया जाता है।',
        },
      ],
    },
    finalCta: {
      headline: 'एडवांस देने से पहले कोट का एक्स-रे ज़रूर करें।',
      subline: 'अपने परिवार को बजट फूलने, डूबते एडवांस और शादी की रात होने वाले कड़वे विवादों से बचाएं।',
      ctaPrimary: 'अभी वेंडर कोट का एक्स-रे करें',
      ctaSecondary: 'पूरा इवेंट बजट बनाएं',
      disclaimer: 'सभी राशियां मान्यताओं पर आधारित अनुमान हैं। कृपया वेंडरों से वास्तविक कीमतों की पुष्टि करें। यह केवल मार्गदर्शन है, कानूनी सलाह नहीं।',
    },
  },
};

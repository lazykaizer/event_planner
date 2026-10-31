'use client';

import React from 'react';
import type { VendorType, Language } from '@/types';

interface QuoteInputCardProps {
  quoteText: string;
  setQuoteText: (val: string) => void;
  vendorType: VendorType;
  setVendorType: (val: VendorType) => void;
  guestCount: number;
  setGuestCount: (val: number) => void;
  isLoading: boolean;
  onAnalyze: () => void;
  language: Language;
}

export const SAMPLE_HINGLISH_QUOTES: { vendorType: VendorType; title: string; text: string }[] = [
  {
    vendorType: 'caterer',
    title: 'Caterer Quote (Classic Hinglish WhatsApp forward)',
    text: `Namaste Sharma ji, yeh catering ka estimate hai aapke 250 guests ke liye:

Menu per plate: Rs 1150/- (Pure Veg)
Includes:
- 4 Welcome drinks (Mocktails)
- 4 Starters (Paneer tikka, Hara bhara kabab, Crispy corn, Spring roll)
- Main course: 2 Paneer sabzi, Dal Makhani, Mix Veg, Pulao, assorted breads (Naan, Roti, Missi)
- Sweets: Gulab Jamun, Moong Dal Halwa, Ice Cream counter

Not included:
- Waitstaff bakhshish/tips (approx Rs 500 per boy)
- Drinking water jars extra
- Chaat counter will be extra Rs 150 per plate

Payment terms:
Advance 60% booking par dena hoga cash ya Sharma ji ke personal GPay par. 40% function shuru hone se 2 ghante pehle clear karna padega.
Cancellation par no refund.
Contract ki zaroorat nahi hai, hamara 15 saal ka vishwas hai.`,
  },
  {
    vendorType: 'venue',
    title: 'Banquet & Lawn Quote ("Free Venue" Offer)',
    text: `Respected Sir,
Heartiest congratulations for the wedding function!
Quote for Grand Shahi Palace Lawn for 300 pax:

Special Package:
- Venue Lawn is COMPLIMENTARY / FREE with catering!
- Per plate catering charge: Rs 1,450 + taxes
- Includes: Basic hall lighting, Round tables with white linen, 2 bride/groom green rooms.

Extras:
- Generator diesel charges: Rs 15,000 per 4 hours if government power cuts.
- Mandatory venue cleaning & sanitation fee: Rs 12,000.
- Outside DJ royalty/entry fee: Rs 8,000.
- AC timing strictly 7:00 PM to 11:30 PM. Overtime Rs 5,000/hour.

Advance: 50% advance for blocking date. 50% 1 week prior.
Strictly non-refundable deposit.`,
  },
  {
    vendorType: 'decorator',
    title: 'Wedding Decorator Quote (Ambiguous Floral Package)',
    text: `Hello Sir, Decor package estimate:
Total package cost: Rs 2,20,000.
Deliverables:
- Main gate floral arch (Hydrangea & Artificial orchid mix)
- Stage backdrop with golden sofa setup
- Mandap with floral pillars
- 10 walkway pillars with fairy lighting

Note: Fresh imported flowers extra as per mandi market rate on wedding day. Sound generator and truss structure extra Rs 25,000.
Advance: 70% advance on booking, balance on setup morning. Cash only accepted. No written invoice without 18% GST extra.`,
  },
];

export function QuoteInputCard({
  quoteText,
  setQuoteText,
  vendorType,
  setVendorType,
  guestCount,
  setGuestCount,
  isLoading,
  onAnalyze,
  language,
}: QuoteInputCardProps) {
  const handleLoadSample = (sample: typeof SAMPLE_HINGLISH_QUOTES[0]) => {
    setQuoteText(sample.text);
    setVendorType(sample.vendorType);
  };

  return (
    <div className="card space-y-5 border-2 border-cream-200 shadow-md">
      {/* Promise & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-maroon-100 text-maroon-900 border border-maroon-300 uppercase tracking-wider">
            <span>🔍</span>
            <span>{language === 'hi' ? 'कोटेशन पेस्ट करें' : 'Paste Vendor Quote'}</span>
          </span>
          <h2 className="text-xl font-heading font-bold text-maroon-900 mt-1">
            {language === 'hi'
              ? 'वेंडर कोटेशन का एक्स-रे विश्लेषण करें'
              : 'X-Ray Your Vendor Quote Before Paying Advance'}
          </h2>
        </div>

        {/* Load Sample Quote dropdown / buttons */}
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleLoadSample(SAMPLE_HINGLISH_QUOTES[0])}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-saffron-100 text-saffron-900 border border-saffron-300 hover:bg-saffron-200 transition-colors"
            title="Load a messy Hinglish caterer WhatsApp quote"
          >
            📋 {language === 'hi' ? 'कैटरर नमूना कोट' : 'Sample Caterer Quote'}
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample(SAMPLE_HINGLISH_QUOTES[1])}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cream-100 text-maroon-900 border border-cream-300 hover:bg-cream-200 transition-colors"
            title="Load a 'Free Venue' banquet quote"
          >
            🏛️ {language === 'hi' ? 'वेन्यू नमूना कोट' : 'Sample Venue Quote'}
          </button>
        </div>
      </div>

      {/* Selectors: Vendor Type & Guest Count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vendor-type-select" className="label-text">
            {language === 'hi' ? 'वेंडर का प्रकार' : 'Vendor Category'}
          </label>
          <select
            id="vendor-type-select"
            value={vendorType}
            onChange={(e) => setVendorType(e.target.value as VendorType)}
            className="select-field"
          >
            <option value="caterer">🍲 Caterer / Halwai (खानपान)</option>
            <option value="venue">🏛️ Venue / Banquet Hall / Lawn (विवाह स्थल)</option>
            <option value="decorator">🌸 Decorator / Tent & Lights (सजावट)</option>
            <option value="photographer">📸 Photographer & Video (फोटोग्राफी)</option>
            <option value="other">🎉 Other Event Vendor (अन्य)</option>
          </select>
        </div>

        <div>
          <label htmlFor="base-guest-input" className="label-text">
            {language === 'hi' ? 'अपेक्षित मेहमान संख्या' : 'Expected Guest Count'}
          </label>
          <input
            id="base-guest-input"
            type="number"
            min="1"
            max="5000"
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
            className="input-field"
            placeholder="250"
            required
          />
        </div>
      </div>

      {/* Quote Textarea */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="quote-textarea" className="label-text mb-0">
            {language === 'hi'
              ? 'WhatsApp / ईमेल से कोटेशन टेक्स्ट पेस्ट करें (English, Hindi, या Hinglish):'
              : 'Paste Raw WhatsApp / Email Message (English, Hindi, or Hinglish):'}
          </label>
          <span className="text-[11px] text-gray-400">
            {quoteText.length} / 8000 {language === 'hi' ? 'अक्षर' : 'chars'}
          </span>
        </div>
        <textarea
          id="quote-textarea"
          rows={8}
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          placeholder={
            language === 'hi'
              ? 'यहाँ वेंडर द्वारा भेजा गया कच्चा संदेश पेस्ट करें...\nउदा: "Namaste bhaiya, catering 250 guests ke liye 1150 per plate padega..."'
              : 'Paste the rough vendor message here...\ne.g. "Namaste ji, 250 guests catering quote: Rs 1150 per plate, 60% advance cash only..."'
          }
          className="input-field font-mono text-xs leading-relaxed"
          maxLength={8000}
          disabled={isLoading}
        />
        <p className="text-[11px] text-gray-500 mt-1">
          {language === 'hi'
            ? '💡 टिप: WhatsApp के अनौपचारिक संदेश, वर्तनी की त्रुटियां और हिंदी/हिंग्लिश शब्द पूरी तरह समर्थित हैं।'
            : '💡 Tip: Unformatted forwards, spelling quirks, and Hindi/Hinglish vendor terms are fully supported.'}
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || quoteText.trim().length < 20}
          className="btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-40"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{language === 'hi' ? 'एक्स-रे जांच हो रही है...' : 'X-Raying Quote...'}</span>
            </span>
          ) : (
            <span>{language === 'hi' ? '🔍 कोटेशन का एक्स-रे करें →' : '🔍 X-Ray This Quote →'}</span>
          )}
        </button>
      </div>
    </div>
  );
}

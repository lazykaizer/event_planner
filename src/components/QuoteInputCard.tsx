'use client';

import React from 'react';
import type { VendorType, Language } from '@/types';
import { SAMPLE_HINGLISH_QUOTES, type SampleQuoteItem } from '@/lib/sampleQuotes';

export { SAMPLE_HINGLISH_QUOTES };

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
  const handleLoadSample = (sample: SampleQuoteItem) => {
    setQuoteText(sample.text);
    setVendorType(sample.vendorType);
    if (sample.guestCount) {
      setGuestCount(sample.guestCount);
    }
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

        {/* SAMPLE QUOTES QUICK SELECTOR (Right under the WhatsApp box) */}
        <div className="mt-3 p-3 bg-cream-100/80 border border-cream-300 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-maroon-900 flex items-center gap-1.5">
              <span className="text-saffron-600">⚡</span>
              <span>
                {language === 'hi'
                  ? 'त्वरित परीक्षण के लिए सैंपल WhatsApp कोटेशन चुनें:'
                  : 'Quick Test: Click a sample WhatsApp quote to load:'}
              </span>
            </span>
            {quoteText && (
              <button
                type="button"
                onClick={() => setQuoteText('')}
                className="text-[11px] text-gray-500 hover:text-red-700 underline font-medium"
              >
                {language === 'hi' ? 'टेक्स्ट साफ करें' : 'Clear box'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_HINGLISH_QUOTES.map((sample) => {
              const isSelected = quoteText.trim() === sample.text.trim();
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className={`p-2.5 text-xs font-semibold rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-maroon-900 text-white border-maroon-900 shadow-sm ring-2 ring-saffron-500'
                      : 'bg-white text-gray-800 border-cream-300 hover:border-maroon-700 hover:bg-cream-50 shadow-2xs'
                  }`}
                  title={`Load ${sample.labelEn}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">{sample.icon}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-saffron-500 text-white font-bold'
                          : 'bg-cream-100 text-gray-600'
                      }`}
                    >
                      {sample.guestCount} {language === 'hi' ? 'मेहमान' : 'pax'}
                    </span>
                  </div>
                  <span className="font-bold text-[11px] leading-tight line-clamp-1">
                    {language === 'hi' ? sample.labelHi : sample.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
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

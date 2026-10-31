'use client';

import React from 'react';
import type { Language } from '@/types';
import { formatINR } from '@/lib/formatters';

interface GuestSliderProps {
  guestCount: number;
  setGuestCount: (count: number) => void;
  perUnitPrice: number | null;
  fixedComponent: number;
  language: Language;
}

export function GuestSlider({
  guestCount,
  setGuestCount,
  perUnitPrice,
  fixedComponent,
  language,
}: GuestSliderProps) {
  const variableTotal = (perUnitPrice || 0) * guestCount;

  return (
    <div className="card space-y-4 bg-gradient-to-r from-cream-50 to-white border border-saffron-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-800 flex items-center gap-1.5">
            <span>👥</span>
            <span>{language === 'hi' ? 'लाइव मेहमान संख्या स्लाइडर' : 'Live Guest Count Slider'}</span>
          </span>
          <p className="text-xs text-gray-500">
            {language === 'hi'
              ? 'स्लाइडर खिसकाकर देखें कि मेहमान बढ़ने पर कुल खर्च कैसे बदलता है (बिना किसी AI कॉल के तुरंत गणना)'
              : 'Slide to simulate guest count changes instantly in code — no AI latency'}
          </p>
        </div>

        {/* Direct number box */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="guest-slider-input" className="text-xs font-semibold text-gray-700">
            {language === 'hi' ? 'मेहमान:' : 'Guests:'}
          </label>
          <input
            id="guest-slider-input"
            type="number"
            min="10"
            max="2000"
            step="10"
            value={guestCount}
            onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-20 px-2 py-1 text-center font-bold text-maroon-900 border border-saffron-400 rounded-lg bg-white shadow-2xs"
            aria-label="Direct guest count input"
          />
        </div>
      </div>

      {/* Slider Bar */}
      <div className="space-y-1">
        <input
          type="range"
          min="25"
          max="1000"
          step="25"
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-500"
          aria-label="Adjust guest count slider"
        />
        <div className="flex justify-between text-[11px] text-gray-400 font-medium">
          <span>25 Pax (Intimate)</span>
          <span>250 Pax (Typical)</span>
          <span>500 Pax (Grand)</span>
          <span>1000 Pax</span>
        </div>
      </div>

      {/* Visual meter: Variable vs Fixed proportion */}
      <div className="pt-2 border-t border-cream-200 grid grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-cream-100 border border-cream-300">
          <span className="text-gray-500 block text-[11px]">
            {language === 'hi' ? 'प्रति-मेहमान स्केलिंग खर्च (Variable):' : 'Variable Scaling Cost:'}
          </span>
          <span className="font-bold text-gray-900 text-sm">
            {formatINR(variableTotal)}
          </span>
          <span className="text-[10px] text-gray-400 block">
            {perUnitPrice ? `(₹${perUnitPrice}/head × ${guestCount})` : 'Flat package'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-cream-100 border border-cream-300">
          <span className="text-gray-500 block text-[11px]">
            {language === 'hi' ? 'स्थिर शुल्क (Fixed Charges):' : 'Fixed Base Charges:'}
          </span>
          <span className="font-bold text-gray-900 text-sm">
            {formatINR(fixedComponent)}
          </span>
          <span className="text-[10px] text-gray-400 block">
            {language === 'hi' ? 'मेहमान बदलने पर भी स्थिर रहता है' : 'Unchanged by guest count'}
          </span>
        </div>
      </div>
    </div>
  );
}

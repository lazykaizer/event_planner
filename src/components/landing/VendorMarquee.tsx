'use client';

import React from 'react';
import type { Language } from '@/types';
import { LANDING_CONTENT } from '@/lib/i18n/landing';

interface VendorMarqueeProps {
  language: Language;
}

export function VendorMarquee({ language }: VendorMarqueeProps) {
  const vendors = LANDING_CONTENT[language].marquee;
  // Duplicate array for seamless infinite marquee loop
  const repeated = [...vendors, ...vendors, ...vendors];

  const vendorIcons: Record<number, string> = {
    0: '🍽️',
    1: '🌺',
    2: '🏰',
    3: '📸',
    4: '🎧',
    5: '✨',
    6: '💄',
    7: '🎺',
  };

  return (
    <div
      aria-label="Vendor Categories Supported"
      className="py-4 bg-[#F3E6CC] border-y border-[#C9962B]/30 overflow-hidden select-none"
    >
      <div className="animate-marquee gap-4 flex items-center">
        {repeated.map((vendor, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#C9962B]/35 shadow-2xs shrink-0 text-xs font-bold text-[#4A0D22] hover:bg-cream-100 transition-colors"
          >
            <span>{vendorIcons[idx % 8] || '💍'}</span>
            <span>{vendor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

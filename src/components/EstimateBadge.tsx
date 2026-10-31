'use client';

import React, { useState } from 'react';

interface EstimateBadgeProps {
  label?: string;
  tooltipText?: string;
}

export function EstimateBadge({
  label = 'Estimate (assumption)',
  tooltipText = 'AI-generated allocation estimate based on typical market norms. Not a verified vendor quote.',
}: EstimateBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="badge-estimate focus:outline-none focus:ring-1 focus:ring-saffron-500 cursor-help"
        aria-label={`${label}: ${tooltipText}`}
      >
        <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
        <svg
          className="w-3 h-3 text-saffron-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {showTooltip && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg pointer-events-none transition-opacity duration-150 animate-fade-in text-center"
        >
          {tooltipText}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

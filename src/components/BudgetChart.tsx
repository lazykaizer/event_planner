'use client';

import React, { useState } from 'react';
import type { BudgetAllocation, Language } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { formatINR } from '@/lib/formatters';

interface BudgetChartProps {
  allocations: BudgetAllocation[];
  totalBudget: number;
  language: Language;
}

// Distinctive Indian festive color palette for the 10 categories
const CATEGORY_COLORS: Record<string, string> = {
  venue: '#6b1530',              // Deep Maroon
  catering: '#ff7b11',           // Saffron
  decoration: '#dca05c',         // Warm Amber/Gold
  photography_video: '#0d9488',  // Peacock Teal
  attire_jewellery: '#be185d',   // Rani Pink
  invitations: '#854d0e',        // Sandalwood Brown
  entertainment: '#7c3aed',      // Festive Purple
  transport_stay: '#2563eb',     // Royal Blue
  contingency: '#059669',        // Emerald Green (Safety)
  misc: '#64748b',               // Slate
};

export function BudgetChart({ allocations, totalBudget, language }: BudgetChartProps) {
  const [viewMode, setViewMode] = useState<'donut' | 'bars'>('donut');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Calculate SVG Donut segments
  let cumulativePercent = 0;
  const radius = 80;
  const strokeWidth = 32;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = allocations.map((alloc) => {
    const strokeDasharray = `${(alloc.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += alloc.percentage;
    const color = CATEGORY_COLORS[alloc.category] || '#94a3b8';

    return {
      category: alloc.category,
      percentage: alloc.percentage,
      amount: alloc.amount,
      color,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeAlloc = allocations.find((a) => a.category === hoveredCategory);

  return (
    <div className="card space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
        <div>
          <h3 className="text-lg font-heading font-semibold text-gray-900">
            {language === 'hi' ? 'बजट वितरण चार्ट' : 'Budget Distribution Chart'}
          </h3>
          <p className="text-xs text-gray-500">
            {language === 'hi'
              ? 'प्रतिशत आवंटन एवं श्रेणी अनुसार अनुमानित व्यय'
              : 'Visual percentage allocation and rupee breakdowns'}
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-cream-300 p-0.5 bg-cream-50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('donut')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'donut'
                ? 'bg-maroon-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-maroon-900'
            }`}
            aria-label="Switch to Donut Chart"
          >
            {language === 'hi' ? 'डोनट दृश्य' : 'Donut Chart'}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('bars')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'bars'
                ? 'bg-maroon-900 text-white shadow-xs'
                : 'text-gray-600 hover:text-maroon-900'
            }`}
            aria-label="Switch to Bar Chart"
          >
            {language === 'hi' ? 'बार दृश्य' : 'Bar Chart'}
          </button>
        </div>
      </div>

      {viewMode === 'donut' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Donut Graphic */}
          <div className="md:col-span-6 flex justify-center">
            <div className="relative w-64 h-64">
              <svg
                viewBox="0 0 220 220"
                className="w-full h-full -rotate-90 transform"
                aria-label="Interactive budget donut chart"
              >
                {/* Background Ring */}
                <circle
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="transparent"
                  stroke="#f5e3c5"
                  strokeWidth={strokeWidth}
                />

                {/* Segments */}
                {donutSegments.map((seg) => {
                  const isHovered = hoveredCategory === seg.category;
                  return (
                    <circle
                      key={seg.category}
                      cx="110"
                      cy="110"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(seg.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${CATEGORY_LABELS[seg.category]?.[language] || seg.category}: ${seg.percentage.toFixed(1)}% (${formatINR(seg.amount)})`}
                    />
                  );
                })}
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {activeAlloc ? (
                  <>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {CATEGORY_LABELS[activeAlloc.category]?.[language] || activeAlloc.category}
                    </span>
                    <span className="text-xl font-bold font-heading text-maroon-900">
                      {formatINR(activeAlloc.amount)}
                    </span>
                    <span className="text-xs font-semibold text-saffron-700">
                      {activeAlloc.percentage.toFixed(1)}% of total
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] uppercase tracking-wider text-gray-500">
                      {language === 'hi' ? 'कुल बजट' : 'Total Budget'}
                    </span>
                    <span className="text-xl font-bold font-heading text-maroon-900">
                      {formatINR(totalBudget)}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {allocations.length} {language === 'hi' ? 'श्रेणियां' : 'Categories'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Legend Grid */}
          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allocations.map((alloc) => {
              const color = CATEGORY_COLORS[alloc.category] || '#94a3b8';
              const isHovered = hoveredCategory === alloc.category;

              return (
                <button
                  type="button"
                  key={alloc.category}
                  onMouseEnter={() => setHoveredCategory(alloc.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between p-2 rounded-lg text-left transition-all border ${
                    isHovered
                      ? 'border-maroon-500 bg-cream-100 shadow-xs'
                      : 'border-transparent hover:bg-cream-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-medium text-gray-800 truncate">
                      {CATEGORY_LABELS[alloc.category]?.[language] || alloc.category}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-gray-900 block">
                      {formatINR(alloc.amount)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {alloc.percentage.toFixed(1)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Horizontal Bar Chart */
        <div className="space-y-3.5">
          {allocations.map((alloc) => {
            const color = CATEGORY_COLORS[alloc.category] || '#94a3b8';
            return (
              <div key={alloc.category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-gray-800 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: color }}
                    />
                    {CATEGORY_LABELS[alloc.category]?.[language] || alloc.category}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatINR(alloc.amount)}{' '}
                    <span className="text-gray-500 font-normal">
                      ({alloc.percentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(alloc.percentage, 1)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

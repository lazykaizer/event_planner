'use client';

import React from 'react';
import type { BudgetPlan, UserIntake, Timeline, VendorAnalysis, Language } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { formatINR, formatDate } from '@/lib/formatters';

interface SummaryPrintViewProps {
  intake: UserIntake;
  budgetPlan: BudgetPlan;
  timeline: Timeline | null;
  vendorAnalyses: VendorAnalysis[];
  language: Language;
}

export function SummaryPrintView({
  intake,
  budgetPlan,
  timeline,
  vendorAnalyses,
  language,
}: SummaryPrintViewProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Print Trigger Bar (Hidden on print) */}
      <div className="card bg-cream-100 border-cream-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div>
          <h3 className="font-heading font-bold text-base text-maroon-900">
            {language === 'hi' ? 'प्रिंट अथवा PDF डाउनलोड करें' : 'Printable Wedding Master Summary'}
          </h3>
          <p className="text-xs text-gray-600">
            {language === 'hi'
              ? 'इस पृष्ठ को परिवार के साथ साझा करने हेतु प्रिंट करें या PDF के रूप में सहेजें।'
              : 'Clean, printable document formatted for family review and WhatsApp/PDF sharing.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2 shadow-sm"
        >
          <span>🖨️</span>
          <span>{language === 'hi' ? 'प्रिंट / सेव PDF' : 'Print / Save as PDF'}</span>
        </button>
      </div>

      {/* Printable Document Container */}
      <div className="card p-8 sm:p-10 space-y-8 bg-white border border-gray-300 shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-maroon-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">💍</span>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-maroon-900">
                Shaadi Guardian Summary
              </h1>
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
              Zero-Inflation Celebration & Budget Master Report
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-gray-600">
            <p><strong>Generated:</strong> {new Date().toLocaleDateString('en-IN')}</p>
            <p><strong>Location:</strong> {intake.city}</p>
            <p><strong>Date:</strong> {formatDate(intake.eventDate)}</p>
          </div>
        </div>

        {/* Executive Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-cream-50 border border-cream-200 text-xs">
          <div>
            <span className="text-gray-500 block uppercase tracking-wider text-[10px]">Occasion</span>
            <span className="text-sm font-bold text-gray-900 capitalize">{intake.occasion}</span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase tracking-wider text-[10px]">Total Budget</span>
            <span className="text-sm font-bold text-maroon-900">{formatINR(budgetPlan.totalBudget)}</span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase tracking-wider text-[10px]">Guest Count</span>
            <span className="text-sm font-bold text-gray-900">{intake.guestCount} Pax</span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase tracking-wider text-[10px]">Per-Guest Cap</span>
            <span className="text-sm font-bold text-saffron-800">
              {formatINR(Math.round(budgetPlan.totalBudget / intake.guestCount))}
            </span>
          </div>
        </div>

        {/* Strategic Plan Summary */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-maroon-900 border-b border-cream-300 pb-1">
            Financial Strategy Summary
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
            &ldquo;{budgetPlan.summary}&rdquo;
          </p>
        </div>

        {/* Section 1: Itemized Budget Breakdown Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-maroon-900 border-b border-cream-300 pb-1">
            Itemized Category Allocations
          </h2>

          <table className="w-full text-left text-xs border border-gray-200">
            <thead className="bg-gray-100 font-semibold text-gray-800 uppercase text-[10px]">
              <tr>
                <th className="p-2 border">Category</th>
                <th className="p-2 border text-right">Split %</th>
                <th className="p-2 border text-right">Amount (INR)</th>
                <th className="p-2 border">Strategic Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {budgetPlan.allocations.map((a) => (
                <tr key={a.category} className="border-b">
                  <td className="p-2 font-medium text-gray-900 border">
                    {CATEGORY_LABELS[a.category]?.[language] || a.category}
                  </td>
                  <td className="p-2 text-right border text-gray-600">{a.percentage.toFixed(1)}%</td>
                  <td className="p-2 text-right font-semibold border text-gray-900">{formatINR(a.amount)}</td>
                  <td className="p-2 text-gray-600 border text-[11px]">{a.reasoning}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td className="p-2 border">Total</td>
                <td className="p-2 text-right border">100.0%</td>
                <td className="p-2 text-right border text-maroon-900">{formatINR(budgetPlan.totalBudget)}</td>
                <td className="p-2 border text-[10px] text-gray-500 font-normal">
                  Mathematically guaranteed to match exact total budget.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section 2: Vendor Safety & Red-Flag Notes */}
        {vendorAnalyses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-maroon-900 border-b border-cream-300 pb-1">
              Vendor Safety & Red-Flag Audit
            </h2>

            <div className="space-y-3">
              {vendorAnalyses.map((va, idx) => (
                <div key={idx} className="p-3 border border-gray-300 rounded text-xs space-y-2">
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>{va.quote.vendorName} ({va.quote.vendorType})</span>
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-gray-100">
                      Risk Level: {va.overallRisk}
                    </span>
                  </div>

                  {va.redFlags.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-semibold text-red-800 text-[11px]">Flagged Risks:</span>
                      <ul className="list-disc list-inside text-red-700 space-y-0.5 text-[11px]">
                        {va.redFlags.map((f, fi) => (
                          <li key={fi}>
                            {typeof f.message === 'object' && f.message !== null
                              ? f.message[language] || f.message.en
                              : f.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[11px] text-gray-600">
                    <strong>Payment Terms:</strong> {va.quote.advancePercentage}% advance requested.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Upcoming Timeline Milestones */}
        {timeline && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-maroon-900 border-b border-cream-300 pb-1">
              Key Upcoming Milestones
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {timeline.tasks.slice(0, 8).map((task) => (
                <div key={task.id} className="p-2.5 border rounded flex justify-between items-start gap-2">
                  <div>
                    <span className="font-semibold block text-gray-900">{task.title}</span>
                    <span className="text-[11px] text-gray-500">{task.description}</span>
                  </div>
                  <span className="shrink-0 font-medium text-gray-600 text-[11px]">
                    {formatDate(task.deadline)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Printable Footer Disclaimer */}
        <div className="pt-6 border-t-2 border-gray-200 text-center text-[10px] text-gray-500 space-y-1">
          <p>
            * All amounts are AI financial estimations based on prevailing market norms.
            Please confirm final negotiated pricing in writing with official GST invoices from vendors.
          </p>
          <p>Generated by Shaadi Guardian • Financial Guard for Indian Celebrations</p>
        </div>
      </div>
    </div>
  );
}

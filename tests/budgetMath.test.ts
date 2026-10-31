/**
 * Tests for budget math — the deterministic heart of the application.
 *
 * Key invariants:
 * 1. computeAllocations always produces amounts summing to exactly totalBudget
 * 2. Rounding residuals are distributed correctly
 * 3. Manual edit recalculation preserves the total
 */

import { describe, it, expect } from 'vitest';
import {
  computeAllocations,
  recalcAfterManualEdit,
  isBudgetBalanced,
  budgetDifference,
} from '@/lib/budgetMath';
import type { BudgetAllocation, BudgetCategory } from '@/types';

const SAMPLE_PERCENTAGES = [
  { category: 'venue' as BudgetCategory, percentage: 20, reasoning: 'Venue' },
  { category: 'catering' as BudgetCategory, percentage: 30, reasoning: 'Catering' },
  { category: 'decoration' as BudgetCategory, percentage: 10, reasoning: 'Decoration' },
  { category: 'photography_video' as BudgetCategory, percentage: 10, reasoning: 'Photo' },
  { category: 'attire_jewellery' as BudgetCategory, percentage: 8, reasoning: 'Attire' },
  { category: 'invitations' as BudgetCategory, percentage: 3, reasoning: 'Invitations' },
  { category: 'entertainment' as BudgetCategory, percentage: 5, reasoning: 'Entertainment' },
  { category: 'transport_stay' as BudgetCategory, percentage: 4, reasoning: 'Transport' },
  { category: 'contingency' as BudgetCategory, percentage: 7, reasoning: 'Contingency' },
  { category: 'misc' as BudgetCategory, percentage: 3, reasoning: 'Misc' },
];

describe('computeAllocations', () => {
  it('produces amounts summing to exactly the total budget (₹8,00,000)', () => {
    const total = 800000;
    const result = computeAllocations(total, SAMPLE_PERCENTAGES);
    const sum = result.reduce((s, a) => s + a.amount, 0);
    expect(sum).toBe(total);
  });

  it('produces amounts summing to exactly ₹7,77,777 (tricky rounding)', () => {
    const total = 777777;
    const result = computeAllocations(total, SAMPLE_PERCENTAGES);
    const sum = result.reduce((s, a) => s + a.amount, 0);
    expect(sum).toBe(total);
  });

  it('produces amounts summing to exactly ₹1 (minimum budget)', () => {
    const percentages = [
      { category: 'venue' as BudgetCategory, percentage: 100, reasoning: 'All venue' },
    ];
    const result = computeAllocations(1, percentages);
    expect(result[0].amount).toBe(1);
  });

  it('handles ₹25,00,000 correctly', () => {
    const total = 2500000;
    const result = computeAllocations(total, SAMPLE_PERCENTAGES);
    const sum = result.reduce((s, a) => s + a.amount, 0);
    expect(sum).toBe(total);
  });

  it('handles ₹2,00,000 (minimum target range)', () => {
    const total = 200000;
    const result = computeAllocations(total, SAMPLE_PERCENTAGES);
    const sum = result.reduce((s, a) => s + a.amount, 0);
    expect(sum).toBe(total);
  });

  it('marks all allocations as isManualOverride = false', () => {
    const result = computeAllocations(800000, SAMPLE_PERCENTAGES);
    expect(result.every((a) => a.isManualOverride === false)).toBe(true);
  });

  it('preserves category names and reasoning', () => {
    const result = computeAllocations(800000, SAMPLE_PERCENTAGES);
    expect(result[0].category).toBe('venue');
    expect(result[0].reasoning).toBe('Venue');
  });

  it('throws on zero budget', () => {
    expect(() => computeAllocations(0, SAMPLE_PERCENTAGES)).toThrow(
      'Total budget must be positive'
    );
  });

  it('throws on negative budget', () => {
    expect(() => computeAllocations(-100, SAMPLE_PERCENTAGES)).toThrow(
      'Total budget must be positive'
    );
  });

  it('throws when percentages do not sum to 100', () => {
    const bad = [
      { category: 'venue' as BudgetCategory, percentage: 50, reasoning: 'Half' },
      { category: 'catering' as BudgetCategory, percentage: 30, reasoning: 'Third' },
    ];
    expect(() => computeAllocations(100000, bad)).toThrow('sum to 100');
  });

  it('handles a budget of exactly ₹100 with 10 equal categories', () => {
    const equalPercentages = SAMPLE_PERCENTAGES.map((p) => ({
      ...p,
      percentage: 10,
    }));
    const result = computeAllocations(100, equalPercentages);
    const sum = result.reduce((s, a) => s + a.amount, 0);
    expect(sum).toBe(100);
    expect(result.every((a) => a.amount === 10)).toBe(true);
  });
});

describe('recalcAfterManualEdit', () => {
  it('keeps total budget after manual edit', () => {
    const total = 800000;
    const allocations = computeAllocations(total, SAMPLE_PERCENTAGES);
    const result = recalcAfterManualEdit(total, allocations, 'catering', 300000);
    const sum = result.reduce((s, a) => s + a.amount, 0);
    expect(sum).toBe(total);
  });

  it('marks the edited category as manual override', () => {
    const total = 800000;
    const allocations = computeAllocations(total, SAMPLE_PERCENTAGES);
    const result = recalcAfterManualEdit(total, allocations, 'catering', 300000);
    const catering = result.find((a) => a.category === 'catering');
    expect(catering?.isManualOverride).toBe(true);
    expect(catering?.amount).toBe(300000);
  });

  it('clamps negative amount to 0', () => {
    const total = 800000;
    const allocations = computeAllocations(total, SAMPLE_PERCENTAGES);
    const result = recalcAfterManualEdit(total, allocations, 'catering', -100);
    const catering = result.find((a) => a.category === 'catering');
    expect(catering?.amount).toBe(0);
  });

  it('clamps amount to total budget', () => {
    const total = 800000;
    const allocations = computeAllocations(total, SAMPLE_PERCENTAGES);
    const result = recalcAfterManualEdit(total, allocations, 'catering', 1000000);
    const catering = result.find((a) => a.category === 'catering');
    expect(catering?.amount).toBe(total);
  });
});

describe('isBudgetBalanced', () => {
  it('returns true when balanced', () => {
    const allocs = computeAllocations(800000, SAMPLE_PERCENTAGES);
    expect(isBudgetBalanced(800000, allocs)).toBe(true);
  });

  it('returns false when not balanced', () => {
    const allocs: BudgetAllocation[] = [
      {
        category: 'venue',
        percentage: 50,
        amount: 400000,
        reasoning: '',
        isManualOverride: false,
      },
    ];
    expect(isBudgetBalanced(800000, allocs)).toBe(false);
  });
});

describe('budgetDifference', () => {
  it('returns 0 for balanced budget', () => {
    const allocs = computeAllocations(800000, SAMPLE_PERCENTAGES);
    expect(budgetDifference(800000, allocs)).toBe(0);
  });

  it('returns positive for over-budget', () => {
    const allocs: BudgetAllocation[] = [
      {
        category: 'venue',
        percentage: 100,
        amount: 900000,
        reasoning: '',
        isManualOverride: true,
      },
    ];
    expect(budgetDifference(800000, allocs)).toBe(100000);
  });
});

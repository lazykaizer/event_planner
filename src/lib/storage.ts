/**
 * localStorage wrapper with try/catch and graceful fallback.
 *
 * All reads and writes are wrapped to handle:
 * - SSR (no window/localStorage)
 * - Private browsing / storage disabled
 * - Corrupt data
 */

import type { AppState } from '@/types';

const STORAGE_KEY = 'shaadi-guardian-state';

const DEFAULT_STATE: AppState = {
  intake: null,
  budgetPlan: null,
  planHistory: [],
  vendorAnalyses: [],
  timeline: null,
  language: 'en',
};

/**
 * Load app state from localStorage. Returns default state on any error.
 */
export function loadState(): AppState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };

    const parsed = JSON.parse(raw) as Partial<AppState>;

    // Merge with defaults to handle missing keys from older versions
    return {
      ...DEFAULT_STATE,
      ...parsed,
      planHistory: parsed.planHistory ?? [],
      vendorAnalyses: parsed.vendorAnalyses ?? [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

/**
 * Save app state to localStorage. Silently fails on error.
 */
export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or disabled — silently fail
  }
}

/**
 * Clear all stored state.
 */
export function clearState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Formatting utilities for Indian currency and dates.
 */

/**
 * Format a number as Indian Rupees with lakh/crore grouping.
 * e.g. 800000 → "₹8,00,000"
 */
export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const str = abs.toString();

  if (str.length <= 3) {
    return `${isNegative ? '-' : ''}₹${str}`;
  }

  // Last 3 digits
  const last3 = str.slice(-3);
  const remaining = str.slice(0, -3);

  // Group remaining digits in pairs (lakh/crore grouping)
  const groups: string[] = [];
  let i = remaining.length;
  while (i > 0) {
    const start = Math.max(0, i - 2);
    groups.unshift(remaining.slice(start, i));
    i = start;
  }

  return `${isNegative ? '-' : ''}₹${groups.join(',')},${last3}`;
}

/**
 * Format a date as "DD MMM YYYY" (e.g. "15 Mar 2027").
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Format a number in Indian convention with commas (no ₹ sign).
 * e.g. 800000 → "8,00,000"
 */
export function formatIndianNumber(amount: number): string {
  return formatINR(amount).replace('₹', '').replace('-', '');
}

/**
 * Parse an Indian-formatted currency string back to a number.
 * e.g. "₹8,00,000" → 800000
 */
export function parseINR(str: string): number | null {
  const cleaned = str.replace(/[₹,\s]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

/**
 * Compute days until a future date from today.
 */
export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

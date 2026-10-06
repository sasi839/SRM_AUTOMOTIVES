import type { BillLineItem } from '../types/billing';

/**
 * SREE RAJA RAJESWARI MOTORS — BILLING BUSINESS LOGIC & CALCULATIONS
 * 
 * Rules:
 * 1. Amount = Quantity * Rate
 * 2. Amount is never editable directly by user.
 * 3. Grand Total is calculated from sum of individual line item amounts.
 * 4. Quick quantities 1..10 + Custom Quantity allowed.
 * 5. Rate is entered manually per bill line (not fixed to catalogue).
 */

export const QUICK_QUANTITY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Calculates line item amount: Amount = Quantity * Rate
 */
export function calculateLineAmount(quantity: number, rate: number): number {
  const q = Math.max(0, Number(quantity) || 0);
  const r = Math.max(0, Number(rate) || 0);
  return Number((q * r).toFixed(2));
}

/**
 * Calculates Grand Total from array of line items
 */
export function calculateGrandTotal(items: BillLineItem[]): number {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  return Number(total.toFixed(2));
}

/**
 * Validates and formats vehicle number plate (Primary billing key)
 */
export function formatNumberPlate(plate: string): string {
  if (!plate) return '';
  return plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Format currency display (₹)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

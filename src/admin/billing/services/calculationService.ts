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

/**
 * Organizes bill line items grouped by Work Type in sequence:
 * 1. Parts (all Parts grouped together first)
 * 2. Labour (all Labour works grouped together second)
 * 3. Towing (all Towing works grouped together third)
 * 4. Custom / Other types (any custom types grouped together)
 * 
 * Re-indexes continuous sequential S.No (1, 2, 3...) across the organized list.
 */
export function organizeLineItemsByType(items: BillLineItem[]): BillLineItem[] {
  if (!items || items.length === 0) return [];

  const getSortRank = (type: string): number => {
    const t = (type || '').trim().toLowerCase();
    if (t === 'part' || t === 'parts') return 1;
    if (t === 'labour' || t === 'labor') return 2;
    if (t === 'towing') return 3;
    return 4;
  };

  const sorted = [...items].sort((a, b) => {
    const rankA = getSortRank(a.work_type);
    const rankB = getSortRank(b.work_type);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    // If both are custom types, group identical custom types together alphabetically
    if (rankA === 4) {
      const typeCompare = (a.work_type || '').localeCompare(b.work_type || '');
      if (typeCompare !== 0) return typeCompare;
    }
    // Stable order within the same type based on original index
    return (a.s_no || 0) - (b.s_no || 0);
  });

  return sorted.map((item, index) => ({
    ...item,
    s_no: index + 1,
    amount: calculateLineAmount(item.quantity, item.rate),
  }));
}

/**
 * Calculates labour charges subtotal strictly from line items with work_type 'Labour'
 */
export function calculateLabourSubtotal(items: BillLineItem[]): number {
  if (!items || items.length === 0) return 0;
  const total = items
    .filter((item) => (item.work_type || '').toLowerCase() === 'labour' || (item.work_type || '').toLowerCase() === 'labor')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  return Number(total.toFixed(2));
}

/**
 * Calculates labour discount amount given the labour total and discount percentage (0..100)
 */
export function calculateLabourDiscountAmount(labourTotal: number, discountPercentage: number): number {
  const lt = Math.max(0, Number(labourTotal) || 0);
  const pct = Math.max(0, Math.min(100, Number(discountPercentage) || 0));
  if (lt === 0 || pct === 0) return 0;
  return Number(((lt * pct) / 100).toFixed(2));
}

/**
 * Calculates discounted bill totals breakdown:
 * - subtotalBeforeDiscount: Sum of all line items
 * - labourTotal: Sum of labour line items
 * - discountPercentage: Percentage entered (0..100)
 * - discountAmount: Rupees subtracted strictly from labour charges
 * - netLabourTotal: Labour total after subtracting discount
 * - grandTotal: Final payable amount (subtotalBeforeDiscount - discountAmount)
 */
export function calculateDiscountedGrandTotal(
  items: BillLineItem[],
  discountPercentage: number = 0
): {
  subtotalBeforeDiscount: number;
  labourTotal: number;
  discountPercentage: number;
  discountAmount: number;
  netLabourTotal: number;
  grandTotal: number;
} {
  const subtotalBeforeDiscount = calculateGrandTotal(items);
  const labourTotal = calculateLabourSubtotal(items);
  const cleanPct = Math.max(0, Math.min(100, Number(discountPercentage) || 0));
  const discountAmount = calculateLabourDiscountAmount(labourTotal, cleanPct);
  const netLabourTotal = Number(Math.max(0, labourTotal - discountAmount).toFixed(2));
  const grandTotal = Number(Math.max(0, subtotalBeforeDiscount - discountAmount).toFixed(2));

  return {
    subtotalBeforeDiscount,
    labourTotal,
    discountPercentage: cleanPct,
    discountAmount,
    netLabourTotal,
    grandTotal,
  };
}


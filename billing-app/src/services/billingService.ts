import { supabase } from '../lib/supabase';
import type { WorkItem, Invoice, PrintSearchFilter, WorkType, VehicleSuggestion } from '../types/billing';

/**
 * DEFAULT SEED CATALOGUE FOR DEVELOPMENT FALLBACK
 */
const DEFAULT_SEED_WORKS: WorkItem[] = [
  { id: 'w-1', work_name: 'General Service', work_type: 'Labour', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-2', work_name: 'Engine Oil Replacement', work_type: 'Labour', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-3', work_name: 'Synthetic Engine Oil (5W-30)', work_type: 'Part', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-4', work_name: 'Oil Filter Replacement', work_type: 'Part', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-5', work_name: 'Brake Pad Replacement (Front)', work_type: 'Labour', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-6', work_name: 'Front Brake Disc Set', work_type: 'Part', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-7', work_name: 'Wheel Alignment & Balancing', work_type: 'Labour', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-8', work_name: 'AC Gas Refill & Filter Clean', work_type: 'Labour', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-9', work_name: 'Air Filter Element', work_type: 'Part', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-10', work_name: 'Spark Plug Replacement', work_type: 'Labour', is_active: true, created_at: new Date().toISOString() },
  { id: 'w-11', work_name: 'Breakdown Recovery & Towing Service', work_type: 'Towing', is_active: true, created_at: new Date().toISOString() },
];

// In-memory fallback caches for development
let localWorksCatalogue: WorkItem[] = [...DEFAULT_SEED_WORKS];
let localInvoicesStore: Invoice[] = [];

/**
 * Encodes custom work types (e.g. 'Towing' or any custom string) into work_name
 * to safely bypass database check constraints (CHECK work_type IN ('Labour', 'Part'))
 */
export function encodeWorkTypeInName(name: string, type: string): { dbWorkName: string; dbWorkType: 'Labour' | 'Part' } {
  const cleanName = (name || '').trim();
  const cleanType = (type || 'Labour').trim();
  if (cleanType === 'Labour' || cleanType === 'Part') {
    return { dbWorkName: cleanName, dbWorkType: cleanType };
  }
  return {
    dbWorkName: `${cleanName} [[TYPE:${cleanType}]]`,
    dbWorkType: 'Labour',
  };
}

/**
 * Decodes work_name and custom work_type encoded with [[TYPE:...]]
 */
export function decodeWorkTypeFromName(name: string, fallbackType: string = 'Labour'): { work_name: string; work_type: string } {
  if (!name) return { work_name: '', work_type: fallbackType };
  const match = name.match(/^(.*?)\s*\[\[TYPE:(.*?)\]\]$/s);
  if (match) {
    return {
      work_name: match[1].trim(),
      work_type: match[2].trim(),
    };
  }
  return { work_name: name, work_type: fallbackType };
}

/**
 * Decodes packed customer_name, mobile_number, odometer, labour discount, and line items from database
 */
function decodeInvoice(inv: Invoice): Invoice {
  let customerName = inv.customer_name;
  let mobileNumber = inv.mobile_number;
  let odometer = inv.odometer;
  let labourDiscountPercentage: number | undefined = inv.labour_discount_percentage;
  let labourDiscountAmount: number | undefined = inv.labour_discount_amount;

  if (inv.mobile_number && inv.mobile_number.includes('///')) {
    const parts = inv.mobile_number.split('///');
    customerName = inv.customer_name || parts[0]?.trim() || undefined;
    mobileNumber = parts[1]?.trim() || undefined;
    odometer = inv.odometer || parts[2]?.trim() || undefined;
    if (parts[3]) {
      const parsedPct = parseFloat(parts[3].trim());
      if (!isNaN(parsedPct) && parsedPct > 0) {
        labourDiscountPercentage = parsedPct;
      }
    }
    if (parts[4]) {
      const parsedAmt = parseFloat(parts[4].trim());
      if (!isNaN(parsedAmt) && parsedAmt > 0) {
        labourDiscountAmount = parsedAmt;
      }
    }
  }

  const decodedItems = (inv.items || []).map((item) => {
    const { work_name, work_type } = decodeWorkTypeFromName(item.work_name, item.work_type);
    return {
      ...item,
      work_name,
      work_type,
    };
  });

  const subtotalBeforeDiscount = decodedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const labourTotal = decodedItems
    .filter((i) => (i.work_type || '').toLowerCase() === 'labour')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  if (labourDiscountPercentage && labourDiscountPercentage > 0) {
    if (!labourDiscountAmount || labourDiscountAmount === 0) {
      labourDiscountAmount = Number(((labourTotal * labourDiscountPercentage) / 100).toFixed(2));
    }
  }

  return {
    ...inv,
    customer_name: customerName,
    mobile_number: mobileNumber,
    odometer: odometer,
    items: decodedItems,
    subtotal_before_discount: subtotalBeforeDiscount,
    labour_discount_percentage: (labourDiscountPercentage && labourDiscountPercentage > 0) ? labourDiscountPercentage : undefined,
    labour_discount_amount: (labourDiscountAmount && labourDiscountAmount > 0) ? labourDiscountAmount : undefined,
  };
}

/**
 * SREE RAJA RAJESWARI MOTORS — BILLING DATABASE SERVICE LAYER
 */
export class BillingService {
  /**
   * Automatically generate next unique invoice number
   */
  static async generateNextInvoiceNumber(): Promise<string> {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const prefix = `SRM-${yearMonth}-`;
    
    try {
      // 1. Fetch all invoice numbers for the current month from Supabase
      const { data } = await supabase
        .from('billing_invoices')
        .select('invoice_number')
        .ilike('invoice_number', `${prefix}%`);

      const dbNumbers: number[] = [];
      if (data && Array.isArray(data)) {
        data.forEach((row: any) => {
          if (row.invoice_number) {
            const clean = row.invoice_number.replace(/^#/, '');
            const numPart = parseInt(clean.replace(prefix, ''), 10);
            if (!isNaN(numPart)) dbNumbers.push(numPart);
          }
        });
      }

      // 2. Extract numbers from local store fallback
      const localNumbers = localInvoicesStore
        .filter((inv) => inv.invoice_number.replace(/^#/, '').startsWith(prefix))
        .map((inv) => {
          const numPart = parseInt(inv.invoice_number.replace(/^#/, '').replace(prefix, ''), 10);
          return isNaN(numPart) ? 0 : numPart;
        });

      // 3. Find the maximum existing numeric suffix across DB and local store
      const allNumbers = [...dbNumbers, ...localNumbers];
      const maxNum = allNumbers.length > 0 ? Math.max(...allNumbers) : 0;
      const nextNum = (maxNum + 1).toString().padStart(4, '0');

      return `${prefix}${nextNum}`;
    } catch (err) {
      console.error('Error generating invoice number, falling back to local count:', err);
      const localNumbers = localInvoicesStore
        .filter((inv) => inv.invoice_number.replace(/^#/, '').startsWith(prefix))
        .map((inv) => {
          const numPart = parseInt(inv.invoice_number.replace(/^#/, '').replace(prefix, ''), 10);
          return isNaN(numPart) ? 0 : numPart;
        });
      const maxNum = localNumbers.length > 0 ? Math.max(...localNumbers) : 0;
      const nextNum = (maxNum + 1).toString().padStart(4, '0');
      return `${prefix}${nextNum}`;
    }
  }

  /**
   * Auto-suggest helper: Returns distinct existing vehicles with their most recent customer name and mobile
   * Used by NumberPlateInput and Create Bill Module
   */
  static async getStoredVehicles(searchQuery?: string): Promise<VehicleSuggestion[]> {
    const rawQuery = (searchQuery || '').trim().toUpperCase();
    const cleanNoSpace = rawQuery.replace(/\s+/g, '');

    try {
      let query = supabase
        .from('billing_invoices')
        .select('number_plate, mobile_number, created_at')
        .order('created_at', { ascending: false })
        .limit(60);

      if (rawQuery) {
        if (cleanNoSpace && cleanNoSpace !== rawQuery) {
          query = query.or(`number_plate.ilike.%${rawQuery}%,number_plate.ilike.%${cleanNoSpace}%`);
        } else {
          query = query.ilike('number_plate', `%${rawQuery}%`);
        }
      }

      const { data, error } = await query;
      let rawList: any[] = [];
      if (!error && data) {
        rawList = data;
      } else {
        rawList = localInvoicesStore;
      }

      const map = new Map<string, VehicleSuggestion>();

      for (const row of rawList) {
        const decoded = decodeInvoice(row as Invoice);
        const plate = (decoded.number_plate || '').toUpperCase().trim();
        if (!plate) continue;
        const normKey = plate.replace(/\s+/g, '');

        if (!map.has(normKey)) {
          map.set(normKey, {
            number_plate: plate,
            customer_name: decoded.customer_name,
            mobile_number: decoded.mobile_number,
            odometer: decoded.odometer ? String(decoded.odometer) : undefined,
          });
        } else {
          const existing = map.get(normKey)!;
          if (!existing.customer_name && decoded.customer_name) {
            existing.customer_name = decoded.customer_name;
          }
          if (!existing.mobile_number && decoded.mobile_number) {
            existing.mobile_number = decoded.mobile_number;
          }
          if (!existing.odometer && decoded.odometer) {
            existing.odometer = String(decoded.odometer);
          }
        }
      }

      const suggestions = Array.from(map.values());
      if (!rawQuery) {
        return suggestions.slice(0, 20);
      }

      return suggestions.filter((v) => {
        const normPlate = v.number_plate.replace(/\s+/g, '');
        return (
          v.number_plate.includes(rawQuery) ||
          (cleanNoSpace && normPlate.includes(cleanNoSpace)) ||
          (v.customer_name && v.customer_name.toUpperCase().includes(rawQuery)) ||
          (v.mobile_number && v.mobile_number.includes(rawQuery))
        );
      }).slice(0, 20);
    } catch {
      const map = new Map<string, VehicleSuggestion>();
      for (const row of localInvoicesStore) {
        const decoded = decodeInvoice(row);
        const plate = (decoded.number_plate || '').toUpperCase().trim();
        if (!plate) continue;
        const normKey = plate.replace(/\s+/g, '');
        if (!map.has(normKey)) {
          map.set(normKey, {
            number_plate: plate,
            customer_name: decoded.customer_name,
            mobile_number: decoded.mobile_number,
            odometer: decoded.odometer ? String(decoded.odometer) : undefined,
          });
        }
      }
      const all = Array.from(map.values());
      if (!rawQuery) return all.slice(0, 20);
      return all.filter((v) => {
        const normPlate = v.number_plate.replace(/\s+/g, '');
        return (
          v.number_plate.includes(rawQuery) ||
          (cleanNoSpace && normPlate.includes(cleanNoSpace))
        );
      }).slice(0, 20);
    }
  }

  /**
   * Auto-suggest helper: Returns distinct existing vehicle number plates from database.
   */
  static async getDistinctNumberPlates(searchQuery?: string): Promise<string[]> {
    const list = await this.getStoredVehicles(searchQuery);
    return list.map((v) => v.number_plate);
  }

  /**
   * Fetches the latest customer name, mobile number, and odometer for a given vehicle number plate
   * Returns { customer_name?: string; mobile_number?: string; odometer?: string } | null
   */
  static async getCustomerDetailsByPlate(
    numberPlate: string
  ): Promise<{ customer_name?: string; mobile_number?: string; odometer?: string } | null> {
    const rawPlate = (numberPlate || '').trim().toUpperCase();
    const cleanNoSpace = rawPlate.replace(/\s+/g, '');
    if (!cleanNoSpace || cleanNoSpace.length < 3) return null;

    try {
      const { data, error } = await supabase
        .from('billing_invoices')
        .select('*')
        .or(`number_plate.ilike.%${cleanNoSpace}%,number_plate.ilike.%${rawPlate}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      let invoices: Invoice[] = [];
      if (!error && data && data.length > 0) {
        invoices = (data as Invoice[]).map(decodeInvoice);
      } else {
        invoices = localInvoicesStore
          .filter((inv) => {
            const p = (inv.number_plate || '').toUpperCase().replace(/\s+/g, '');
            return p === cleanNoSpace || p.includes(cleanNoSpace);
          })
          .map(decodeInvoice);
      }

      // Check for exact plate match first
      const exactMatches = invoices.filter((inv) => {
        const p = (inv.number_plate || '').toUpperCase().replace(/\s+/g, '');
        return p === cleanNoSpace;
      });

      const candidateList = exactMatches.length > 0 ? exactMatches : invoices;

      let latestName: string | undefined;
      let latestMobile: string | undefined;
      let latestOdometer: string | undefined;

      for (const inv of candidateList) {
        if (!latestName && inv.customer_name?.trim()) {
          latestName = inv.customer_name.trim();
        }
        if (!latestMobile && inv.mobile_number?.trim()) {
          latestMobile = inv.mobile_number.trim();
        }
        if (!latestOdometer && inv.odometer) {
          latestOdometer = String(inv.odometer).trim();
        }
        if (latestName && latestMobile) break;
      }

      if (latestName || latestMobile) {
        return {
          customer_name: latestName,
          mobile_number: latestMobile,
          odometer: latestOdometer,
        };
      }

      return null;
    } catch (err) {
      console.warn('Error fetching customer details for plate:', err);
      return null;
    }
  }

  /**
   * Check for duplicate work name
   */
  static async checkDuplicateWorkName(workName: string, excludeId?: string): Promise<boolean> {
    const cleanName = workName.trim().toLowerCase();
    
    const duplicateInLocal = localWorksCatalogue.some(
      (w) => w.work_name.trim().toLowerCase() === cleanName && w.id !== excludeId
    );
    if (duplicateInLocal) return true;

    try {
      let query = supabase
        .from('billing_works')
        .select('id, work_name')
        .ilike('work_name', cleanName);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data } = await query;
      return Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  }

  /**
   * Fetch all works from catalogue
   */
  static async getWorksCatalogue(): Promise<WorkItem[]> {
    try {
      const { data, error } = await supabase
        .from('billing_works')
        .select('*')
        .order('work_name', { ascending: true });

      if (error || !data || data.length === 0) {
        return localWorksCatalogue;
      }
      return (data as any[]).map((row) => {
        const { work_name, work_type } = decodeWorkTypeFromName(row.work_name, row.work_type);
        return {
          ...row,
          work_name,
          work_type: work_type as WorkType,
        };
      });
    } catch {
      return localWorksCatalogue;
    }
  }

  /**
   * Create new work item
   */
  static async createWorkItem(
    workItem: Omit<WorkItem, 'id' | 'created_at'>
  ): Promise<{ success: boolean; data?: WorkItem; error?: string }> {
    const cleanName = workItem.work_name.trim();

    if (!cleanName) {
      return { success: false, error: 'Work name is required.' };
    }

    const isDuplicate = await this.checkDuplicateWorkName(cleanName);
    if (isDuplicate) {
      return {
        success: false,
        error: `A work named "${cleanName}" already exists in the catalogue.`,
      };
    }

    const { dbWorkName, dbWorkType } = encodeWorkTypeInName(cleanName, workItem.work_type);

    try {
      const { data, error } = await supabase
        .from('billing_works')
        .insert([{
          work_name: dbWorkName,
          work_type: dbWorkType,
          is_active: workItem.is_active ?? true,
        }] as any)
        .select()
        .single();

      if (error) {
        console.error('Supabase work item insert error:', error);
        return { success: false, error: `Database error: ${error.message}` };
      }

      const decodedItem: WorkItem = {
        ...(data as any),
        work_name: cleanName,
        work_type: workItem.work_type,
      };

      localWorksCatalogue = [decodedItem, ...localWorksCatalogue];
      return { success: true, data: decodedItem };
    } catch (err: any) {
      console.error('Unexpected error creating work item:', err);
      return { success: false, error: `Unexpected error: ${err?.message || 'Failed to save work item'}` };
    }
  }

  /**
   * Custom Work helper for Phase 2.4
   */
  static async getOrCreateCustomWork(
    workName: string,
    workType: WorkType
  ): Promise<{ success: boolean; work?: WorkItem; isExisting: boolean; error?: string }> {
    const cleanName = workName.trim();
    if (!cleanName) {
      return { success: false, isExisting: false, error: 'Custom work name is required.' };
    }

    const catalogue = await this.getWorksCatalogue();
    const existing = catalogue.find(
      (w) => w.work_name.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (existing) {
      return { success: true, work: existing, isExisting: true };
    }

    const createRes = await this.createWorkItem({
      work_name: cleanName,
      work_type: workType,
      is_active: true,
    });

    if (!createRes.success || !createRes.data) {
      return { success: false, isExisting: false, error: createRes.error || 'Failed to save custom work.' };
    }

    return { success: true, work: createRes.data, isExisting: false };
  }

  /**
   * Edit existing work item
   */
  static async updateWorkItem(
    id: string,
    updates: Partial<Omit<WorkItem, 'id'>>
  ): Promise<{ success: boolean; data?: WorkItem; error?: string }> {
    let targetName = updates.work_name ? updates.work_name.trim() : undefined;

    if (targetName) {
      const isDuplicate = await this.checkDuplicateWorkName(targetName, id);
      if (isDuplicate) {
        return {
          success: false,
          error: `Another work named "${targetName}" already exists in the catalogue.`,
        };
      }
    }

    const dbPayload: any = { ...updates };
    if (updates.work_name || updates.work_type) {
      const current = localWorksCatalogue.find((w) => w.id === id);
      const effName = updates.work_name ? updates.work_name.trim() : (current?.work_name || '');
      const effType = updates.work_type ? updates.work_type : (current?.work_type || 'Labour');
      const { dbWorkName, dbWorkType } = encodeWorkTypeInName(effName, effType);
      dbPayload.work_name = dbWorkName;
      dbPayload.work_type = dbWorkType;
    }

    try {
      const { data, error } = await (supabase
        .from('billing_works') as any)
        .update(dbPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase work item update error:', error);
        return { success: false, error: `Database error: ${error.message}` };
      }

      const { work_name, work_type } = decodeWorkTypeFromName((data as any).work_name, (data as any).work_type);
      const decodedItem: WorkItem = {
        ...(data as any),
        work_name,
        work_type: work_type as WorkType,
      };

      localWorksCatalogue = localWorksCatalogue.map((w) =>
        w.id === id ? decodedItem : w
      );
      return { success: true, data: decodedItem };
    } catch (err: any) {
      console.error('Unexpected error updating work item:', err);
      return { success: false, error: `Unexpected error: ${err?.message || 'Failed to update work item'}` };
    }
  }

  /**
   * Safe Delete / Deactivation
   */
  static async safeDeleteOrDeactivateWork(
    id: string
  ): Promise<{ success: boolean; actionTaken: 'deactivated' | 'deleted'; message: string }> {
    try {
      const { data: refItems } = await supabase
        .from('billing_invoice_items')
        .select('id')
        .eq('work_id', id)
        .limit(1);

      const isReferenced = Boolean(refItems && refItems.length > 0);

      if (isReferenced) {
        await (supabase
          .from('billing_works') as any)
          .update({ is_active: false })
          .eq('id', id);

        localWorksCatalogue = localWorksCatalogue.map((w) =>
          w.id === id ? { ...w, is_active: false } : w
        );

        return {
          success: true,
          actionTaken: 'deactivated',
          message: 'Work is referenced in historical bills. Safely deactivated instead of deleting to preserve billing records.',
        };
      } else {
        const { error } = await supabase
          .from('billing_works')
          .delete()
          .eq('id', id);

        if (error) {
          localWorksCatalogue = localWorksCatalogue.map((w) =>
            w.id === id ? { ...w, is_active: false } : w
          );
          return {
            success: true,
            actionTaken: 'deactivated',
            message: 'Work set to inactive status.',
          };
        }

        localWorksCatalogue = localWorksCatalogue.filter((w) => w.id !== id);
        return {
          success: true,
          actionTaken: 'deleted',
          message: 'Work successfully removed from catalogue.',
        };
      }
    } catch {
      localWorksCatalogue = localWorksCatalogue.map((w) =>
        w.id === id ? { ...w, is_active: false } : w
      );
      return {
        success: true,
        actionTaken: 'deactivated',
        message: 'Work set to inactive status.',
      };
    }
  }

  /**
   * Create new invoice bill with atomic insertion
   */
  static async createInvoice(invoice: Invoice): Promise<{ success: boolean; data?: Invoice; error?: string }> {
    const cleanPlate = invoice.number_plate.trim().toUpperCase();
    if (!cleanPlate) {
      return { success: false, error: 'Vehicle Number Plate is required.' };
    }

    if (!invoice.items || invoice.items.length === 0) {
      return { success: false, error: 'Cannot save an empty bill. Please add at least one work item.' };
    }

    for (const item of invoice.items) {
      if (item.rate <= 0) {
        return { success: false, error: `Invalid rate for item "${item.work_name}". Rate must be greater than ₹0.` };
      }
    }

    const subtotalBeforeDiscount = invoice.items.reduce((sum, item) => sum + Number((item.quantity * item.rate).toFixed(2)), 0);
    const labourTotal = invoice.items
      .filter((i) => (i.work_type || '').toLowerCase() === 'labour')
      .reduce((sum, i) => sum + Number((i.quantity * i.rate).toFixed(2)), 0);
    const discountPct = Math.max(0, Math.min(100, invoice.labour_discount_percentage || 0));
    const discountAmt = discountPct > 0 ? Number(((labourTotal * discountPct) / 100).toFixed(2)) : 0;
    const finalGrandTotal = discountPct > 0 ? Number(Math.max(0, subtotalBeforeDiscount - discountAmt).toFixed(2)) : (invoice.grand_total || subtotalBeforeDiscount);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_number: invoice.invoice_number.trim(),
      number_plate: cleanPlate,
      mobile_number: invoice.mobile_number ? invoice.mobile_number.trim() : undefined,
      customer_name: invoice.customer_name ? invoice.customer_name.trim() : undefined,
      odometer: invoice.odometer ? invoice.odometer.toString().trim() : undefined,
      created_at: new Date().toISOString(),
      grand_total: finalGrandTotal,
      subtotal_before_discount: subtotalBeforeDiscount,
      labour_discount_percentage: discountPct > 0 ? discountPct : undefined,
      labour_discount_amount: discountAmt > 0 ? discountAmt : undefined,
      items: invoice.items.map((item, index) => ({
        ...item,
        s_no: index + 1,
        amount: Number((item.quantity * item.rate).toFixed(2)),
      })),
    };

    let uniqueInvoiceNo = newInvoice.invoice_number;
    try {
      const { data: existing } = await supabase
        .from('billing_invoices')
        .select('id')
        .eq('invoice_number', uniqueInvoiceNo)
        .maybeSingle();

      if (existing) {
        uniqueInvoiceNo = await this.generateNextInvoiceNumber();
      }
    } catch (err) {
      console.warn('Could not check invoice number collision:', err);
    }

    try {
      const hasExtraMeta = Boolean(newInvoice.customer_name?.trim() || newInvoice.odometer || (discountPct > 0));
      const storedContact = hasExtraMeta
        ? `${newInvoice.customer_name?.trim() || ''} /// ${(newInvoice.mobile_number || '').trim()} /// ${(newInvoice.odometer || '').toString().trim()} /// ${discountPct} /// ${discountAmt}`
        : (newInvoice.mobile_number?.trim() || null);

      const { data: headerData, error: headerError } = await supabase
        .from('billing_invoices')
        .insert([{
          invoice_number: uniqueInvoiceNo,
          number_plate: newInvoice.number_plate,
          mobile_number: storedContact,
          grand_total: newInvoice.grand_total,
        }] as any)
        .select()
        .single();

      if (headerError) {
        console.error('Supabase invoice header insert error:', headerError);
        return { success: false, error: `Database error saving invoice: ${headerError.message}` };
      }

      const invoiceId = (headerData as any).id;
      const lineItemRecords = newInvoice.items.map((item) => {
        const { dbWorkName, dbWorkType } = encodeWorkTypeInName(item.work_name, item.work_type);
        return {
          invoice_id: invoiceId,
          work_id: (item.work_id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(item.work_id)) ? item.work_id : null,
          s_no: item.s_no,
          work_name: dbWorkName,
          work_type: dbWorkType,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        };
      });

      const { error: itemsError } = await supabase
        .from('billing_invoice_items')
        .insert(lineItemRecords as any);

      if (itemsError) {
        await supabase.from('billing_invoices').delete().eq('id', invoiceId);
        console.error('Supabase invoice items insert error:', itemsError);
        return { success: false, error: `Database error saving line items: ${itemsError.message}` };
      }

      const createdInvoice: Invoice = {
        ...newInvoice,
        invoice_number: uniqueInvoiceNo,
        id: invoiceId,
        customer_name: newInvoice.customer_name?.trim() || undefined,
        odometer: newInvoice.odometer ? newInvoice.odometer.toString().trim() : undefined,
        created_at: (headerData as any).created_at || newInvoice.created_at,
      };

      localInvoicesStore.unshift(createdInvoice);
      return { success: true, data: createdInvoice };
    } catch (err: any) {
      console.error('Unexpected error creating invoice:', err);
      return { success: false, error: `Unexpected error: ${err?.message || 'Failed to save bill to database. Please check your connection.'}` };
    }
  }

  /**
   * Update existing invoice and replace its line items (Used by Modify Bill Module)
   */
  static async updateInvoice(
    invoiceId: string,
    updatedInvoice: Invoice
  ): Promise<{ success: boolean; data?: Invoice; error?: string }> {
    const cleanPlate = updatedInvoice.number_plate.trim().toUpperCase();
    if (!cleanPlate) {
      return { success: false, error: 'Vehicle Number Plate is required.' };
    }

    if (!updatedInvoice.items || updatedInvoice.items.length === 0) {
      return { success: false, error: 'Cannot save an empty bill. Please have at least one work item.' };
    }

    for (const item of updatedInvoice.items) {
      if (item.rate <= 0) {
        return { success: false, error: `Invalid rate for item "${item.work_name}". Rate must be greater than ₹0.` };
      }
    }

    const subtotalBeforeDiscount = updatedInvoice.items.reduce((sum, item) => sum + Number((item.quantity * item.rate).toFixed(2)), 0);
    const labourTotal = updatedInvoice.items
      .filter((i) => (i.work_type || '').toLowerCase() === 'labour')
      .reduce((sum, i) => sum + Number((i.quantity * i.rate).toFixed(2)), 0);
    const discountPct = Math.max(0, Math.min(100, updatedInvoice.labour_discount_percentage || 0));
    const discountAmt = discountPct > 0 ? Number(((labourTotal * discountPct) / 100).toFixed(2)) : 0;
    const finalGrandTotal = discountPct > 0 ? Number(Math.max(0, subtotalBeforeDiscount - discountAmt).toFixed(2)) : (updatedInvoice.grand_total || subtotalBeforeDiscount);

    try {
      const hasExtraMeta = Boolean(updatedInvoice.customer_name?.trim() || updatedInvoice.odometer || (discountPct > 0));
      const storedContact = hasExtraMeta
        ? `${updatedInvoice.customer_name?.trim() || ''} /// ${(updatedInvoice.mobile_number || '').trim()} /// ${(updatedInvoice.odometer || '').toString().trim()} /// ${discountPct} /// ${discountAmt}`
        : (updatedInvoice.mobile_number?.trim() || null);

      // 1. Update invoice header in Supabase
      const { error: headerError } = await (supabase
        .from('billing_invoices') as any)
        .update({
          number_plate: cleanPlate,
          mobile_number: storedContact,
          grand_total: finalGrandTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (headerError) {
        console.error('Supabase update invoice header error:', headerError);
        return { success: false, error: `Database error updating invoice: ${headerError.message}` };
      }

      // 2. Delete old line items
      const { error: deleteError } = await supabase
        .from('billing_invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (deleteError) {
        console.warn('Could not delete old invoice items:', deleteError);
      }

      // 3. Re-insert updated line items with safe work_type encoding
      const lineItemRecords = updatedInvoice.items.map((item, index) => {
        const { dbWorkName, dbWorkType } = encodeWorkTypeInName(item.work_name, item.work_type);
        return {
          invoice_id: invoiceId,
          work_id: (item.work_id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(item.work_id)) ? item.work_id : null,
          s_no: index + 1,
          work_name: dbWorkName,
          work_type: dbWorkType,
          quantity: item.quantity,
          rate: item.rate,
          amount: Number((item.quantity * item.rate).toFixed(2)),
        };
      });

      const { error: itemsError } = await supabase
        .from('billing_invoice_items')
        .insert(lineItemRecords as any);

      if (itemsError) {
        console.error('Supabase update invoice items insert error:', itemsError);
        return { success: false, error: `Database error saving updated line items: ${itemsError.message}` };
      }

      const finalizedInvoice: Invoice = {
        ...updatedInvoice,
        id: invoiceId,
        number_plate: cleanPlate,
        customer_name: updatedInvoice.customer_name?.trim() || undefined,
        odometer: updatedInvoice.odometer ? updatedInvoice.odometer.toString().trim() : undefined,
        grand_total: finalGrandTotal,
        subtotal_before_discount: subtotalBeforeDiscount,
        labour_discount_percentage: discountPct > 0 ? discountPct : undefined,
        labour_discount_amount: discountAmt > 0 ? discountAmt : undefined,
        items: updatedInvoice.items.map((item, idx) => ({
          ...item,
          s_no: idx + 1,
          amount: Number((item.quantity * item.rate).toFixed(2)),
        })),
        updated_at: new Date().toISOString(),
      };

      // Update local in-memory store
      localInvoicesStore = localInvoicesStore.map((inv) =>
        inv.id === invoiceId || inv.invoice_number === updatedInvoice.invoice_number
          ? finalizedInvoice
          : inv
      );

      return { success: true, data: finalizedInvoice };
    } catch (err: any) {
      console.error('Unexpected error updating invoice:', err);
      return { success: false, error: `Unexpected error: ${err?.message || 'Failed to update bill in database.'}` };
    }
  }

  /**
   * Search invoices by Number Plate, Invoice Number, or Customer Name (for Modify Bill Module)
   * If query is empty or omitted, returns the most recent invoices from database.
   */
  static async searchInvoicesForModification(query?: string): Promise<Invoice[]> {
    const rawQuery = (query || '').trim().toUpperCase();
    const cleanNoSpace = rawQuery.replace(/\s+/g, '');

    try {
      let req = supabase
        .from('billing_invoices')
        .select(`
          *,
          items:billing_invoice_items(
            *,
            work:billing_works(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(30);

      if (rawQuery) {
        const orConditions = [
          `number_plate.ilike.%${rawQuery}%`,
          `invoice_number.ilike.%${rawQuery}%`,
          `mobile_number.ilike.%${rawQuery}%`
        ];
        if (cleanNoSpace && cleanNoSpace !== rawQuery) {
          orConditions.push(`number_plate.ilike.%${cleanNoSpace}%`);
        }
        req = req.or(orConditions.join(','));
      }

      const { data, error } = await req;
      let invoices: Invoice[] = [];

      if (!error && data && data.length > 0) {
        invoices = (data as Invoice[]).map(decodeInvoice);
      } else {
        invoices = localInvoicesStore.map(decodeInvoice);
      }

      if (!rawQuery) {
        return invoices.slice(0, 15);
      }

      const filtered = invoices.filter((inv) => {
        const plateNorm = (inv.number_plate || '').toUpperCase().replace(/\s+/g, '');
        const plateRaw = (inv.number_plate || '').toUpperCase();
        const invNo = (inv.invoice_number || '').toUpperCase();
        const custName = (inv.customer_name || '').toUpperCase();
        const mobile = (inv.mobile_number || '').toUpperCase();

        return (
          plateRaw.includes(rawQuery) ||
          (cleanNoSpace && plateNorm.includes(cleanNoSpace)) ||
          invNo.includes(rawQuery) ||
          custName.includes(rawQuery) ||
          mobile.includes(rawQuery)
        );
      });

      return filtered;
    } catch {
      const allLocal = localInvoicesStore.map(decodeInvoice);
      if (!rawQuery) return allLocal.slice(0, 15);
      return allLocal.filter((inv) => {
        const plateNorm = (inv.number_plate || '').toUpperCase().replace(/\s+/g, '');
        const plateRaw = (inv.number_plate || '').toUpperCase();
        const invNo = (inv.invoice_number || '').toUpperCase();
        const custName = (inv.customer_name || '').toUpperCase();
        const mobile = (inv.mobile_number || '').toUpperCase();

        return (
          plateRaw.includes(rawQuery) ||
          (cleanNoSpace && plateNorm.includes(cleanNoSpace)) ||
          invNo.includes(rawQuery) ||
          custName.includes(rawQuery) ||
          mobile.includes(rawQuery)
        );
      });
    }
  }

  /**
   * Search invoices by Number Plate
   */
  static async searchInvoicesByNumberPlate(numberPlate: string): Promise<Invoice[]> {
    const cleanPlate = numberPlate.trim().toUpperCase();
    if (!cleanPlate) return [];

    try {
      const { data, error } = await supabase
        .from('billing_invoices')
        .select(`
          *,
          items:billing_invoice_items(
            *,
            work:billing_works(*)
          )
        `)
        .ilike('number_plate', `%${cleanPlate}%`)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return localInvoicesStore
          .filter((inv) => inv.number_plate.includes(cleanPlate))
          .map(decodeInvoice);
      }
      return (data as Invoice[]).map(decodeInvoice);
    } catch {
      return localInvoicesStore
        .filter((inv) => inv.number_plate.includes(cleanPlate))
        .map(decodeInvoice);
    }
  }

  /**
   * Fetch invoice history for statement printing (Phase 2.7)
   * Supports date range filters:
   * 1. 'till_now': All bills for number plate
   * 2. 'between_dates': Start date to End date
   * 3. 'after_date': From Start date onward
   */
  static async getPrintHistory(filter: PrintSearchFilter): Promise<Invoice[]> {
    const cleanPlate = filter.number_plate.trim().toUpperCase();
    if (!cleanPlate) return [];

    let invoices: Invoice[] = [];

    try {
      let query = supabase
        .from('billing_invoices')
        .select(`
          *,
          items:billing_invoice_items(
            *,
            work:billing_works(*)
          )
        `)
        .eq('number_plate', cleanPlate);

      if (filter.mode === 'between_dates' && filter.start_date && filter.end_date) {
        const startIso = new Date(filter.start_date).toISOString();
        const endIso = new Date(`${filter.end_date}T23:59:59.999Z`).toISOString();
        query = query.gte('created_at', startIso).lte('created_at', endIso);
      } else if (filter.mode === 'after_date' && filter.start_date) {
        const startIso = new Date(filter.start_date).toISOString();
        query = query.gte('created_at', startIso);
      }

      const { data, error } = await query.order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        invoices = (data as Invoice[]).map(decodeInvoice);
      } else {
        invoices = localInvoicesStore
          .filter((inv) => inv.number_plate === cleanPlate)
          .map(decodeInvoice);
      }
    } catch {
      invoices = localInvoicesStore
        .filter((inv) => inv.number_plate === cleanPlate)
        .map(decodeInvoice);
    }

    // Apply in-memory date filter fallback
    if (filter.mode === 'between_dates' && filter.start_date && filter.end_date) {
      const startTime = new Date(filter.start_date).getTime();
      const endTime = new Date(`${filter.end_date}T23:59:59.999Z`).getTime();
      invoices = invoices.filter((inv) => {
        const invTime = new Date(inv.created_at || Date.now()).getTime();
        return invTime >= startTime && invTime <= endTime;
      });
    } else if (filter.mode === 'after_date' && filter.start_date) {
      const startTime = new Date(filter.start_date).getTime();
      invoices = invoices.filter((inv) => {
        const invTime = new Date(inv.created_at || Date.now()).getTime();
        return invTime >= startTime;
      });
    }

    return invoices.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
  }
}

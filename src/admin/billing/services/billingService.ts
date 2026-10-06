import { supabase } from '../../../lib/supabase';
import type { WorkItem, Invoice, PrintSearchFilter, WorkType } from '../types/billing';

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
];

// In-memory fallback caches for development
let localWorksCatalogue: WorkItem[] = [...DEFAULT_SEED_WORKS];
let localInvoicesStore: Invoice[] = [];

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
   * Auto-suggest helper for Phase 2.6 & 2.7
   */
  static async getDistinctNumberPlates(searchQuery: string): Promise<string[]> {
    const cleanQuery = searchQuery.trim().toUpperCase();
    if (!cleanQuery) return [];

    try {
      const { data } = await supabase
        .from('billing_invoices')
        .select('number_plate')
        .ilike('number_plate', `%${cleanQuery}%`)
        .limit(20);

      const dbPlates = data ? (data as any[]).map((d) => d.number_plate.toUpperCase()) : [];
      const localPlates = localInvoicesStore
        .map((inv) => inv.number_plate.toUpperCase())
        .filter((plate) => plate.includes(cleanQuery));

      const combined = Array.from(new Set([...dbPlates, ...localPlates]));
      return combined;
    } catch {
      const localPlates = localInvoicesStore
        .map((inv) => inv.number_plate.toUpperCase())
        .filter((plate) => plate.includes(cleanQuery));
      return Array.from(new Set(localPlates));
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
      return data as WorkItem[];
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

    try {
      const { data, error } = await supabase
        .from('billing_works')
        .insert([{
          work_name: cleanName,
          work_type: workItem.work_type,
          is_active: workItem.is_active ?? true,
        }] as any)
        .select()
        .single();

      if (error) {
        console.error('Supabase work item insert error:', error);
        return { success: false, error: `Database error: ${error.message}` };
      }

      localWorksCatalogue = [data as WorkItem, ...localWorksCatalogue];
      return { success: true, data: data as WorkItem };
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
    if (updates.work_name) {
      const cleanName = updates.work_name.trim();
      const isDuplicate = await this.checkDuplicateWorkName(cleanName, id);
      if (isDuplicate) {
        return {
          success: false,
          error: `Another work named "${cleanName}" already exists in the catalogue.`,
        };
      }
      updates.work_name = cleanName;
    }

    try {
      const { data, error } = await (supabase
        .from('billing_works') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase work item update error:', error);
        return { success: false, error: `Database error: ${error.message}` };
      }

      localWorksCatalogue = localWorksCatalogue.map((w) =>
        w.id === id ? (data as WorkItem) : w
      );
      return { success: true, data: data as WorkItem };
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

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_number: invoice.invoice_number.trim(),
      number_plate: cleanPlate,
      mobile_number: invoice.mobile_number ? invoice.mobile_number.trim() : undefined,
      created_at: new Date().toISOString(),
      grand_total: invoice.grand_total,
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
      const { data: headerData, error: headerError } = await supabase
        .from('billing_invoices')
        .insert([{
          invoice_number: uniqueInvoiceNo,
          number_plate: newInvoice.number_plate,
          mobile_number: newInvoice.mobile_number || null,
          grand_total: newInvoice.grand_total,
        }] as any)
        .select()
        .single();

      if (headerError) {
        console.error('Supabase invoice header insert error:', headerError);
        return { success: false, error: `Database error saving invoice: ${headerError.message}` };
      }

      const invoiceId = (headerData as any).id;
      const lineItemRecords = newInvoice.items.map((item) => ({
        invoice_id: invoiceId,
        work_id: (item.work_id && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(item.work_id)) ? item.work_id : null,
        s_no: item.s_no,
        work_name: item.work_name,
        work_type: item.work_type,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }));

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
        return localInvoicesStore.filter((inv) =>
          inv.number_plate.includes(cleanPlate)
        );
      }
      return data as Invoice[];
    } catch {
      return localInvoicesStore.filter((inv) =>
        inv.number_plate.includes(cleanPlate)
      );
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
        invoices = data as Invoice[];
      } else {
        invoices = localInvoicesStore.filter((inv) => inv.number_plate === cleanPlate);
      }
    } catch {
      invoices = localInvoicesStore.filter((inv) => inv.number_plate === cleanPlate);
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

/**
 * SREE RAJA RAJESWARI MOTORS — BILLING SYSTEM DATA TYPES
 * Phase 2.1 Database Foundation Architecture
 */

export type WorkType = 'Labour' | 'Part';

export interface WorkItem {
  id: string;
  work_name: string;
  work_type: WorkType;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BillLineItem {
  id?: string;
  invoice_id?: string;
  work_id?: string | null; // Optional reference to Works Catalogue
  s_no: number;
  work_name: string;       // Snapshot of work name
  work_type: WorkType;     // Snapshot of work type ('Labour' | 'Part')
  quantity: number;        // Quick 1..10 or custom quantity
  is_custom_quantity?: boolean;
  rate: number;            // Admin enters rate manually per bill line
  amount: number;          // Amount = Quantity * Rate (Computed snapshot)
  created_at?: string;
}

export interface Invoice {
  id?: string;
  invoice_number: string;  // Unique invoice identifier
  number_plate: string;    // Primary reference key for billing history
  mobile_number?: string;  // Optional customer contact
  created_at?: string;
  updated_at?: string;
  items: BillLineItem[];
  grand_total: number;     // Calculated sum of line item amounts
  created_by?: string;
}

export type PrintSearchMode = 'till_now' | 'between_dates' | 'after_date';

export interface PrintSearchFilter {
  number_plate: string;
  mode: PrintSearchMode;
  start_date?: string;
  end_date?: string;
}

export type BillingModuleTab = 
  | 'dashboard'
  | 'create_bill'
  | 'search_bill'
  | 'print_bill'
  | 'works_catalogue';

export interface BillingModuleInfo {
  id: BillingModuleTab;
  title: string;
  shortDescription: string;
  iconName: string;
}

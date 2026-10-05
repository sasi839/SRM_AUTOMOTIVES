import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('SRM Billing System: Supabase environment variables missing or incomplete.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Utility to check Supabase backend connectivity safely
 */
export async function checkBillingDbConnection(): Promise<{
  connected: boolean;
  message: string;
  tablesDetected?: string[];
}> {
  try {
    const { data, error } = await supabase
      .from('billing_invoices')
      .select('id')
      .limit(1);

    if (error) {
      return {
        connected: false,
        message: `Supabase billing connection error: ${error.message}`,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to SREE RAJA RAJESWARI MOTORS Billing Database.',
      tablesDetected: ['billing_invoices', 'billing_invoice_items', 'billing_works'],
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to connect to billing database: ${err?.message || 'Unknown error'}`,
    };
  }
}

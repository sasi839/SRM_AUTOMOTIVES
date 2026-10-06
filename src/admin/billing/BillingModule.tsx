import React, { useState, useEffect } from 'react';
import type { BillingModuleTab } from './types/billing';
import { supabase } from '../../lib/supabase';
import { BillingHeader } from './components/layout/BillingHeader';
import { BillingSidebar } from './components/layout/BillingSidebar';

import { DashboardModule } from './components/modules/dashboard/DashboardModule';
import { CreateBillModule } from './components/modules/create-bill/CreateBillModule';
import { SearchBillModule } from './components/modules/search-bill/SearchBillModule';
import { PrintBillModule } from './components/modules/print-bill/PrintBillModule';
import { WorksCatalogueModule } from './components/modules/works-catalogue/WorksCatalogueModule';

async function checkBillingDbConnection() {
  try {
    const { error } = await supabase
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

export const BillingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BillingModuleTab>('dashboard');
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [dbMessage, setDbMessage] = useState<string>('Checking backend status...');

  useEffect(() => {
    async function verifyDb() {
      const res = await checkBillingDbConnection();
      setDbConnected(res.connected);
      setDbMessage(res.message);
    }
    verifyDb();
  }, []);

  return (
    <div className="flex-1 flex flex-col font-sans w-full h-full bg-slate-950 text-slate-100 rounded-b-2xl">
      <BillingHeader dbConnected={dbConnected} dbStatusMessage={dbMessage} />
      <div className="flex-1 flex flex-col lg:flex-row w-full h-full min-h-[500px]">
        <BillingSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main className="flex-1 p-4 md:p-6 bg-slate-950 overflow-y-auto w-full">
          {activeTab === 'dashboard' && <DashboardModule onNavigate={setActiveTab} dbConnected={dbConnected} />}
          {activeTab === 'create_bill' && <CreateBillModule />}
          {activeTab === 'search_bill' && <SearchBillModule />}
          {activeTab === 'print_bill' && <PrintBillModule />}
          {activeTab === 'works_catalogue' && <WorksCatalogueModule />}
        </main>
      </div>
    </div>
  );
};

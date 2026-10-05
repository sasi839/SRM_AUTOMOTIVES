import React, { useState, useEffect } from 'react';
import { BillingModuleTab } from './types/billing';
import { checkBillingDbConnection } from './lib/supabase';
import { BillingHeader } from './components/layout/BillingHeader';
import { BillingSidebar } from './components/layout/BillingSidebar';

import { DashboardModule } from './components/modules/dashboard/DashboardModule';
import { CreateBillModule } from './components/modules/create-bill/CreateBillModule';
import { SearchBillModule } from './components/modules/search-bill/SearchBillModule';
import { PrintBillModule } from './components/modules/print-bill/PrintBillModule';
import { WorksCatalogueModule } from './components/modules/works-catalogue/WorksCatalogueModule';

export function App() {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-900 selection:text-white">
      
      {/* Top Application Header */}
      <BillingHeader dbConnected={dbConnected} dbStatusMessage={dbMessage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Navigation Sidebar */}
        <BillingSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Module Content Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-950 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardModule onNavigate={setActiveTab} dbConnected={dbConnected} />
          )}

          {activeTab === 'create_bill' && (
            <CreateBillModule />
          )}

          {activeTab === 'search_bill' && (
            <SearchBillModule />
          )}

          {activeTab === 'print_bill' && (
            <PrintBillModule />
          )}

          {activeTab === 'works_catalogue' && (
            <WorksCatalogueModule />
          )}
        </main>

      </div>

      {/* Clean Application Footer — always at bottom */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          <strong className="text-slate-300">SREE RAJA RAJESWARI MOTORS</strong> — Multi-Brand Workshop Billing System
        </div>
        <div className="text-[11px] text-slate-500">
          📍 #184, Renigunta Road, S.V. Autonagar, Tirupati.
        </div>
      </footer>

    </div>
  );
}

export default App;

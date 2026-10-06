import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Search, 
  Printer, 
  BookOpen,
  ChevronRight
} from 'lucide-react';
import type { BillingModuleTab } from '../../types/billing';

interface BillingSidebarProps {
  activeTab: BillingModuleTab;
  onSelectTab: (tab: BillingModuleTab) => void;
}

export const NAV_ITEMS = [
  {
    id: 'dashboard' as BillingModuleTab,
    label: 'Dashboard Overview',
    icon: LayoutDashboard,
    description: 'Metrics overview & quick billing actions',
  },
  {
    id: 'create_bill' as BillingModuleTab,
    label: 'Create New Bill',
    icon: FilePlus2,
    description: 'Generate invoices with live total calculations',
  },
  {
    id: 'search_bill' as BillingModuleTab,
    label: 'Search Bill History',
    icon: Search,
    description: 'Lookup billing history by Number Plate',
  },
  {
    id: 'print_bill' as BillingModuleTab,
    label: 'Print Bill & Statement',
    icon: Printer,
    description: 'Generate statements (Till Now / Date Ranges)',
  },
  {
    id: 'works_catalogue' as BillingModuleTab,
    label: 'Works Catalogue',
    icon: BookOpen,
    description: 'Manage predefined works & auto-types',
  },
];

export const BillingSidebar: React.FC<BillingSidebarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <aside className="w-full lg:w-72 bg-slate-900/60 border-r border-slate-800 p-4 shrink-0">
      <div className="mb-4 px-3 py-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
          Main Navigation
        </span>
        <p className="text-xs font-semibold text-slate-200">
          Billing Management Hub
        </p>
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left p-3 rounded-xl transition-all duration-200 group flex items-center justify-between border cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-red-950/80 to-slate-900 border-red-600/70 text-white shadow-lg shadow-red-950/30'
                  : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  isActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block font-normal">
                    {item.description}
                  </span>
                </div>
              </div>

              <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${
                isActive ? 'text-red-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
              }`} />
            </button>
          );
        })}
      </nav>

      {/* Rules Notice Footer */}
      <div className="mt-8 p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
          Primary Reference Rule
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Billing history is strictly indexed by vehicle <strong className="text-slate-200">Number Plate</strong> for instant lookup and fast checkout.
        </p>
      </div>
    </aside>
  );
};

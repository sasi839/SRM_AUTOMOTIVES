import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  Printer, 
  BookOpen, 
  ShieldCheck, 
  Database,
  ArrowRight,
  Sparkles,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import type { BillingModuleTab } from '../../../types/billing';

interface DashboardModuleProps {
  onNavigate: (tab: BillingModuleTab) => void;
  dbConnected: boolean;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate, dbConnected }) => {
  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-900/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/40 border border-red-700/50 text-red-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            Official Workshop Billing System
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            SREE RAJA RAJESWARI MOTORS
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Multi-Brand Car Service & Repair Workshop Billing Management Console. 
            Create professional invoices, search historical records by Number Plate, and generate printable statements.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Secure Database Verified
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Database className="w-4 h-4" /> {dbConnected ? 'Database Connected' : 'Checking Database...'}
            </span>
          </div>
        </div>
      </div>

      {/* Module Quick Access Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-red-500" />
          Quick Actions & Operations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          
          {/* Create New Bill Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                Create New Bill
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Fast invoice generation with catalogue work selection, custom works, quick quantity controls (1–10 + Custom), and instant total calculation.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('create_bill')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-red-950/70 border border-slate-700 hover:border-red-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Create Bill Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>

          {/* Search Bill Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                Search Bill History
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Lookup vehicle invoice history instantly using vehicle <strong className="text-slate-200">Number Plate</strong> suggestions. View, print, download, or share past bills.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('search_bill')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-red-950/70 border border-slate-700 hover:border-red-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Search Vehicles</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>

          {/* Print Bill Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400">
                  <Printer className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                Print Bill & Statement
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Generate combined vehicle statement reports with options: Till Now, Between Two Dates, and After Specific Date. Print, PDF download, and WhatsApp share support.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('print_bill')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-red-950/70 border border-slate-700 hover:border-red-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Generate Statement</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>

          {/* Works Catalogue Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                Works Catalogue
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Manage predefined catalogue works mapped to Work Name + Work Type (Labour / Part) with duplicate protection and safe deactivation.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('works_catalogue')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-red-950/70 border border-slate-700 hover:border-red-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Manage Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>

        </div>
      </div>

      {/* Core Operational Rules Banner */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-red-500" />
          Core Workshop Billing Rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-red-400 font-bold block mb-1">Standard Table Layout</span>
            S.No | Work | Type | Quantity | Rate | Amount
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-red-400 font-bold block mb-1">Calculation Formula</span>
            Amount = Quantity × Rate (Automatically calculated)
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-red-400 font-bold block mb-1">Automatic Work Type</span>
            Selecting Work automatically sets Type (Labour or Part)
          </div>
        </div>
      </div>

    </div>
  );
};

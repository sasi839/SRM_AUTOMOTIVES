import React from 'react';
import { ShieldCheck, Database, Wrench, AlertTriangle, Layers } from 'lucide-react';

interface BillingHeaderProps {
  dbConnected: boolean;
  dbStatusMessage: string;
}

export const BillingHeader: React.FC<BillingHeaderProps> = ({ dbConnected, dbStatusMessage }) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 px-2 py-1 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center shadow-lg">
            <img src="/srm-logo.png" alt="SREE RAJA RAJESWARI MOTORS Logo" className="h-8 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                SREE RAJA RAJESWARI MOTORS
              </h1>
              <span className="bg-red-950/80 text-red-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-800/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                BILLING SYSTEM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              Multi-Brand Car Service & Repair Workshop
            </p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Database Connection Status Widget */}
          <div className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium transition-colors ${
            dbConnected 
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' 
              : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
          }`} title={dbStatusMessage}>
            <Database className={`w-4 h-4 ${dbConnected ? 'text-emerald-400' : 'text-amber-400 animate-bounce'}`} />
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{dbConnected ? 'System Online' : 'Connecting...'}</span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

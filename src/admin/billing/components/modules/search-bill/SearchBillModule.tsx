import React, { useState } from 'react';
import { 
  Search, 
  Car, 
  History, 
  Calendar, 
  FileText, 
  Eye, 
  Printer, 
  Download, 
  Share2, 
  X, 
  ShieldCheck,
  Hash,
  RefreshCw
} from 'lucide-react';
import type { Invoice } from '../../../types/billing';
import { BillingService } from '../../../services/billingService';
import { PdfService } from '../../../services/pdfService';
import { NumberPlateInput } from '../../common/NumberPlateInput';

export const SearchBillModule: React.FC = () => {
  const [searchPlate, setSearchPlate] = useState<string>('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchedPlate, setSearchedPlate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Perform Invoice Search
  const handleSearch = async (plateToSearch?: string) => {
    const targetPlate = (plateToSearch || searchPlate).trim().toUpperCase();
    if (!targetPlate) return;

    setLoading(true);
    setSearchedPlate(targetPlate);
    const results = await BillingService.searchInvoicesByNumberPlate(targetPlate);
    setInvoices(results);
    setLoading(false);
  };

  const handleSelectSuggestion = (plate: string) => {
    setSearchPlate(plate);
    handleSearch(plate);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950/80 border border-red-800/50 rounded-lg text-red-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Search Bill History</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Lookup stored invoices using vehicle Number Plate suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Number Plate Auto-Suggest Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Car className="w-4 h-4 text-red-500" />
          Vehicle Number Plate Search
        </h3>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }} 
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <NumberPlateInput 
              value={searchPlate}
              onChange={setSearchPlate}
              onSelectSuggestion={handleSelectSuggestion}
              placeholder="Type number plate (e.g. TN38, AP39)..."
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !searchPlate.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search History</span>
          </button>
        </form>
      </div>

      {/* Safety & No Owner Rules Notice */}
      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-200 block">Number Plate Primary Identifier</span>
          <p className="text-slate-400 leading-relaxed">
            Billing history is searched strictly using <strong className="text-slate-200">Vehicle Number Plate</strong>. 
            No complex customer accounts or owner profiles are required.
          </p>
        </div>
      </div>

      {/* SEARCH RESULTS LIST */}
      {searchedPlate && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-red-500" />
              Invoices for Vehicle Plate: <span className="font-mono text-red-400">{searchedPlate}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'} Found
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
              Searching invoice history...
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="font-semibold text-slate-300">No stored bills found for number plate "{searchedPlate}".</p>
              <p className="text-[11px] text-slate-500">You can create a new bill for this vehicle in the "Create New Bill" tab.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div 
                  key={inv.id || inv.invoice_number}
                  className="p-4 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white text-sm group-hover:text-red-400 transition-colors">
                        Invoice: {inv.invoice_number.replace(/^#/, '')}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-bold uppercase">
                        Paid / Verified
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(inv.created_at || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-slate-300">
                        <Car className="w-3.5 h-3.5 text-red-400" />
                        {inv.number_plate}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        {inv.items?.length || 0} Line Items
                      </span>
                    </div>

                    {/* Preview of Work Items */}
                    {inv.items && inv.items.length > 0 && (
                      <div className="text-[11px] text-slate-500 pt-1 line-clamp-1">
                        Works: {inv.items.map((i) => i.work_name).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Bill Total</span>
                      <span className="text-base font-mono font-extrabold text-emerald-400">
                        ₹ {inv.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-4 py-2 bg-slate-800 hover:bg-red-950/80 border border-slate-700 hover:border-red-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-red-400" />
                      <span>View Bill</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INDIVIDUAL INVOICE VIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white font-mono">
                  Invoice: {selectedInvoice.invoice_number.replace(/^#/, '')}
                </h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Completion Actions Bar */}
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => PdfService.printInvoice(selectedInvoice)}
                className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-red-400" /> Print
              </button>

              <button 
                onClick={() => PdfService.downloadInvoicePdf(selectedInvoice)}
                className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> PDF
              </button>

              <button 
                onClick={() => PdfService.shareInvoiceViaWhatsApp(selectedInvoice)}
                className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp
              </button>
            </div>

            {/* Invoice Meta Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Number Plate</span>
                <span className="font-mono font-bold text-red-400">{selectedInvoice.number_plate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Mobile Number</span>
                <span className="font-mono text-slate-300">{selectedInvoice.mobile_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Invoice Date</span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedInvoice.created_at || Date.now()).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3 w-12">S.No</th>
                    <th className="py-2.5 px-3">Work Description</th>
                    <th className="py-2.5 px-3 w-24">Type</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {selectedInvoice.items?.map((item) => (
                    <tr key={item.s_no} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{item.s_no}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{item.work_name}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                          item.work_type === 'Labour'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                        }`}>
                          {item.work_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-400">Grand Total Invoice Amount:</span>
              <span className="font-mono text-emerald-400 text-base">
                ₹ {selectedInvoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-right">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

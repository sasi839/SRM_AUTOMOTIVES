import React, { useState } from 'react';
import { 
  Printer, 
  Calendar, 
  Car, 
  Clock, 
  CalendarRange, 
  CalendarDays, 
  FileSpreadsheet, 
  RefreshCw, 
  FileText, 
  Download,
  Share2,
  Wrench
} from 'lucide-react';
import type { Invoice, PrintSearchMode, PrintSearchFilter } from '../../../types/billing';
import { BillingService } from '../../../services/billingService';
import { PdfService } from '../../../services/pdfService';
import { NumberPlateInput } from '../../common/NumberPlateInput';

export const PrintBillModule: React.FC = () => {
  const [numberPlate, setNumberPlate] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<PrintSearchMode>('till_now');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Results state
  const [statementInvoices, setStatementInvoices] = useState<Invoice[]>([]);
  const [activeFilter, setActiveFilter] = useState<PrintSearchFilter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Execute Statement Query
  const handleGenerateStatement = async (overridePlate?: string) => {
    setValidationError(null);
    const targetPlate = (overridePlate || numberPlate).trim().toUpperCase();

    if (!targetPlate) {
      setValidationError('Please enter or select a vehicle Number Plate.');
      return;
    }

    if (selectedMode === 'between_dates' && (!startDate || !endDate)) {
      setValidationError('Please select both Start Date and End Date for Option 2.');
      return;
    }

    if (selectedMode === 'after_date' && !startDate) {
      setValidationError('Please select a Start Date for Option 3.');
      return;
    }

    const filter: PrintSearchFilter = {
      number_plate: targetPlate,
      mode: selectedMode,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    setLoading(true);
    setActiveFilter(filter);
    const results = await BillingService.getPrintHistory(filter);
    setStatementInvoices(results);
    setLoading(false);
  };

  const handleSelectSuggestion = (plate: string) => {
    setNumberPlate(plate);
    handleGenerateStatement(plate);
  };

  // Grand Total of all separate billing events in the statement
  const statementGrandTotal = statementInvoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner with Business Branding */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/40 border border-red-500/30 shrink-0">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">SREE RAJA RAJESWARI MOTORS — Print Bill & Statement Generator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate combined vehicle statements or single invoice print/PDF/WhatsApp output.
            </p>
          </div>
        </div>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 bg-red-950/90 border border-red-800 text-red-200 rounded-xl text-xs font-medium flex items-center justify-between gap-3 shadow-lg">
          <span>{validationError}</span>
        </div>
      )}

      {/* SEARCH FORM & 3 OPTIONS SELECTOR */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl">
        
        {/* Step 1: Number Plate Auto-Suggest Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Car className="w-4 h-4 text-red-500" />
            Step 1: Enter or Select Vehicle Number Plate
          </label>
          <NumberPlateInput 
            value={numberPlate}
            onChange={setNumberPlate}
            onSelectSuggestion={handleSelectSuggestion}
            placeholder="Type or select stored number plate (e.g. TN38, AP39)..."
          />
        </div>

        {/* Step 2: Select Date Range Option Mode */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-500" />
            Step 2: Select Statement Range Option
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Option 1: Till Now */}
            <button
              type="button"
              onClick={() => setSelectedMode('till_now')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                selectedMode === 'till_now'
                  ? 'bg-gradient-to-br from-red-950/90 to-slate-900 border-red-600 shadow-lg shadow-red-950/40 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Clock className={`w-5 h-5 ${selectedMode === 'till_now' ? 'text-red-400' : 'text-slate-500'}`} />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedMode === 'till_now' ? 'bg-red-900 text-red-200' : 'bg-slate-900 text-slate-500'
                  }`}>
                    Option 1
                  </span>
                </div>
                <strong className="text-sm block text-white">Till Now</strong>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Includes all stored bills from inception to current date.
                </p>
              </div>
            </button>

            {/* Option 2: Between Two Dates */}
            <button
              type="button"
              onClick={() => setSelectedMode('between_dates')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                selectedMode === 'between_dates'
                  ? 'bg-gradient-to-br from-red-950/90 to-slate-900 border-red-600 shadow-lg shadow-red-950/40 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <CalendarRange className={`w-5 h-5 ${selectedMode === 'between_dates' ? 'text-red-400' : 'text-slate-500'}`} />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedMode === 'between_dates' ? 'bg-red-900 text-red-200' : 'bg-slate-900 text-slate-500'
                  }`}>
                    Option 2
                  </span>
                </div>
                <strong className="text-sm block text-white">Between Two Dates</strong>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Select a Start Date and End Date range.
                </p>
              </div>
            </button>

            {/* Option 3: After Specific Date */}
            <button
              type="button"
              onClick={() => setSelectedMode('after_date')}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                selectedMode === 'after_date'
                  ? 'bg-gradient-to-br from-red-950/90 to-slate-900 border-red-600 shadow-lg shadow-red-950/40 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <CalendarDays className={`w-5 h-5 ${selectedMode === 'after_date' ? 'text-red-400' : 'text-slate-500'}`} />
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    selectedMode === 'after_date' ? 'bg-red-900 text-red-200' : 'bg-slate-900 text-slate-500'
                  }`}>
                    Option 3
                  </span>
                </div>
                <strong className="text-sm block text-white">After Specific Date</strong>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Select a date to include all bills from that date onward.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Dynamic Date Inputs based on selected mode */}
        {selectedMode !== 'till_now' && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            {selectedMode === 'between_dates' && (
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  End Date <span className="text-red-400">*</span>
                </label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-600"
                />
              </div>
            )}
          </div>
        )}

        {/* Generate Action Button */}
        <div className="pt-2">
          <button 
            onClick={() => handleGenerateStatement()}
            disabled={loading || !numberPlate.trim()}
            className="w-full py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-red-950/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            <span>Fetch Statement Bills History</span>
          </button>
        </div>

      </div>

      {/* STATEMENT RESULTS PREVIEW VIEW */}
      {activeFilter && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6 shadow-2xl">
          
          {/* Statement Header & Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white">Statement Preview History</h3>
                <span className="text-[10px] bg-red-950 text-red-400 font-mono px-2.5 py-0.5 rounded border border-red-900 uppercase font-bold">
                  {activeFilter.mode.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Vehicle Plate: <strong className="text-red-400 font-mono">{activeFilter.number_plate}</strong> | Total Billing Events: <strong className="text-white">{statementInvoices.length}</strong>
              </p>
            </div>

            {/* STATEMENT ACTIONS: PRINT | DOWNLOAD PDF | SHARE VIA WHATSAPP */}
            {statementInvoices.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => PdfService.printStatement(statementInvoices, activeFilter)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  title="Print Statement Preview"
                >
                  <Printer className="w-4 h-4 text-red-400" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => PdfService.downloadStatementPdf(statementInvoices, activeFilter)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  title="Download Statement HTML PDF"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => PdfService.shareStatementViaWhatsApp(statementInvoices, activeFilter)}
                  className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  title="Share Statement Summary via WhatsApp"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>Share via WhatsApp</span>
                </button>
              </div>
            )}
          </div>

          {statementInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-600 mb-1" />
              <p className="font-semibold text-slate-300">No billing events found for number plate "{activeFilter.number_plate}" in the selected date range.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Separate Billing Events List */}
              {statementInvoices.map((invoice, invIndex) => (
                <div key={invoice.id || invoice.invoice_number} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                  
                  {/* Event Bar */}
                  <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-red-950 text-red-400 font-mono font-bold flex items-center justify-center text-[11px] border border-red-800/40">
                        {invIndex + 1}
                      </span>
                      <span className="font-mono font-bold text-white text-sm">
                        Invoice: {invoice.invoice_number.replace(/^#/, '')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-slate-400 font-medium text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(invoice.created_at || Date.now()).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>

                      <span className="text-emerald-400 font-mono font-bold">
                        Event Total: ₹{invoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>

                      {/* Single Invoice Actions for this specific event */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                        <button
                          onClick={() => PdfService.printInvoice(invoice)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Print Single Invoice"
                        >
                          <Printer className="w-3 h-3 text-red-400" /> Print Bill
                        </button>
                        <button
                          onClick={() => PdfService.downloadInvoicePdf(invoice)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Download Single Invoice PDF"
                        >
                          <Download className="w-3 h-3 text-emerald-400" /> PDF
                        </button>
                        <button
                          onClick={() => PdfService.shareInvoiceViaWhatsApp(invoice)}
                          className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          title="Share Single Invoice WhatsApp"
                        >
                          <Share2 className="w-3 h-3 text-emerald-400" /> WA
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Individual Works Table for this Event */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                          <th className="py-2.5 px-4 w-12">S.No</th>
                          <th className="py-2.5 px-4">Work Name</th>
                          <th className="py-2.5 px-4 w-28">Type</th>
                          <th className="py-2.5 px-4 w-20 text-center">Qty</th>
                          <th className="py-2.5 px-4 w-28 text-right">Rate (₹)</th>
                          <th className="py-2.5 px-4 w-32 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-slate-300">
                        {invoice.items.map((item) => (
                          <tr key={item.s_no} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-400">{item.s_no}</td>
                            <td className="py-2.5 px-4 font-semibold text-white">{item.work_name}</td>
                            <td className="py-2.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                item.work_type === 'Labour'
                                  ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                                  : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                              }`}>
                                {item.work_type}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center font-bold">{item.quantity}</td>
                            <td className="py-2.5 px-4 text-right font-mono">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                              ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              ))}

              {/* STATEMENT GRAND TOTAL SUMMARY BOX */}
              <div className="p-5 bg-slate-950 border-2 border-emerald-900/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Statement Summary</h4>
                  <p className="text-xs text-slate-400">
                    Calculated sum of all {statementInvoices.length} separate billing events for <span className="font-mono text-red-400">{activeFilter.number_plate}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Statement Grand Total</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">
                    ₹ {statementGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

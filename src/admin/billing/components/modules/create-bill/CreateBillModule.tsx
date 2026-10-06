import React, { useState, useEffect, useMemo } from 'react';
import { 
  FilePlus2, 
  Car, 
  Phone, 
  Plus, 
  Trash2, 
  Search, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  BookOpen, 
  Wrench, 
  Hash, 
  Calendar,
  RefreshCw,
  PlusCircle,
  Printer,
  Download,
  Share2,
  FileCheck
} from 'lucide-react';
import type { WorkItem, BillLineItem, Invoice, WorkType } from '../../../types/billing';
import { BillingService } from '../../../services/billingService';
import { PdfService } from '../../../services/pdfService';
import { NumberPlateInput } from '../../common/NumberPlateInput';
import { calculateLineAmount, calculateGrandTotal, QUICK_QUANTITY_OPTIONS } from '../../../services/calculationService';

export const CreateBillModule: React.FC = () => {
  // Invoice Header State
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [numberPlate, setNumberPlate] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [invoiceDate] = useState<string>(new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }));

  // Line Items State
  const [lineItems, setLineItems] = useState<BillLineItem[]>([]);

  // Works Catalogue Picker Modal State
  const [worksCatalogue, setWorksCatalogue] = useState<WorkItem[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [isLoadingWorks, setIsLoadingWorks] = useState<boolean>(false);

  // Custom Work Form Mode inside Modal
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customWorkName, setCustomWorkName] = useState<string>('');
  const [customWorkType, setCustomWorkType] = useState<WorkType>('Labour');
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [customIsCustomQty, setCustomIsCustomQty] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(0);
  const [customError, setCustomError] = useState<string | null>(null);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Validation & Saving State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // PHASE 2.5: Saved Invoice Completion View State
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Initialize Invoice Number & Works Catalogue on Load
  const loadCatalogueAndNumber = async () => {
    setIsLoadingWorks(true);
    const [nextNo, works] = await Promise.all([
      BillingService.generateNextInvoiceNumber(),
      BillingService.getWorksCatalogue()
    ]);
    setInvoiceNumber(nextNo);
    setWorksCatalogue(works);
    setIsLoadingWorks(false);
  };

  useEffect(() => {
    loadCatalogueAndNumber();
  }, []);

  // Filtered Catalogue Items for Picker Modal
  const filteredCatalogue = useMemo(() => {
    const activeWorks = worksCatalogue.filter((w) => w.is_active);
    if (!pickerSearch.trim()) return activeWorks;
    const query = pickerSearch.trim().toLowerCase();
    return activeWorks.filter((w) => w.work_name.toLowerCase().includes(query));
  }, [worksCatalogue, pickerSearch]);

  // Calculations
  const grandTotal = useMemo(() => calculateGrandTotal(lineItems), [lineItems]);
  
  const labourSubtotal = useMemo(() => {
    return lineItems
      .filter((i) => i.work_type === 'Labour')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [lineItems]);

  const partSubtotal = useMemo(() => {
    return lineItems
      .filter((i) => i.work_type === 'Part')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [lineItems]);

  // Add Selected Predefined Work from Catalogue to Bill Table
  const handleSelectWorkFromCatalogue = (work: WorkItem) => {
    setLineItems((prevItems) => {
      const newItem: BillLineItem = {
        s_no: prevItems.length + 1,
        work_id: work.id,
        work_name: work.work_name,
        work_type: work.work_type,
        quantity: 1,
        is_custom_quantity: false,
        rate: 0,
        amount: 0
      };
      return [...prevItems, newItem];
    });
    setIsPickerOpen(false);
    setPickerSearch('');
    setValidationError(null);
  };

  // Open Custom Work Form inside Modal
  const handleOpenCustomMode = () => {
    setCustomWorkName(pickerSearch.trim() || '');
    setCustomWorkType('Labour');
    setCustomQuantity(1);
    setCustomIsCustomQty(false);
    setCustomRate(0);
    setCustomError(null);
    setIsCustomMode(true);
  };

  // Save Custom Work & Add as Bill Line Item
  const handleAddCustomWorkToBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    const cleanName = customWorkName.trim();
    if (!cleanName) {
      setCustomError('Custom work name is required.');
      return;
    }

    if (customQuantity <= 0) {
      setCustomError('Quantity must be greater than 0.');
      return;
    }

    const res = await BillingService.getOrCreateCustomWork(cleanName, customWorkType);

    if (!res.success || !res.work) {
      setCustomError(res.error || 'Failed to process custom work.');
      return;
    }

    const workObj = res.work;
    const amount = calculateLineAmount(customQuantity, customRate);

    setLineItems((prevItems) => [
      ...prevItems,
      {
        s_no: prevItems.length + 1,
        work_id: workObj.id,
        work_name: workObj.work_name,
        work_type: workObj.work_type,
        quantity: customQuantity,
        is_custom_quantity: customIsCustomQty,
        rate: customRate,
        amount: amount,
      }
    ]);

    if (res.isExisting) {
      showToast(`Work "${workObj.work_name}" already exists in catalogue—used existing item.`, 'info');
    } else {
      showToast(`Custom work "${workObj.work_name}" saved to catalogue for future bills.`, 'success');
    }

    const updatedCatalogue = await BillingService.getWorksCatalogue();
    setWorksCatalogue(updatedCatalogue);

    setIsCustomMode(false);
    setIsPickerOpen(false);
    setPickerSearch('');
    setValidationError(null);
  };

  // Update Line Item Quantity
  const handleUpdateQuantity = (index: number, qty: number, isCustom: boolean = false) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };
      target.quantity = Math.max(0.01, qty);
      target.is_custom_quantity = isCustom;
      target.amount = calculateLineAmount(target.quantity, target.rate);
      updated[index] = target;
      return updated;
    });
  };

  // Update Line Item Rate
  const handleUpdateRate = (index: number, rate: number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index] };
      target.rate = Math.max(0, rate);
      target.amount = calculateLineAmount(target.quantity, target.rate);
      updated[index] = target;
      return updated;
    });
  };

  // Remove Line Item
  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((item, i) => ({ ...item, s_no: i + 1 }));
    });
  };

  // Reset Form for another bill
  const handleResetForm = async () => {
    setNumberPlate('');
    setMobileNumber('');
    setLineItems([]);
    setValidationError(null);
    setSavedInvoice(null);
    const nextNo = await BillingService.generateNextInvoiceNumber();
    setInvoiceNumber(nextNo);
  };

  // Save / Create Invoice
  const handleSaveBill = async () => {
    setValidationError(null);

    const cleanPlate = numberPlate.trim().toUpperCase();
    if (!cleanPlate) {
      setValidationError('Vehicle Number Plate is required.');
      return;
    }

    if (lineItems.length === 0) {
      setValidationError('Please add at least one work item to create a bill.');
      return;
    }

    const invalidRateItem = lineItems.find((i) => i.rate <= 0);
    if (invalidRateItem) {
      setValidationError(`Please enter a valid rate greater than ₹0 for "${invalidRateItem.work_name}".`);
      return;
    }

    const newInvoice: Invoice = {
      invoice_number: invoiceNumber,
      number_plate: cleanPlate,
      mobile_number: mobileNumber.trim() || undefined,
      items: lineItems,
      grand_total: grandTotal,
      created_at: new Date().toISOString()
    };

    setIsSaving(true);
    const result = await BillingService.createInvoice(newInvoice);
    setIsSaving(false);

    if (!result.success) {
      setValidationError(result.error || 'Failed to save bill. Please try again.');
      return;
    }

    // Set saved invoice to render Phase 2.5 Completion View directly
    setSavedInvoice(result.data || newInvoice);
    showToast(`Bill Invoice #${newInvoice.invoice_number} saved successfully!`);
  };

  /* ====================================================================
     PHASE 2.5: BILL CREATED SUCCESSFUL COMPLETION SCREEN
     ==================================================================== */
  if (savedInvoice) {
    const savedLabourSubtotal = savedInvoice.items
      .filter((i) => i.work_type === 'Labour')
      .reduce((sum, i) => sum + i.amount, 0);

    const savedPartSubtotal = savedInvoice.items
      .filter((i) => i.work_type === 'Part')
      .reduce((sum, i) => sum + i.amount, 0);

    return (
      <div className="space-y-6 animate-fadeIn">
        
        {/* Success Banner */}
        <div className="p-6 bg-emerald-950/80 border border-emerald-700/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <FileCheck className="w-3.5 h-3.5" /> Invoice Saved to Database
              </div>
              <h2 className="text-xl font-extrabold text-white">Bill Created Successfully!</h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Saved safely in Supabase. You can now Print, Download PDF, or Share via WhatsApp directly.
              </p>
            </div>
          </div>

          <button 
            onClick={handleResetForm}
            className="z-10 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Another Bill</span>
          </button>
        </div>

        {/* THREE DIRECT COMPLETION ACTIONS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Action 1: Print Bill */}
          <button 
            onClick={() => PdfService.printInvoice(savedInvoice)}
            className="p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-red-600/70 rounded-2xl flex items-center gap-4 transition-all duration-200 group text-left shadow-lg cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white group-hover:text-red-400 transition-colors block">
                Print Bill
              </span>
              <span className="text-[11px] text-slate-400">
                Open clean print layout & preview
              </span>
            </div>
          </button>

          {/* Action 2: Download PDF */}
          <button 
            onClick={() => PdfService.downloadInvoicePdf(savedInvoice)}
            className="p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-600/70 rounded-2xl flex items-center gap-4 transition-all duration-200 group text-left shadow-lg cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors block">
                Download PDF
              </span>
              <span className="text-[11px] text-slate-400">
                Save PDF document to device
              </span>
            </div>
          </button>

          {/* Action 3: Share via WhatsApp */}
          <button 
            onClick={() => PdfService.shareInvoiceViaWhatsApp(savedInvoice)}
            className="p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/70 rounded-2xl flex items-center gap-4 transition-all duration-200 group text-left shadow-lg cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950/90 border border-emerald-700/70 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors block">
                Share via WhatsApp
              </span>
              <span className="text-[11px] text-slate-400">
                {savedInvoice.mobile_number ? `Send to +91 ${savedInvoice.mobile_number}` : 'Share text summary link'}
              </span>
            </div>
          </button>

        </div>

        {/* FULL SAVED INVOICE DISPLAY CARD */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
          
          {/* Invoice Header Details */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-mono font-bold text-red-400 tracking-wider block">
                INVOICE #{savedInvoice.invoice_number}
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                SREE RAJA RAJESWARI MOTORS
              </h3>
              <p className="text-xs text-slate-400">
                Multi-Brand Garage Services & Maintenance
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Number Plate</span>
                <span className="font-mono font-bold text-red-400 text-sm">{savedInvoice.number_plate}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Mobile Number</span>
                <span className="font-mono text-slate-200">{savedInvoice.mobile_number || 'N/A'}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Date</span>
                <span className="font-mono text-slate-200">
                  {new Date(savedInvoice.created_at || Date.now()).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Saved Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 w-14">S.No</th>
                  <th className="py-3 px-4">Work Name</th>
                  <th className="py-3 px-4 w-28">Type</th>
                  <th className="py-3 px-4 w-24 text-center">Quantity</th>
                  <th className="py-3 px-4 w-32 text-right">Rate (₹)</th>
                  <th className="py-3 px-4 w-36 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {savedInvoice.items.map((item) => (
                  <tr key={item.s_no} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">{item.s_no}</td>
                    <td className="py-3 px-4 font-semibold text-white">{item.work_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        item.work_type === 'Labour'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      }`}>
                        {item.work_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs text-slate-400">
              <div>
                <span className="text-[10px] uppercase font-bold block text-slate-500">Labour Total</span>
                <span className="font-mono font-bold text-slate-200">₹{savedLabourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold block text-slate-500">Parts Total</span>
                <span className="font-mono font-bold text-slate-200">₹{savedPartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Grand Total Paid</span>
              <span className="text-2xl font-mono font-black text-emerald-400">
                ₹{savedInvoice.grand_total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

        </div>

      </div>
    );
  }

  /* ====================================================================
     STANDARD CREATE BILL WORKFLOW
     ==================================================================== */
  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-3 transition-all animate-bounce ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-700 text-emerald-200' 
            : 'bg-blue-950/95 border-blue-700 text-blue-200'
        }`}>
          <CheckCircle2 className={`w-4 h-4 ${toastMessage.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950/80 border border-red-800/50 rounded-lg text-red-400">
            <FilePlus2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Create New Invoice Bill</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate invoice with catalogue selection or Custom Works, then Print, Download PDF, or Share via WhatsApp directly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <Hash className="w-4 h-4 text-red-500" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Auto Invoice #</span>
            <span className="text-xs font-mono font-bold text-white tracking-wider">{invoiceNumber || 'Generating...'}</span>
          </div>
        </div>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-4 bg-red-950/90 border border-red-800 text-red-200 rounded-xl text-xs font-medium flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Invoice Reference Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Car className="w-4 h-4 text-red-500" />
          Vehicle Reference & Contact Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Number Plate (Required) */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Number Plate <span className="text-red-400">* (Primary Reference)</span>
            </label>
            <NumberPlateInput 
              value={numberPlate}
              onChange={setNumberPlate}
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Vehicle registration plate identifier</span>
          </div>

          {/* Mobile Number (Optional) */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Mobile Number <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 9876543210" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-slate-600"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Optional customer phone for WhatsApp share</span>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Invoice Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={invoiceDate} 
                disabled
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Bill Items Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        
        {/* Controls Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-white">Bill Line Items</h3>
            <span className="text-xs text-slate-500 font-mono">({lineItems.length} items added)</span>
          </div>

          <button 
            onClick={() => {
              setIsCustomMode(false);
              setIsPickerOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Select Work from Catalogue</span>
          </button>
        </div>

        {/* Bill Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-14">S.No</th>
                <th className="py-3.5 px-4">Work Name</th>
                <th className="py-3.5 px-4 w-28">Type</th>
                <th className="py-3.5 px-4 w-72">Quantity Selection</th>
                <th className="py-3.5 px-4 w-36">Rate (₹)</th>
                <th className="py-3.5 px-4 w-36 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 space-y-2">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-400">No works added to this bill yet.</p>
                    <p className="text-[11px] text-slate-500">Click <strong>"Select Work from Catalogue"</strong> above to pick predefined works or add custom works.</p>
                  </td>
                </tr>
              ) : (
                lineItems.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                    
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      {item.s_no}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {item.work_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        item.work_type === 'Labour'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      }`}>
                        {item.work_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1">
                          {QUICK_QUANTITY_OPTIONS.map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => handleUpdateQuantity(index, q, false)}
                              className={`w-6 h-6 rounded text-[11px] font-bold transition-all ${
                                !item.is_custom_quantity && item.quantity === q
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                              }`}
                            >
                              {q}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, item.is_custom_quantity ? item.quantity : 11, true)}
                            className={`px-2 h-6 rounded text-[10px] font-bold transition-all ${
                              item.is_custom_quantity
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                            }`}
                          >
                            Custom
                          </button>
                        </div>

                        {item.is_custom_quantity && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-slate-400 font-medium">Custom Qty:</span>
                            <input 
                              type="number"
                              min="0.01"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(index, parseFloat(e.target.value) || 0, true)}
                              className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-red-600"
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-slate-500 font-mono text-xs">₹</span>
                        <input 
                          type="number"
                          min="0"
                          step="any"
                          value={item.rate || ''}
                          onChange={(e) => handleUpdateRate(index, parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm text-emerald-400">
                      ₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button 
                        onClick={() => handleRemoveLineItem(index)}
                        className="p-1.5 hover:bg-red-950/80 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* Live Summary & Save Footer */}
        {lineItems.length > 0 && (
          <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Labour Subtotal</span>
                <span className="font-mono font-bold text-slate-200">
                  ₹ {labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Parts Subtotal</span>
                <span className="font-mono font-bold text-slate-200">
                  ₹ {partSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Grand Total Amount</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button 
                onClick={handleSaveBill}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{isSaving ? 'Saving Invoice...' : 'Create & Save Bill'}</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* WORKS CATALOGUE SELECTION & CUSTOM WORK MODAL */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-500" />
                {isCustomMode ? 'Create Other / Custom Work' : 'Select Work from Catalogue'}
              </h3>
              <button 
                onClick={() => {
                  setIsPickerOpen(false);
                  setIsCustomMode(false);
                }} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isCustomMode ? (
              <>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input 
                    type="text" 
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Search predefined works (e.g. Engine Oil, Brake, Service)..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {isLoadingWorks ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
                      Loading Works Catalogue...
                    </div>
                  ) : filteredCatalogue.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 text-xs space-y-2">
                      <p>No active works found matching "{pickerSearch}".</p>
                    </div>
                  ) : (
                    filteredCatalogue.map((work) => (
                      <button
                        key={work.id}
                        onClick={() => handleSelectWorkFromCatalogue(work)}
                        className="w-full p-3 rounded-xl bg-slate-950 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/60 text-left flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Wrench className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-white">{work.work_name}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          work.work_type === 'Labour'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                        }`}>
                          {work.work_type}
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500">Not finding the work?</span>
                  <button
                    onClick={handleOpenCustomMode}
                    className="px-4 py-2.5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border border-red-700/60 hover:border-red-500 text-red-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-red-400" />
                    <span>+ Other / Custom Work</span>
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleAddCustomWorkToBill} className="space-y-4 text-xs">
                
                {customError && (
                  <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{customError}</span>
                  </div>
                )}

                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-red-300 block mb-0.5">Duplicate Protection Active:</strong>
                  If this work already exists in the catalogue, it will reuse the existing work. If genuinely new, it will be saved to the Works Catalogue for future bills.
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Work Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text"
                    value={customWorkName}
                    onChange={(e) => setCustomWorkName(e.target.value)}
                    placeholder="e.g. Special Polish, Sensor Calibration..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomWorkType('Labour')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        customWorkType === 'Labour'
                          ? 'bg-blue-950/80 border-blue-600 text-blue-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Labour
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomWorkType('Part')}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        customWorkType === 'Part'
                          ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Part
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Quantity
                    </label>
                    <input 
                      type="number"
                      min="0.01"
                      step="any"
                      value={customQuantity}
                      onChange={(e) => setCustomQuantity(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Rate (₹) <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="number"
                      min="0"
                      step="any"
                      value={customRate || ''}
                      onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between font-bold">
                  <span className="text-slate-400">Calculated Line Amount:</span>
                  <span className="font-mono text-emerald-400 text-sm">
                    ₹ {calculateLineAmount(customQuantity, customRate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                  >
                    Back to Catalogue
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-md shadow-red-950/50"
                  >
                    Add Custom Work to Bill
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

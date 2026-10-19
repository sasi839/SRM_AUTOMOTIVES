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
  FileCheck,
  User,
  Gauge,
  Eye,
  ArrowLeft,
  Percent
} from 'lucide-react';
import type { WorkItem, BillLineItem, Invoice } from '../../../types/billing';
import { BillingService } from '../../../services/billingService';
import { PdfService } from '../../../services/pdfService';
import { NumberPlateInput } from '../../common/NumberPlateInput';
import { 
  calculateLineAmount, 
  calculateGrandTotal, 
  organizeLineItemsByType, 
  QUICK_QUANTITY_OPTIONS,
  calculateLabourDiscountAmount
} from '../../../services/calculationService';

export const CreateBillModule: React.FC = () => {
  // Invoice Header State
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [numberPlate, setNumberPlate] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [odometer, setOdometer] = useState<string>('');
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
  const [customWorkType, setCustomWorkType] = useState<string>('Labour');
  const [customTypeName, setCustomTypeName] = useState<string>('');
  const [isCustomTypeSelected, setIsCustomTypeSelected] = useState<boolean>(false);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [customIsCustomQty, setCustomIsCustomQty] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(0);
  const [customError, setCustomError] = useState<string | null>(null);

  // 2-Step Verification Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Labour Discount State
  const [applyLabourDiscount, setApplyLabourDiscount] = useState<boolean>(false);
  const [labourDiscountPercentage, setLabourDiscountPercentage] = useState<number>(0);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Validation & Saving State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // PHASE 2.5: Saved Invoice Completion View State
  const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);

  // Auto-populated Customer Details State
  const [autoPopulatedNotice, setAutoPopulatedNotice] = useState<string | null>(null);
  const [, setIsFetchingCustomer] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Auto-fill customer details for pre-existing vehicle plate
  const handleAutoFillCustomerDetails = async (plate: string) => {
    const cleanPlate = (plate || '').trim().toUpperCase();
    if (cleanPlate.replace(/\s+/g, '').length < 3) {
      setAutoPopulatedNotice(null);
      return;
    }

    setIsFetchingCustomer(true);
    const details = await BillingService.getCustomerDetailsByPlate(cleanPlate);
    setIsFetchingCustomer(false);

    if (details) {
      if (details.customer_name) {
        setCustomerName(details.customer_name);
      }
      if (details.mobile_number) {
        setMobileNumber(details.mobile_number);
      }
      if (details.customer_name || details.mobile_number) {
        setAutoPopulatedNotice(`Found existing customer records for ${cleanPlate}. Name & mobile loaded (you can modify them anytime).`);
      }
    } else {
      setAutoPopulatedNotice(null);
    }
  };

  // Debounced auto-fetch as user types number plate
  useEffect(() => {
    const clean = numberPlate.trim().toUpperCase().replace(/\s+/g, '');
    if (clean.length < 4) {
      setAutoPopulatedNotice(null);
      return;
    }

    const timer = setTimeout(() => {
      handleAutoFillCustomerDetails(numberPlate);
    }, 400);

    return () => clearTimeout(timer);
  }, [numberPlate]);

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
  const subtotalBeforeDiscount = useMemo(() => calculateGrandTotal(lineItems), [lineItems]);
  
  const labourSubtotal = useMemo(() => {
    return lineItems
      .filter((i) => (i.work_type || '').toLowerCase() === 'labour')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [lineItems]);

  const partSubtotal = useMemo(() => {
    return lineItems
      .filter((i) => (i.work_type || '').toLowerCase() === 'part')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [lineItems]);

  const otherSubtotal = useMemo(() => {
    return lineItems
      .filter((i) => (i.work_type || '').toLowerCase() !== 'labour' && (i.work_type || '').toLowerCase() !== 'part')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [lineItems]);

  const labourDiscountAmount = useMemo(() => {
    if (!applyLabourDiscount || labourSubtotal <= 0 || labourDiscountPercentage <= 0) return 0;
    return calculateLabourDiscountAmount(labourSubtotal, labourDiscountPercentage);
  }, [applyLabourDiscount, labourSubtotal, labourDiscountPercentage]);

  const netLabourTotal = useMemo(() => {
    return Math.max(0, Number((labourSubtotal - labourDiscountAmount).toFixed(2)));
  }, [labourSubtotal, labourDiscountAmount]);

  const grandTotal = useMemo(() => {
    return Math.max(0, Number((subtotalBeforeDiscount - labourDiscountAmount).toFixed(2)));
  }, [subtotalBeforeDiscount, labourDiscountAmount]);

  const getWorkTypeBadgeClass = (type: string) => {
    if (type === 'Labour') return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    if (type === 'Part') return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    if (type === 'Towing') return 'bg-sky-950/80 text-sky-300 border-sky-800/60';
    return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
  };

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
    setCustomTypeName('');
    setIsCustomTypeSelected(false);
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

    const effectiveType = isCustomTypeSelected
      ? (customTypeName.trim() || 'Custom')
      : customWorkType;

    if (isCustomTypeSelected && !customTypeName.trim()) {
      setCustomError('Please enter a custom type name.');
      return;
    }

    if (customQuantity <= 0) {
      setCustomError('Quantity must be greater than 0.');
      return;
    }

    const res = await BillingService.getOrCreateCustomWork(cleanName, effectiveType);

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
        work_type: effectiveType,
        quantity: customQuantity,
        is_custom_quantity: customIsCustomQty,
        rate: customRate,
        amount: amount,
      }
    ]);

    if (res.isExisting) {
      showToast(`Work "${workObj.work_name}" already exists in catalogue—used existing item.`, 'info');
    } else {
      showToast(`Custom work "${workObj.work_name}" (${effectiveType}) saved to catalogue for future bills.`, 'success');
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
    setCustomerName('');
    setNumberPlate('');
    setMobileNumber('');
    setOdometer('');
    setLineItems([]);
    setValidationError(null);
    setAutoPopulatedNotice(null);
    setSavedInvoice(null);
    setApplyLabourDiscount(false);
    setLabourDiscountPercentage(0);
    const nextNo = await BillingService.generateNextInvoiceNumber();
    setInvoiceNumber(nextNo);
  };

  // Open 2-Step Verification Preview Modal
  const handleOpenPreviewModal = () => {
    setValidationError(null);

    const cleanPlate = numberPlate.trim().toUpperCase();
    if (!cleanPlate) {
      setValidationError('Vehicle Number Plate is required before previewing or saving.');
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

    // Automatically organize series of work types: Parts -> Labour -> Towing -> Other with continuous S.No
    const organizedItems = organizeLineItemsByType(lineItems);
    setLineItems(organizedItems);

    setIsPreviewModalOpen(true);
  };

  // Confirm and Upload Invoice (Step 2 of Verification)
  const handleConfirmUpload = async () => {
    setValidationError(null);
    const cleanPlate = numberPlate.trim().toUpperCase();

    // Ensure items are organized by type and re-indexed
    const finalItems = organizeLineItemsByType(lineItems);

    const newInvoice: Invoice = {
      invoice_number: invoiceNumber,
      customer_name: customerName.trim() || undefined,
      number_plate: cleanPlate,
      mobile_number: mobileNumber.trim() || undefined,
      odometer: odometer.trim() || undefined,
      items: finalItems,
      grand_total: grandTotal,
      subtotal_before_discount: subtotalBeforeDiscount,
      labour_discount_percentage: applyLabourDiscount && labourDiscountPercentage > 0 ? labourDiscountPercentage : undefined,
      labour_discount_amount: applyLabourDiscount && labourDiscountAmount > 0 ? labourDiscountAmount : undefined,
      created_at: new Date().toISOString()
    };

    setIsSaving(true);
    const result = await BillingService.createInvoice(newInvoice);
    setIsSaving(false);

    if (!result.success) {
      setValidationError(result.error || 'Failed to save bill. Please try again.');
      setIsPreviewModalOpen(false);
      return;
    }

    setIsPreviewModalOpen(false);
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

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-medium">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Name</span>
                <span className="font-bold text-white text-sm">{savedInvoice.customer_name || 'N/A'}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Number Plate</span>
                <span className="font-mono font-bold text-red-400 text-sm">{savedInvoice.number_plate}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Mobile Number</span>
                <span className="font-mono text-slate-200">{savedInvoice.mobile_number || 'N/A'}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">Odometer</span>
                <span className="font-mono text-slate-200">{savedInvoice.odometer ? `${savedInvoice.odometer} km` : 'N/A'}</span>
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
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div>
                <span className="text-[10px] uppercase font-bold block text-slate-500">Labour Total</span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  {savedInvoice.labour_discount_percentage ? (
                    <>
                      <span className="text-slate-500 line-through text-[11px]">
                        ₹{savedLabourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-bold text-slate-200">
                        ₹{Math.max(0, savedLabourSubtotal - (savedInvoice.labour_discount_amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono font-bold text-slate-200">₹{savedLabourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold block text-slate-500">Parts Total</span>
                <span className="font-mono font-bold text-slate-200">₹{savedPartSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {savedInvoice.labour_discount_percentage && (
                <div className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-emerald-300 font-bold flex items-center gap-1.5 text-[11px]">
                  <span>🎉 Labour Savings: ₹{(savedInvoice.labour_discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({savedInvoice.labour_discount_percentage}% OFF)</span>
                </div>
              )}
            </div>

            <div className="text-right">
              {savedInvoice.labour_discount_percentage && (
                <span className="text-[11px] text-slate-500 line-through font-mono block">
                  Original: ₹ {(savedInvoice.subtotal_before_discount || (savedLabourSubtotal + savedPartSubtotal)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          
          {/* Name (Optional) */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Name <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. K. Ramesh" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-slate-600"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Customer / contact person name</span>
          </div>

          {/* Number Plate (Required) */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Number Plate <span className="text-red-400">* (Primary Reference)</span>
            </label>
            <NumberPlateInput 
              value={numberPlate}
              onChange={setNumberPlate}
              onSelectSuggestion={(plate, suggestion) => {
                setNumberPlate(plate);
                if (suggestion?.customer_name) {
                  setCustomerName(suggestion.customer_name);
                }
                if (suggestion?.mobile_number) {
                  setMobileNumber(suggestion.mobile_number);
                }
                if (suggestion?.customer_name || suggestion?.mobile_number) {
                  setAutoPopulatedNotice(`Found previous records for ${plate}. Loaded customer name and mobile number. You can freely edit them.`);
                } else {
                  handleAutoFillCustomerDetails(plate);
                }
              }}
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
            <span className="text-[10px] text-slate-500 mt-1 block">Customer mobile for WhatsApp</span>
          </div>

          {/* Odometer Reading (Optional) */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Odometer <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Gauge className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                value={odometer} 
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="e.g. 45200" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-slate-600"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Vehicle odometer reading (km)</span>
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

        {/* Auto-Populated Notice for Previous Customer Records */}
        {autoPopulatedNotice && (
          <div className="flex items-center justify-between p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{autoPopulatedNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoPopulatedNotice(null)}
              className="text-emerald-400 hover:text-emerald-200 text-[11px] font-bold cursor-pointer ml-3 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
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

          <div className="flex items-center gap-2">
            {lineItems.length > 1 && (
              <button 
                type="button"
                onClick={() => {
                  setLineItems(organizeLineItemsByType(lineItems));
                  showToast('Works organized by type: Parts → Labour → Towing → Other!', 'info');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Automatically organize all works into Parts, Labour, Towing, and Other types with sequential S.No"
              >
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                <span>Auto-Organize by Type</span>
              </button>
            )}

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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getWorkTypeBadgeClass(item.work_type)}`}>
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
                <div className="flex items-baseline gap-1.5 font-mono">
                  {applyLabourDiscount && labourDiscountAmount > 0 ? (
                    <>
                      <span className="text-slate-500 line-through text-[11px]">
                        ₹{labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-bold text-slate-200">
                        ₹{netLabourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono font-bold text-slate-200">
                      ₹ {labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Parts Subtotal</span>
                <span className="font-mono font-bold text-slate-200">
                  ₹ {partSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {otherSubtotal > 0 && (
                <div>
                  <span className="block text-[10px] uppercase font-bold text-sky-400">Towing / Other</span>
                  <span className="font-mono font-bold text-sky-300">
                    ₹ {otherSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {labourSubtotal > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setApplyLabourDiscount(!applyLabourDiscount);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    applyLabourDiscount
                      ? 'bg-emerald-950 border border-emerald-600/70 text-emerald-300'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  <span>{applyLabourDiscount ? (labourDiscountPercentage > 0 ? `Labour Discount: ${labourDiscountPercentage}% OFF (-₹${labourDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})` : 'Labour Discount Active (0% - Enter in Preview)') : 'Apply Labour Discount'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-right">
                {applyLabourDiscount && labourDiscountAmount > 0 && (
                  <span className="text-[10px] text-slate-500 line-through font-mono block">
                    Original: ₹ {subtotalBeforeDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Grand Total Amount</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleOpenPreviewModal}
                  type="button"
                  className="flex-1 sm:flex-none px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Eye className="w-4 h-4 text-slate-300" />
                  <span>Preview Bill</span>
                </button>

                <button 
                  onClick={handleOpenPreviewModal}
                  disabled={isSaving}
                  type="button"
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Invoice...' : 'Create & Save Bill'}</span>
                </button>
              </div>
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

                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getWorkTypeBadgeClass(work.work_type)}`}>
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomWorkType('Labour');
                        setIsCustomTypeSelected(false);
                      }}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        !isCustomTypeSelected && customWorkType === 'Labour'
                          ? 'bg-blue-950/80 border-blue-600 text-blue-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Labour
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomWorkType('Part');
                        setIsCustomTypeSelected(false);
                      }}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        !isCustomTypeSelected && customWorkType === 'Part'
                          ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Part
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomWorkType('Towing');
                        setIsCustomTypeSelected(false);
                      }}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        !isCustomTypeSelected && customWorkType === 'Towing'
                          ? 'bg-sky-950/80 border-sky-600 text-sky-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Towing
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomTypeSelected(true)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        isCustomTypeSelected
                          ? 'bg-purple-950/80 border-purple-600 text-purple-300 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  {isCustomTypeSelected && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customTypeName}
                        onChange={(e) => setCustomTypeName(e.target.value)}
                        placeholder="Type custom name (e.g. Inspection, Washing, Painting)..."
                        className="w-full bg-slate-950 border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                  )}
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

      {/* 2-STEP VERIFICATION PREVIEW MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    Review Bill Before Saving
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                      2-Step Verification
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Please review vehicle, customer, and all work item charges before confirming upload.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill Header Meta Summary Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Invoice #</span>
                <span className="font-mono font-bold text-red-400">{invoiceNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Date</span>
                <span className="font-semibold text-slate-300">{invoiceDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Vehicle Plate</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded inline-block">
                  {numberPlate.trim().toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer Name</span>
                <span className="font-semibold text-slate-300">{customerName.trim() || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Odometer</span>
                <span className="font-mono font-semibold text-slate-300">{odometer.trim() ? `${odometer.trim()} km` : '—'}</span>
              </div>
            </div>

            {/* Auto-Organized Series Notice Banner */}
            <div className="px-3.5 py-2 bg-emerald-950/60 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auto-Adjusted Sequence: <strong>1. Parts</strong> &rarr; <strong>2. Labour</strong> &rarr; <strong>3. Towing</strong> &rarr; <strong>4. Other</strong></span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400/80 font-bold">Sequential S.No 1..{lineItems.length}</span>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                    <th className="py-2.5 px-3">Work Description</th>
                    <th className="py-2.5 px-3 w-24">Type</th>
                    <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-32 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {lineItems.map((item) => (
                    <tr key={item.s_no} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-center text-slate-500">{item.s_no}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{item.work_name}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getWorkTypeBadgeClass(item.work_type)}`}>
                          {item.work_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 font-mono text-right">
                        ₹ {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-right text-emerald-400">
                        ₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LABOUR CHARGES DISCOUNT TOGGLE & PERCENTAGE SELECTOR */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    applyLabourDiscount ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Labour Charges Discount</span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Only for Labour
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Total Labour available for discount: <strong className="font-mono text-slate-200">₹{labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                {labourSubtotal > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setApplyLabourDiscount(!applyLabourDiscount);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      applyLabourDiscount
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{applyLabourDiscount ? 'Discount Active' : 'Toggle Discount'}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${applyLabourDiscount ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">No Labour items in this bill</span>
                )}
              </div>

              {/* Discount Percentage Controls & Flipkart/Amazon Style Savings Callout */}
              {applyLabourDiscount && labourSubtotal > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300 mr-1">Quick Select %:</span>
                    {[5, 10, 15, 20, 25, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setLabourDiscountPercentage(pct)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                          labourDiscountPercentage === pct
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {pct}% OFF
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-xs text-slate-400 font-medium">Custom %:</span>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={labourDiscountPercentage || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setLabourDiscountPercentage(Math.max(0, Math.min(100, val)));
                          }}
                          placeholder="0"
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="absolute right-1.5 top-1 text-slate-400 text-xs font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Prompt when % is 0 */}
                  {labourDiscountPercentage === 0 && (
                    <div className="p-2.5 bg-slate-900 border border-dashed border-slate-700 rounded-lg text-xs text-amber-300/90 flex items-center gap-2">
                      <span>👉</span>
                      <span>Discount enabled. Please select a percentage above or type a custom % to calculate savings.</span>
                    </div>
                  )}

                  {/* Flipkart / Amazon Style Savings Banner */}
                  {labourDiscountPercentage > 0 && (
                    <div className="p-3 bg-gradient-to-r from-emerald-950/90 via-slate-950 to-emerald-950/90 border border-emerald-600/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-400/30 shrink-0">
                          🎉
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/60">
                              Flipkart / Amazon Style Savings
                            </span>
                            <span className="text-xs font-extrabold text-emerald-400">
                              {labourDiscountPercentage}% OFF APPLIED
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white mt-0.5">
                            Customer saves <strong className="text-emerald-400 font-mono font-extrabold">₹ {labourDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> on Labour charges!
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Net Labour Charges</span>
                        <div className="flex items-baseline justify-end gap-2">
                          <span className="text-xs text-slate-500 line-through font-mono">
                            ₹ {labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-sm font-extrabold font-mono text-emerald-400">
                            ₹ {netLabourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subtotals & Grand Total Bar */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Labour Total</span>
                  <div className="flex items-baseline gap-1.5 font-mono">
                    {applyLabourDiscount && labourDiscountAmount > 0 ? (
                      <>
                        <span className="text-slate-500 line-through text-[11px]">
                          ₹{labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="font-bold text-slate-200">
                          ₹{netLabourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-emerald-400 font-bold text-[10px]">
                          (-₹{labourDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-slate-200">
                        ₹{labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Parts Total</span>
                  <span className="font-mono font-bold text-slate-200">
                    ₹ {partSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {otherSubtotal > 0 && (
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-sky-400">Towing / Other</span>
                    <span className="font-mono font-bold text-sky-300">
                      ₹ {otherSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-right">
                {applyLabourDiscount && labourDiscountAmount > 0 && (
                  <span className="text-[11px] text-slate-400 line-through font-mono block">
                    Original Total: ₹ {subtotalBeforeDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount Payable</span>
                <span className="text-2xl font-mono font-extrabold text-emerald-400">
                  ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                {applyLabourDiscount && labourDiscountAmount > 0 && (
                  <span className="text-[10px] font-extrabold text-emerald-400 block">
                    🎉 Total Savings: ₹{labourDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Edit / Add More Works</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Uploading Bill...' : 'Confirm & Upload Bill to Database'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

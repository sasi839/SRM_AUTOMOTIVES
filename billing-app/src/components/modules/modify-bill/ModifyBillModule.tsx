import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileEdit, 
  Search, 
  Lock, 
  Unlock, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  BookOpen, 
  X, 
  Save, 
  Printer, 
  Download, 
  Share2, 
  Car, 
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Percent
} from 'lucide-react';
import type { Invoice, BillLineItem, WorkItem } from '../../../types/billing';
import { BillingService } from '../../../services/billingService';
import { PdfService } from '../../../services/pdfService';
import { 
  calculateLineAmount, 
  calculateGrandTotal, 
  organizeLineItemsByType,
  calculateLabourDiscountAmount
} from '../../../services/calculationService';
import { NumberPlateInput } from '../../common/NumberPlateInput';

/**
 * SHA-256 hash of password "5523"
 */
const MODIFY_PASSWORD_HASH = '13b1475cbe243903914ceaa33c2335db2d7e0c23c79e0df8a0da7d8d311944ee';

async function hashInput(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const ModifyBillModule: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('srm_modify_unlocked') === 'true';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // Search & Suggestions State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Invoice[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [plateSuggestions, setPlateSuggestions] = useState<string[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Selected Invoice for Modification
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [originalInvoiceSnapshot, setOriginalInvoiceSnapshot] = useState<Invoice | null>(null);

  // Editable Form Fields
  const [editPlate, setEditPlate] = useState<string>('');
  const [editCustomerName, setEditCustomerName] = useState<string>('');
  const [editMobile, setEditMobile] = useState<string>('');
  const [editOdometer, setEditOdometer] = useState<string>('');
  const [editItems, setEditItems] = useState<BillLineItem[]>([]);
  const [editApplyDiscount, setEditApplyDiscount] = useState<boolean>(false);
  const [editDiscountPercentage, setEditDiscountPercentage] = useState<number>(0);

  // Works Catalogue Picker Modal inside Modify Module
  const [worksCatalogue, setWorksCatalogue] = useState<WorkItem[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [isLoadingCatalogue, setIsLoadingCatalogue] = useState<boolean>(false);

  // Custom Work Item inside Modify Module
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customWorkName, setCustomWorkName] = useState<string>('');
  const [customWorkType, setCustomWorkType] = useState<string>('Labour');
  const [customTypeName, setCustomTypeName] = useState<string>('');
  const [isCustomTypeSelected, setIsCustomTypeSelected] = useState<boolean>(false);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [customRate, setCustomRate] = useState<number>(0);
  const [customError, setCustomError] = useState<string | null>(null);

  // Confirmation & Save State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessInvoice, setSaveSuccessInvoice] = useState<Invoice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Works Catalogue & Initial Recent Invoices
  const loadInitialData = async () => {
    setIsLoadingCatalogue(true);
    setIsSearching(true);
    try {
      const [works, recentBills] = await Promise.all([
        BillingService.getWorksCatalogue(),
        BillingService.searchInvoicesForModification(''),
      ]);
      setWorksCatalogue(works);
      setSearchResults(recentBills);
      setHasSearched(true);
    } catch (err: any) {
      console.error('Failed to load initial data in ModifyBillModule:', err);
    } finally {
      setIsLoadingCatalogue(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();
    }
  }, [isAuthenticated]);

  // Click outside listener for auto-suggest dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch number plate suggestions
  const loadPlateSuggestions = async (val: string) => {
    setIsLoadingSuggestions(true);
    try {
      const results = await BillingService.getDistinctNumberPlates(val.trim().toUpperCase());
      setPlateSuggestions(results);
      setIsSuggestOpen(results.length > 0);
    } catch (e) {
      console.warn('Failed to load plate suggestions:', e);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Live debounced search & suggestions as user enters number plate or query
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const cleanQ = searchQuery.trim();

    const timer = setTimeout(async () => {
      // 1. Fetch plate suggestions
      try {
        const plates = await BillingService.getDistinctNumberPlates(cleanQ.toUpperCase());
        if (isMounted) {
          setPlateSuggestions(plates);
        }
      } catch {
        // ignore
      }

      // 2. Fetch bills live dynamically
      try {
        const bills = await BillingService.searchInvoicesForModification(cleanQ);
        if (isMounted) {
          setSearchResults(bills);
          setHasSearched(true);
        }
      } catch {
        // ignore
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, isAuthenticated]);

  // Handle PIN Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setIsVerifyingPin(true);

    try {
      const inputHash = await hashInput(pinInput);
      if (inputHash === MODIFY_PASSWORD_HASH) {
        setIsAuthenticated(true);
        sessionStorage.setItem('srm_modify_unlocked', 'true');
        setPinInput('');
        setPinError(null);
        setSaveSuccessInvoice(null);
      } else {
        setPinError('Incorrect security password. Access denied.');
        setPinInput('');
      }
    } catch {
      setPinError('Security verification failed. Please try again.');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Handle Lock
  const handleLock = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('srm_modify_unlocked');
    setSelectedInvoice(null);
    setSearchResults([]);
    setSearchQuery('');
    setIsSuggestOpen(false);
    setSaveSuccessInvoice(null);
  };

  // Execute Invoice Search
  const executeSearch = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : searchQuery).trim();

    setIsSearching(true);
    setHasSearched(true);
    setErrorMessage(null);

    try {
      const results = await BillingService.searchInvoicesForModification(q);
      setSearchResults(results);
    } catch (err: any) {
      setErrorMessage(`Failed to search bills: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSuggestOpen(false);
    await executeSearch();
  };

  const handleSelectPlateSuggestion = (plate: string) => {
    setSearchQuery(plate);
    setIsSuggestOpen(false);
    executeSearch(plate);
  };

  // Load a Bill into the Editor
  const handleSelectInvoiceForEdit = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setOriginalInvoiceSnapshot(JSON.parse(JSON.stringify(inv)));
    setEditPlate(inv.number_plate || '');
    setEditCustomerName(inv.customer_name || '');
    setEditMobile(inv.mobile_number || '');
    setEditOdometer(inv.odometer ? inv.odometer.toString() : '');
    setEditItems(
      (inv.items || []).map((item, idx) => ({
        ...item,
        s_no: idx + 1,
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        amount: calculateLineAmount(item.quantity || 1, item.rate || 0),
      }))
    );
    const hasDiscount = Boolean(inv.labour_discount_percentage && inv.labour_discount_percentage > 0);
    setEditApplyDiscount(hasDiscount);
    setEditDiscountPercentage(inv.labour_discount_percentage || 0);
    setSaveSuccessInvoice(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset Changes to Original Bill
  const handleResetToOriginal = () => {
    if (!originalInvoiceSnapshot) return;
    setEditPlate(originalInvoiceSnapshot.number_plate || '');
    setEditCustomerName(originalInvoiceSnapshot.customer_name || '');
    setEditMobile(originalInvoiceSnapshot.mobile_number || '');
    setEditOdometer(originalInvoiceSnapshot.odometer ? originalInvoiceSnapshot.odometer.toString() : '');
    const origHasDiscount = Boolean(originalInvoiceSnapshot.labour_discount_percentage && originalInvoiceSnapshot.labour_discount_percentage > 0);
    setEditApplyDiscount(origHasDiscount);
    setEditDiscountPercentage(originalInvoiceSnapshot.labour_discount_percentage || 0);
    setEditItems(
      (originalInvoiceSnapshot.items || []).map((item, idx) => ({
        ...item,
        s_no: idx + 1,
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        amount: calculateLineAmount(item.quantity || 1, item.rate || 0),
      }))
    );
    showToast('Reverted modifications back to original bill values.');
  };

  // Live Subtotals & Totals
  const editSubtotalBeforeDiscount = useMemo(() => calculateGrandTotal(editItems), [editItems]);

  const labourSubtotal = useMemo(() => {
    return editItems
      .filter((i) => (i.work_type || '').toLowerCase() === 'labour')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [editItems]);

  const partSubtotal = useMemo(() => {
    return editItems
      .filter((i) => (i.work_type || '').toLowerCase() === 'part')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [editItems]);

  const otherSubtotal = useMemo(() => {
    return editItems
      .filter((i) => (i.work_type || '').toLowerCase() !== 'labour' && (i.work_type || '').toLowerCase() !== 'part')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [editItems]);

  const editLabourDiscountAmount = useMemo(() => {
    if (!editApplyDiscount || labourSubtotal <= 0 || editDiscountPercentage <= 0) return 0;
    return calculateLabourDiscountAmount(labourSubtotal, editDiscountPercentage);
  }, [editApplyDiscount, labourSubtotal, editDiscountPercentage]);

  const editNetLabourTotal = useMemo(() => {
    return Math.max(0, Number((labourSubtotal - editLabourDiscountAmount).toFixed(2)));
  }, [labourSubtotal, editLabourDiscountAmount]);

  const grandTotal = useMemo(() => {
    return Math.max(0, Number((editSubtotalBeforeDiscount - editLabourDiscountAmount).toFixed(2)));
  }, [editSubtotalBeforeDiscount, editLabourDiscountAmount]);

  const getWorkTypeBadgeClass = (type: string) => {
    if (type === 'Labour') return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    if (type === 'Part') return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
    if (type === 'Towing') return 'bg-sky-950/80 text-sky-300 border-sky-800/60';
    return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
  };

  // Line Item Operations
  const handleUpdateItemDescription = (index: number, newName: string) => {
    setEditItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], work_name: newName };
      return copy;
    });
  };

  const handleUpdateItemType = (index: number, newType: string) => {
    setEditItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], work_type: newType };
      return copy;
    });
  };

  const handleUpdateItemQuantity = (index: number, qty: number) => {
    setEditItems((prev) => {
      const copy = [...prev];
      const validQty = Math.max(0.01, qty);
      copy[index] = {
        ...copy[index],
        quantity: validQty,
        amount: calculateLineAmount(validQty, copy[index].rate),
      };
      return copy;
    });
  };

  const handleUpdateItemRate = (index: number, rate: number) => {
    setEditItems((prev) => {
      const copy = [...prev];
      const validRate = Math.max(0, rate);
      copy[index] = {
        ...copy[index],
        rate: validRate,
        amount: calculateLineAmount(copy[index].quantity, validRate),
      };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setEditItems((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((item, i) => ({ ...item, s_no: i + 1 }));
    });
  };

  // Add Item from Catalogue
  const handleSelectWorkFromCatalogue = (work: WorkItem) => {
    setEditItems((prev) => [
      ...prev,
      {
        s_no: prev.length + 1,
        work_id: work.id,
        work_name: work.work_name,
        work_type: work.work_type,
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
    setIsPickerOpen(false);
    setPickerSearch('');
  };

  // Add Custom Work Item
  const handleAddCustomWorkToBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    const cleanName = customWorkName.trim();
    if (!cleanName) {
      setCustomError('Work name is required.');
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
    const workObj = res.work;
    const amount = calculateLineAmount(customQuantity, customRate);

    setEditItems((prev) => [
      ...prev,
      {
        s_no: prev.length + 1,
        work_id: workObj?.id,
        work_name: cleanName,
        work_type: effectiveType,
        quantity: customQuantity,
        rate: customRate,
        amount: amount,
      },
    ]);

    setIsPickerOpen(false);
    setIsCustomMode(false);
    setPickerSearch('');
  };

  // Open 2-Step Confirmation Modal
  const handleOpenConfirmModal = () => {
    setErrorMessage(null);
    const cleanPlate = editPlate.trim().toUpperCase();

    if (!cleanPlate) {
      setErrorMessage('Vehicle Number Plate is required.');
      return;
    }

    if (editItems.length === 0) {
      setErrorMessage('The bill must contain at least one work item.');
      return;
    }

    const invalidItem = editItems.find((i) => !i.work_name.trim() || i.rate <= 0);
    if (invalidItem) {
      setErrorMessage(`Item "${invalidItem.work_name || 'Unnamed'}" must have a valid description and a rate greater than ₹0.`);
      return;
    }

    // Automatically organize series of work types: Parts -> Labour -> Towing -> Other with continuous S.No
    const organized = organizeLineItemsByType(editItems);
    setEditItems(organized);

    setIsConfirmModalOpen(true);
  };

  // Confirm & Save Modified Invoice to Database
  const handleConfirmSave = async () => {
    if (!selectedInvoice?.id) {
      setErrorMessage('Missing invoice ID for modification.');
      setIsConfirmModalOpen(false);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const finalItems = organizeLineItemsByType(editItems);

    const updatedInvoicePayload: Invoice = {
      ...selectedInvoice,
      number_plate: editPlate.trim().toUpperCase(),
      customer_name: editCustomerName.trim() || undefined,
      mobile_number: editMobile.trim() || undefined,
      odometer: editOdometer.trim() || undefined,
      items: finalItems,
      grand_total: grandTotal,
      subtotal_before_discount: editSubtotalBeforeDiscount,
      labour_discount_percentage: editApplyDiscount && editDiscountPercentage > 0 ? editDiscountPercentage : undefined,
      labour_discount_amount: editApplyDiscount && editLabourDiscountAmount > 0 ? editLabourDiscountAmount : undefined,
    };

    const result = await BillingService.updateInvoice(selectedInvoice.id, updatedInvoicePayload);
    setIsSaving(false);
    setIsConfirmModalOpen(false);

    if (!result.success || !result.data) {
      setErrorMessage(result.error || 'Failed to update bill. Please check your connection.');
      return;
    }

    const savedData = result.data;
    setSaveSuccessInvoice(savedData);

    // Auto-lock and logout immediately for maximum security & encryption after modifying single bill
    sessionStorage.removeItem('srm_modify_unlocked');
    setIsAuthenticated(false);

    // Reset active editing state
    setSelectedInvoice(null);
    setOriginalInvoiceSnapshot(null);
    setEditPlate('');
    setEditCustomerName('');
    setEditMobile('');
    setEditOdometer('');
    setEditItems([]);
    setEditApplyDiscount(false);
    setEditDiscountPercentage(0);
    setSearchResults([]);
    setSearchQuery('');
    setPinInput('');
    setPinError(null);

    showToast(`Invoice #${savedData.invoice_number} updated successfully! Console locked for security.`);
  };

  // Filtered Catalogue Items
  const filteredCatalogue = useMemo(() => {
    const activeWorks = worksCatalogue.filter((w) => w.is_active);
    if (!pickerSearch.trim()) return activeWorks;
    const query = pickerSearch.trim().toLowerCase();
    return activeWorks.filter((w) => w.work_name.toLowerCase().includes(query));
  }, [worksCatalogue, pickerSearch]);

  /* ====================================================================
     LOCKED SCREEN: PASSWORD PIN PROMPT (AUTO-LOCKS PER MODIFICATION)
     ==================================================================== */
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-8 space-y-6 animate-fadeIn">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-950/95 border border-emerald-600/80 text-white text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Recently Modified Bill Quick Actions Banner */}
        {saveSuccessInvoice && (
          <div className="p-6 bg-emerald-950/80 border border-emerald-600/80 rounded-3xl space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/90 border border-emerald-700 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Bill Saved & Console Auto-Locked
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    Invoice #{saveSuccessInvoice.invoice_number} Successfully Updated!
                  </h3>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Vehicle: <span className="font-mono font-bold text-white">{saveSuccessInvoice.number_plate}</span> &bull; Grand Total: <span className="font-bold text-white">₹{saveSuccessInvoice.grand_total.toLocaleString('en-IN')}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSaveSuccessInvoice(null)}
                className="text-emerald-400/70 hover:text-white p-1 rounded-lg hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950/70 border border-emerald-900/70 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Auto-Lock Security:</strong> The console has been automatically locked after modifying this bill. Enter PIN below to modify another bill.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => PdfService.printInvoice(saveSuccessInvoice)}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Updated Bill</span>
              </button>

              <button
                type="button"
                onClick={() => PdfService.downloadInvoicePdf(saveSuccessInvoice)}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => PdfService.shareInvoiceViaWhatsApp(saveSuccessInvoice)}
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp Share</span>
              </button>
            </div>
          </div>
        )}

        {/* PIN PROMPT CARD */}
        <div className="p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-red-950 to-red-800/80 border border-red-700/60 flex items-center justify-center text-red-400 shadow-xl shadow-red-950/50">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-xs font-bold uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              Security Verification Required
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Modify Existing Bills
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              This module allows editing values, quantities, and line items on existing bills. 
              For security, access locks automatically after each single bill modification.
              Please enter your 4-digit security PIN to proceed.
            </p>
          </div>

          {pinError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Enter 4-Digit Security PIN
              </label>
              <input 
                type="password"
                inputMode="numeric"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:border-red-600 transition-all placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingPin || !pinInput.trim()}
              className="w-full py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{isVerifyingPin ? 'Verifying PIN...' : 'Unlock Modification Console'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Protected by Workshop Admin Hash Verification &bull; Auto-locks per modification
            </span>
          </div>

        </div>

      </div>
    );
  }

  /* ====================================================================
     UNLOCKED CONSOLE: BILL MODIFIER
     ==================================================================== */
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-950/95 border border-emerald-600/80 text-white text-xs font-bold rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Authorized Access Active
            </div>
            <h2 className="text-lg font-extrabold text-white">Modify Existing Bills</h2>
          </div>
        </div>

        <button
          onClick={handleLock}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto border border-slate-700"
        >
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Lock Console</span>
        </button>
      </div>

      {/* SUCCESS SCREEN AFTER SAVE */}
      {saveSuccessInvoice && (
        <div className="p-6 bg-emerald-950/70 border border-emerald-700/60 rounded-2xl space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Invoice #{saveSuccessInvoice.invoice_number} Successfully Modified & Updated!
              </h3>
              <p className="text-xs text-emerald-200">
                All changes, items, and totals have been safely updated in Supabase database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => PdfService.printInvoice(saveSuccessInvoice)}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Updated Bill</span>
            </button>

            <button
              onClick={() => PdfService.downloadInvoicePdf(saveSuccessInvoice)}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Updated PDF</span>
            </button>

            <button
              onClick={() => PdfService.shareInvoiceViaWhatsApp(saveSuccessInvoice)}
              className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: SEARCH BILL TO MODIFY */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-red-500" />
            Step 1: Search & Select Bill to Modify
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Lookup any bill by Vehicle Number Plate (e.g. AP39TV4852) or Invoice Number (e.g. SRM-202610-0001).
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div ref={searchContainerRef} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => loadPlateSuggestions(searchQuery)}
              placeholder="Search by Vehicle Number Plate or Invoice Number..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:border-red-600 font-mono uppercase"
            />
            {(isSearching || isLoadingSuggestions) && (
              <span className="absolute right-3.5 top-3.5 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
            )}

            {/* Suggestions Floating Dropdown */}
            {isSuggestOpen && plateSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-red-400">
                    <Car className="w-3 h-3" />
                    Stored Vehicle Number Plates ({plateSuggestions.length})
                  </span>
                  <span className="text-slate-500 text-[9px]">Click to view bills</span>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {plateSuggestions.map((plate) => (
                    <button
                      key={plate}
                      type="button"
                      onClick={() => handleSelectPlateSuggestion(plate)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-red-950/50 hover:text-white text-slate-200 text-xs font-mono font-bold flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Car className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
                        <span className="tracking-wider">{plate}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 group-hover:text-red-300 font-sans font-normal">
                        Select Plate &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{isSearching ? 'Searching...' : 'Search Bill'}</span>
          </button>
        </form>

        {/* Search Results List */}
        {hasSearched && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5 px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {searchQuery.trim()
                  ? `Search Results for "${searchQuery.trim().toUpperCase()}" (${searchResults.length})`
                  : `Recent Invoices in Database (${searchResults.length})`}
              </span>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    executeSearch('');
                  }}
                  className="text-[10px] text-red-400 hover:text-red-300 font-bold cursor-pointer transition-colors"
                >
                  Clear Search & Show All
                </button>
              )}
            </div>
            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No invoices found matching "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {searchResults.map((inv) => {
                  const isCurrent = selectedInvoice?.invoice_number === inv.invoice_number;
                  return (
                    <div 
                      key={inv.invoice_number}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'bg-red-950/40 border-red-600 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono font-bold text-red-400 text-xs block">
                            {inv.invoice_number}
                          </span>
                          <span className="font-mono font-extrabold text-white text-sm bg-slate-800/80 px-2 py-0.5 rounded inline-block mt-1">
                            {inv.number_plate}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Grand Total</span>
                          <span className="text-sm font-mono font-extrabold text-emerald-400">
                            ₹ {inv.grand_total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Customer:</span>
                          <span className="text-slate-300 font-semibold truncate block">
                            {inv.customer_name || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Items / Date:</span>
                          <span className="text-slate-300">
                            {inv.items?.length || 0} works • {new Date(inv.created_at || '').toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectInvoiceForEdit(inv)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>{isCurrent ? 'Currently Editing' : 'Load & Modify This Bill'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: BILL MODIFICATION EDITOR */}
      {selectedInvoice && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-6">
          
          {/* Editor Header Banner */}
          <div className="p-5 bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-900/60 border border-red-700/60 text-red-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                Editing Invoice #{selectedInvoice.invoice_number}
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Modify Bill Details & Work Line Items
              </h3>
              <p className="text-xs text-slate-400">
                Update customer details, odometer, item descriptions, rates, or add/delete works.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Revert Changes</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Editor
              </button>
            </div>
          </div>

          <div className="px-5 space-y-6">
            
            {/* Customer & Vehicle Metadata Inputs Card */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-red-500" />
                Vehicle & Customer Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Invoice Number (Fixed)
                  </label>
                  <input
                    type="text"
                    value={selectedInvoice.invoice_number}
                    disabled
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-red-400 font-mono font-bold cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Number Plate <span className="text-red-400">*</span>
                  </label>
                  <NumberPlateInput
                    value={editPlate}
                    onChange={setEditPlate}
                    onSelectSuggestion={(plate, suggestion) => {
                      setEditPlate(plate);
                      if (suggestion?.customer_name && !editCustomerName.trim()) {
                        setEditCustomerName(suggestion.customer_name);
                      }
                      if (suggestion?.mobile_number && !editMobile.trim()) {
                        setEditMobile(suggestion.mobile_number);
                      }
                    }}
                    placeholder="e.g. AP39TV4852"
                    className="!py-2 !text-xs !font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Odometer (km)
                  </label>
                  <input
                    type="text"
                    value={editOdometer}
                    onChange={(e) => setEditOdometer(e.target.value)}
                    placeholder="e.g. 54200"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-red-500" />
                  Bill Line Items ({editItems.length})
                </h4>

                <div className="flex items-center gap-2">
                  {editItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditItems(organizeLineItemsByType(editItems));
                        showToast('Works organized by type: Parts → Labour → Towing → Other!');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Automatically organize all works into Parts, Labour, Towing, and Other types with sequential S.No"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Auto-Organize by Type</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      setIsPickerOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Work Item</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3 w-12 text-center">S.No</th>
                      <th className="py-3 px-3">Work Description</th>
                      <th className="py-3 px-3 w-32">Type</th>
                      <th className="py-3 px-3 w-24">Quantity</th>
                      <th className="py-3 px-3 w-32">Rate (₹)</th>
                      <th className="py-3 px-3 w-32 text-right">Amount (₹)</th>
                      <th className="py-3 px-3 w-14 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {editItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No works currently in this bill. Click "+ Add Work Item" to insert.
                        </td>
                      </tr>
                    ) : (
                      editItems.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-mono text-center text-slate-500">
                            {item.s_no}
                          </td>

                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={item.work_name}
                              onChange={(e) => handleUpdateItemDescription(index, e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
                            />
                          </td>

                          <td className="py-2.5 px-3">
                            <select
                              value={item.work_type}
                              onChange={(e) => handleUpdateItemType(index, e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
                            >
                              <option value="Labour">Labour</option>
                              <option value="Part">Part</option>
                              <option value="Towing">Towing</option>
                              {item.work_type !== 'Labour' && item.work_type !== 'Part' && item.work_type !== 'Towing' && (
                                <option value={item.work_type}>{item.work_type}</option>
                              )}
                            </select>
                          </td>

                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemQuantity(index, parseFloat(e.target.value) || 1)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-600"
                            />
                          </td>

                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={item.rate || ''}
                              onChange={(e) => handleUpdateItemRate(index, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-600"
                            />
                          </td>

                          <td className="py-2.5 px-3 font-mono font-bold text-right text-emerald-400">
                            ₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete Item"
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
            </div>

          </div>

          {/* Subtotals & Save Action Bar */}
          <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Labour Subtotal</span>
                <div className="flex items-baseline gap-1.5 font-mono">
                  {editApplyDiscount && editLabourDiscountAmount > 0 ? (
                    <>
                      <span className="text-slate-500 line-through text-[11px]">
                        ₹{labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-bold text-slate-200">
                        ₹{editNetLabourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    setEditApplyDiscount(!editApplyDiscount);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    editApplyDiscount
                      ? 'bg-emerald-950 border border-emerald-600/70 text-emerald-300'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  <span>{editApplyDiscount ? (editDiscountPercentage > 0 ? `Labour Discount: ${editDiscountPercentage}% OFF (-₹${editLabourDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})` : 'Labour Discount Active (0% - Enter in Preview)') : 'Apply Labour Discount'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-right">
                {editApplyDiscount && editLabourDiscountAmount > 0 && (
                  <span className="text-[10px] text-slate-500 line-through font-mono block">
                    Original: ₹ {editSubtotalBeforeDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Updated Grand Total</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400">
                  ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="button"
                onClick={handleOpenConfirmModal}
                disabled={isSaving}
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Modifications</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* CONFIRMATION 2-STEP MODAL */}
      {isConfirmModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Confirm Bill Modifications
                </h3>
                <p className="text-xs text-slate-400">
                  Please confirm updating Invoice #{selectedInvoice.invoice_number}.
                </p>
              </div>
            </div>

            {/* Auto-Organized Series Notice Banner */}
            <div className="px-3.5 py-2 bg-emerald-950/60 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auto-Adjusted Sequence: <strong>1. Parts</strong> &rarr; <strong>2. Labour</strong> &rarr; <strong>3. Towing</strong> &rarr; <strong>4. Other</strong></span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400/80 font-bold">Sequential S.No 1..{editItems.length}</span>
            </div>

            {/* LABOUR CHARGES DISCOUNT TOGGLE & PERCENTAGE SELECTOR */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    editApplyDiscount ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
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
                      Total Labour in bill: <strong className="font-mono text-slate-200">₹{labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </p>
                  </div>
                </div>

                {/* Toggle Button */}
                {labourSubtotal > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditApplyDiscount(!editApplyDiscount);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      editApplyDiscount
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span>{editApplyDiscount ? 'Discount Active' : 'Toggle Discount'}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${editApplyDiscount ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">No Labour items in this bill</span>
                )}
              </div>

              {/* Discount Percentage Controls & Flipkart/Amazon Style Savings Callout */}
              {editApplyDiscount && labourSubtotal > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300 mr-1">Quick Select %:</span>
                    {[5, 10, 15, 20, 25, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setEditDiscountPercentage(pct)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                          editDiscountPercentage === pct
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
                          value={editDiscountPercentage || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setEditDiscountPercentage(Math.max(0, Math.min(100, val)));
                          }}
                          placeholder="0"
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                        />
                        <span className="absolute right-1.5 top-1 text-slate-400 text-xs font-bold">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Prompt when % is 0 */}
                  {editDiscountPercentage === 0 && (
                    <div className="p-2.5 bg-slate-900 border border-dashed border-slate-700 rounded-lg text-xs text-amber-300/90 flex items-center gap-2">
                      <span>👉</span>
                      <span>Discount enabled. Please select a percentage above or type a custom % to calculate savings.</span>
                    </div>
                  )}

                  {/* Flipkart / Amazon Style Savings Banner */}
                  {editDiscountPercentage > 0 && (
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
                              {editDiscountPercentage}% OFF APPLIED
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white mt-0.5">
                            Customer saves <strong className="text-emerald-400 font-mono font-extrabold">₹ {editLabourDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> on Labour charges!
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
                            ₹ {editNetLabourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle Number Plate:</span>
                <span className="font-mono font-bold text-white">{editPlate.trim().toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Work Items:</span>
                <span className="font-semibold text-slate-200">{editItems.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Labour Subtotal:</span>
                <span className="font-mono text-slate-200">
                  {editApplyDiscount && editLabourDiscountAmount > 0 ? (
                    <span>
                      <span className="line-through text-slate-500 mr-1.5">₹{labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      <strong className="text-emerald-400">₹{editNetLabourTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </span>
                  ) : (
                    `₹${labourSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Parts Subtotal:</span>
                <span className="font-mono text-slate-200">₹ {partSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {editApplyDiscount && editLabourDiscountAmount > 0 && (
                <div className="flex justify-between text-slate-400 line-through">
                  <span>Original Total:</span>
                  <span className="font-mono">₹ {editSubtotalBeforeDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                <span className="text-slate-300">New Grand Total:</span>
                <span className="font-mono text-emerald-400 text-sm">
                  ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {editApplyDiscount && editLabourDiscountAmount > 0 && (
                <div className="text-right text-[10px] font-extrabold text-emerald-400">
                  🎉 Total Customer Savings: ₹{editLabourDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950/50 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Updating...' : 'Yes, Update Invoice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKS CATALOGUE SELECTION & CUSTOM WORK MODAL */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red-500" />
                {isCustomMode ? 'Add Custom Work to Bill' : 'Select Work from Catalogue'}
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
                  {isLoadingCatalogue ? (
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
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white">{work.work_name}</span>
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
                    onClick={() => {
                      setCustomWorkName(pickerSearch.trim() || '');
                      setCustomWorkType('Labour');
                      setCustomTypeName('');
                      setIsCustomTypeSelected(false);
                      setCustomQuantity(1);
                      setCustomRate(0);
                      setCustomError(null);
                      setIsCustomMode(true);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-red-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <PlusCircle className="w-4 h-4 text-red-400" />
                    <span>+ Custom Work</span>
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

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Work Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text"
                    value={customWorkName}
                    onChange={(e) => setCustomWorkName(e.target.value)}
                    placeholder="e.g. Denting, Full Body Polish..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
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
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                        !isCustomTypeSelected && customWorkType === 'Labour'
                          ? 'bg-blue-950/80 border-blue-600 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
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
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                        !isCustomTypeSelected && customWorkType === 'Part'
                          ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
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
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                        !isCustomTypeSelected && customWorkType === 'Towing'
                          ? 'bg-sky-950/80 border-sky-600 text-sky-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Towing
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomTypeSelected(true)}
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                        isCustomTypeSelected
                          ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
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
                        placeholder="Type custom name..."
                        className="w-full bg-slate-950 border border-purple-700/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Quantity</label>
                    <input 
                      type="number"
                      min="0.01"
                      step="any"
                      value={customQuantity}
                      onChange={(e) => setCustomQuantity(parseFloat(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Rate (₹) <span className="text-red-400">*</span></label>
                    <input 
                      type="number"
                      min="0"
                      step="any"
                      value={customRate || ''}
                      onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
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
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold"
                  >
                    Insert Item
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

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  X, 
  Wrench, 
  Layers, 
  Sparkles,
  RefreshCw,
  Info,
  ShieldCheck
} from 'lucide-react';
import { WorkItem, WorkType } from '../../../types/billing';
import { BillingService } from '../../../services/billingService';

export const WorksCatalogueModule: React.FC = () => {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [deactivatingWork, setDeactivatingWork] = useState<WorkItem | null>(null);

  // Form State
  const [formWorkName, setFormWorkName] = useState<string>('');
  const [formWorkType, setFormWorkType] = useState<WorkType>('Labour');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch works on load
  const loadWorks = async () => {
    setLoading(true);
    const data = await BillingService.getWorksCatalogue();
    setWorks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWorks();
  }, []);

  // Filtered works computed property
  const filteredWorks = useMemo(() => {
    if (!searchQuery.trim()) return works;
    const query = searchQuery.trim().toLowerCase();
    return works.filter((w) => w.work_name.toLowerCase().includes(query));
  }, [works, searchQuery]);

  // Combined metrics
  const totalCount = works.length;
  const activeCount = works.filter((w) => w.is_active).length;
  const labourCount = works.filter((w) => w.work_type === 'Labour').length;
  const partCount = works.filter((w) => w.work_type === 'Part').length;

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormWorkName('');
    setFormWorkType('Labour');
    setFormIsActive(true);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (work: WorkItem) => {
    setEditingWork(work);
    setFormWorkName(work.work_name);
    setFormWorkType(work.work_type);
    setFormIsActive(work.is_active);
    setFormError(null);
  };

  // Close all modals
  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingWork(null);
    setDeactivatingWork(null);
    setFormError(null);
  };

  // Save New Work
  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = formWorkName.trim();
    if (!cleanName) {
      setFormError('Work Name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    const result = await BillingService.createWorkItem({
      work_name: cleanName,
      work_type: formWorkType,
      is_active: formIsActive,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error || 'Failed to create work item.');
      return;
    }

    showToast(`Work "${cleanName}" created successfully with type [${formWorkType}].`);
    closeModal();
    loadWorks();
  };

  // Save Edit Work
  const handleUpdateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork) return;

    setFormError(null);
    const cleanName = formWorkName.trim();
    if (!cleanName) {
      setFormError('Work Name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    const result = await BillingService.updateWorkItem(editingWork.id, {
      work_name: cleanName,
      work_type: formWorkType,
      is_active: formIsActive,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error || 'Failed to update work item.');
      return;
    }

    showToast(`Work "${cleanName}" updated successfully.`);
    closeModal();
    loadWorks();
  };

  // Quick Toggle Active State
  const handleToggleStatus = async (work: WorkItem) => {
    const newStatus = !work.is_active;
    const res = await BillingService.updateWorkItem(work.id, { is_active: newStatus });
    if (res.success) {
      showToast(`Work "${work.work_name}" status set to ${newStatus ? 'Active' : 'Inactive'}.`);
      loadWorks();
    } else {
      showToast(res.error || 'Status update failed.', 'error');
    }
  };

  // Safe Deactivate / Delete Action
  const handleConfirmDeactivateOrDelete = async () => {
    if (!deactivatingWork) return;

    setIsSubmitting(true);
    const result = await BillingService.safeDeleteOrDeactivateWork(deactivatingWork.id);
    setIsSubmitting(false);

    showToast(result.message, 'success');
    closeModal();
    loadWorks();
  };

  return (
    <div className="space-y-6">
      
      {/* Notification Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-3 transition-all animate-bounce ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-700 text-emerald-200' 
            : 'bg-red-950/95 border-red-700 text-red-200'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-950/80 border border-red-800/50 rounded-lg text-red-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Works Catalogue Management</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage predefined garage service works & parts with automatic Type determination.
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-950/50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Work</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Total Works</span>
          <strong className="text-base font-extrabold text-white">{totalCount}</strong>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Active Works</span>
          <strong className="text-base font-extrabold text-emerald-400">{activeCount}</strong>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Labour Types</span>
          <strong className="text-base font-extrabold text-blue-400">{labourCount}</strong>
        </div>
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-0.5">Part Types</span>
          <strong className="text-base font-extrabold text-amber-400">{partCount}</strong>
        </div>
      </div>

      {/* Rules Banner */}
      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-200 block">Combined Catalogue & Duplicate Protection</span>
          <p className="text-slate-400 leading-relaxed">
            All Labour and Parts are maintained in <strong className="text-slate-200">one unified catalogue</strong>. 
            When a work is selected during billing, its Type is automatically set. Works are case-insensitively protected against duplicate entries.
          </p>
        </div>
      </div>

      {/* Search Bar & Table Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        
        {/* Controls Bar */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search works by name (e.g. Engine Oil, Service, Brake)..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-red-600 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Showing <strong className="text-white">{filteredWorks.length}</strong> of {totalCount} works</span>
            <button 
              onClick={loadWorks} 
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Refresh Catalogue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Combined Catalogue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">S.No</th>
                <th className="py-3.5 px-4">Work Name</th>
                <th className="py-3.5 px-4 w-36">Type</th>
                <th className="py-3.5 px-4 w-32">Status</th>
                <th className="py-3.5 px-4 w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
                    Loading Works Catalogue...
                  </td>
                </tr>
              ) : filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    {searchQuery ? `No works matching "${searchQuery}"` : 'No works found in catalogue.'}
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work, index) => (
                  <tr key={work.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
                      <span>{work.work_name}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase border ${
                        work.work_type === 'Labour'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                      }`}>
                        {work.work_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button 
                        onClick={() => handleToggleStatus(work)}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          work.is_active
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/80'
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800 text-slate-400'
                        }`}
                        title="Click to toggle status"
                      >
                        {work.is_active ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenEditModal(work)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                          title="Edit Work"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeactivatingWork(work)}
                          className="p-1.5 hover:bg-red-950/80 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                          title="Safe Deactivate / Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE WORK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-500" />
                Add Predefined Work
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWork} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Work Name <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  value={formWorkName}
                  onChange={(e) => setFormWorkName(e.target.value)}
                  placeholder="e.g. Engine Oil Synthetic (5W-30), Brake Pad..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Duplicate protection enabled (case-insensitive check).
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Work Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormWorkType('Labour')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      formWorkType === 'Labour'
                        ? 'bg-blue-950/80 border-blue-600 text-blue-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Labour
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormWorkType('Part')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      formWorkType === 'Part'
                        ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Part
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Selecting this work during bill creation will automatically set this Type.
                </span>
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold text-slate-300 cursor-pointer pt-1">
                  <input 
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-red-600 focus:ring-0"
                  />
                  <span>Active in Catalogue</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-md shadow-red-950/50"
                >
                  {isSubmitting ? 'Saving...' : 'Create Work'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORK MODAL */}
      {editingWork && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-red-500" />
                Edit Predefined Work
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateWork} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Work Name <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  value={formWorkName}
                  onChange={(e) => setFormWorkName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Work Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormWorkType('Labour')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      formWorkType === 'Labour'
                        ? 'bg-blue-950/80 border-blue-600 text-blue-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Labour
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormWorkType('Part')}
                    className={`p-3 rounded-xl border text-center font-bold transition-all ${
                      formWorkType === 'Part'
                        ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Part
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 font-semibold text-slate-300 cursor-pointer pt-1">
                  <input 
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-red-600 focus:ring-0"
                  />
                  <span>Active in Catalogue</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-md shadow-red-950/50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAFE DEACTIVATION MODAL */}
      {deactivatingWork && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950 border border-red-800 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Safe Deactivation & Removal</h3>
                <span className="text-[11px] text-slate-400">Work: {deactivatingWork.work_name}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              Historical bill items preserve snapshots of work names and types. Deactivating this work prevents it from appearing in new bills while ensuring old invoices remain 100% accurate.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivateOrDelete}
                disabled={isSubmitting}
                className="px-5 py-2 bg-red-900 hover:bg-red-800 border border-red-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                {isSubmitting ? 'Processing...' : 'Safely Deactivate Work'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Car, Check } from 'lucide-react';
import { BillingService } from '../../services/billingService';
import type { VehicleSuggestion } from '../../types/billing';

interface NumberPlateInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (plate: string, suggestion?: VehicleSuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const NumberPlateInput: React.FC<NumberPlateInputProps> = ({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = 'e.g. TN38AB1234, AP39...',
  disabled = false,
  required = false,
  className = '',
}) => {
  const [suggestions, setSuggestions] = useState<VehicleSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions helper
  const loadSuggestions = async (val: string) => {
    setLoading(true);
    const results = await BillingService.getStoredVehicles(val);
    setSuggestions(results);
    setIsOpen(results.length > 0);
    setLoading(false);
  };

  // Fetch suggestions as value changes
  useEffect(() => {
    let isMounted = true;
    const cleanVal = value.trim().toUpperCase();

    const fetchSuggestions = async () => {
      setLoading(true);
      const results = await BillingService.getStoredVehicles(cleanVal);
      if (isMounted) {
        setSuggestions(results);
        if (cleanVal.length > 0) {
          setIsOpen(results.length > 0);
        }
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 100);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (plate: string, suggestion?: VehicleSuggestion) => {
    onChange(plate);
    if (onSelectSuggestion) {
      onSelectSuggestion(plate, suggestion);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Car className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onFocus={() => loadSuggestions(value.trim().toUpperCase())}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-sm text-white font-mono tracking-wider uppercase focus:outline-none focus:border-red-600 transition-colors placeholder:normal-case placeholder:font-sans placeholder:text-slate-600 ${className}`}
        />
        {loading && (
          <span className="absolute right-3 top-3 w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
        )}
      </div>

      {/* Auto-suggest Floating Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Stored Number Plates ({suggestions.length})</span>
            <span className="text-slate-500">Click to select</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {suggestions.map((item) => (
              <button
                key={item.number_plate}
                type="button"
                onClick={() => handleSelect(item.number_plate, item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-red-950/40 hover:text-white text-slate-200 text-xs font-mono font-bold flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors shrink-0" />
                  <span className="tracking-wider">{item.number_plate}</span>
                </div>
                <div className="flex items-center gap-2 font-sans font-normal text-[11px] ml-2">
                  {item.customer_name && (
                    <span className="text-slate-300 group-hover:text-white font-medium truncate max-w-[140px]">
                      {item.customer_name}
                    </span>
                  )}
                  {item.mobile_number && (
                    <span className="text-slate-500 font-mono text-[10px] hidden sm:inline">
                      {item.mobile_number}
                    </span>
                  )}
                  {value.trim().toUpperCase() === item.number_plate && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

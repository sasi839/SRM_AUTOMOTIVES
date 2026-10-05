import React, { useState, useEffect, useRef } from 'react';
import { Car, ChevronDown, Check } from 'lucide-react';
import { BillingService } from '../../services/billingService';

interface NumberPlateInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (plate: string) => void;
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions as value changes
  useEffect(() => {
    const cleanVal = value.trim().toUpperCase();
    if (!cleanVal || cleanVal.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let isMounted = true;
    const fetchSuggestions = async () => {
      setLoading(true);
      const results = await BillingService.getDistinctNumberPlates(cleanVal);
      if (isMounted) {
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 150);
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

  const handleSelect = (plate: string) => {
    onChange(plate);
    if (onSelectSuggestion) {
      onSelectSuggestion(plate);
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
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
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
            {suggestions.map((plate) => (
              <button
                key={plate}
                type="button"
                onClick={() => handleSelect(plate)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-red-950/40 hover:text-white text-slate-200 text-xs font-mono font-bold flex items-center justify-between transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
                  <span className="tracking-wider">{plate}</span>
                </div>
                {value.trim().toUpperCase() === plate && (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

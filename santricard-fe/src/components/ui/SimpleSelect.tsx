import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function SimpleSelect({ options, value, onChange, placeholder = "Pilih", disabled = false }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:opacity-50 transition-colors ${!value ? "text-gray-500" : "text-black"}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in slide-in-from-top-1">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">Tidak ada data</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`relative flex w-full items-center cursor-default select-none py-2 pl-3 pr-9 transition-colors hover:bg-emerald-50 hover:text-emerald-900 ${
                  value === opt.value ? "bg-emerald-100 text-emerald-900 font-medium" : "text-gray-900"
                }`}
              >
                <span className="block truncate">{opt.label}</span>
                {value === opt.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

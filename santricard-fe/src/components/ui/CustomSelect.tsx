import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  id: number;
  name: string; // The value to save, e.g. "VII-1"
  display_name: string; // The display label, e.g. "1"
}

interface GroupedOption {
  group_name: string;
  classes: Option[];
}

interface CustomSelectProps {
  options: GroupedOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomSelect({ options, value, onChange, placeholder = "Pilih", disabled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
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

  // Find selected option display name
  let selectedDisplayName = "";
  let selectedGroupName = "";
  for (const group of options) {
    const found = group.classes.find(c => c.name === value);
    if (found) {
      selectedDisplayName = found.display_name;
      selectedGroupName = group.group_name;
      break;
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-gray-100 disabled:opacity-50 transition-colors ${!value ? "text-gray-500" : "text-black"}`}
      >
        <span>
          {value ? `${selectedGroupName} - ${selectedDisplayName}` : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm animate-in fade-in slide-in-from-top-1">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">Memuat data...</div>
          ) : (
            options.map((group, groupIdx) => (
              <div key={groupIdx}>
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50/80 sticky top-0 backdrop-blur-sm">
                  {group.group_name}
                </div>
                {group.classes.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => {
                      onChange(cls.name);
                      setIsOpen(false);
                    }}
                    className={`relative flex w-full items-center cursor-default select-none py-2 pl-3 pr-9 transition-colors hover:bg-emerald-50 hover:text-emerald-900 ${
                      value === cls.name ? "bg-emerald-100 text-emerald-900 font-medium" : "text-gray-900"
                    }`}
                  >
                    <span className="block truncate ml-4">{cls.display_name}</span>
                    {value === cls.name && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

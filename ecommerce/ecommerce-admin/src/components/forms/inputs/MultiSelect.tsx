import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  className
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const selectedLabels = value.map(v => options.find(o => o.value === v)?.label).filter(Boolean);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors flex items-center justify-between gap-2"
      >
        <div className="flex-1 flex flex-wrap gap-1.5">
          {value.length === 0 ? (
            <span className="text-slate-500">{placeholder}</span>
          ) : (
            selectedLabels.map((label, index) => (
              <span
                key={value[index]}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium"
              >
                {label}
                <button
                  onClick={(e) => removeOption(value[index], e)}
                  className="hover:bg-indigo-200 rounded-sm p-0.5 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={cn('size-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
                  isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
                )}
              >
                <span className="text-sm">{option.label}</span>
                {isSelected && <Check className="size-4 text-indigo-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

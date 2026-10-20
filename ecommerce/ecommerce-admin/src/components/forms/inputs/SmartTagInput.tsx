import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SmartTagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
  placeholder?: string;
  className?: string;
  tagType?: 'product' | 'customer' | 'order'; // Type of tag for proper categorization
  onTagCreated?: (tagName: string) => void; // Callback when a new tag is created
}

export function SmartTagInput({
  value = [],
  onChange,
  availableTags = [],
  placeholder = "Add tags...",
  className,
  tagType,
  onTagCreated
}: SmartTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input and exclude already selected tags
  const suggestions = useMemo(() => {
    // Filter out already selected tags
    const unselectedTags = availableTags.filter(tag => !value.includes(tag));

    // If no input, show all unselected tags
    if (!inputValue.trim()) {
      return unselectedTags;
    }

    // If there's input, filter tags that match
    const lowerInput = inputValue.toLowerCase();
    return unselectedTags.filter(tag =>
      tag.toLowerCase().includes(lowerInput)
    );
  }, [inputValue, availableTags, value]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue('');

      if (!availableTags.includes(trimmedTag) && onTagCreated) {
        onTagCreated(trimmedTag);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const exactMatch = suggestions.find(s => s.toLowerCase() === inputValue.toLowerCase());
      if (exactMatch) {
        handleAddTag(exactMatch);
      } else {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveTag(value[value.length - 1]);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("space-y-3", className)}>
      <div className={cn(
        "flex flex-wrap gap-2 p-2 rounded-xl border border-input bg-muted focus-within:ring-2 focus-within:ring-slate-100 transition-all min-h-[42px]",
        isFocused && "border-slate-300 ring-2 ring-slate-100"
      )}>
        {value.map(tag => (
          <Badge key={tag} variant="secondary" className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors break-all whitespace-normal h-auto">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1.5 hover:text-red-500 rounded-full p-0.5 transition-colors shrink-0"
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}

        <div className="relative flex-1 min-w-[80px] flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 h-full bg-transparent outline-none text-sm placeholder:text-slate-400 py-1 min-w-[60px]"
          />
          <button
            type="button"
            onClick={() => handleAddTag(inputValue)}
            disabled={!inputValue.trim()}
            className="ml-2 p-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            title="Add Tag"
          >
            <Plus className="size-4" />
          </button>

          {/* Suggestions Dropdown */}
          {isFocused && (suggestions.length > 0 || inputValue.trim()) && (
            <div className="absolute top-full left-0 z-50 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden min-w-[200px] max-h-[280px] flex flex-col">

              {/* Existing Suggestions */}
              {suggestions.length > 0 && (
                <div className="flex-1 overflow-y-auto">
                  <div className="sticky top-0 bg-white z-10 px-3 py-1.5 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {inputValue.trim() ? 'Suggested' : 'Available Tags'}
                    </p>
                  </div>
                  <div className="py-1">
                    {suggestions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddTag(tag)}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between group"
                      >
                        <span>{tag}</span>
                        <Plus className="size-3.5 opacity-0 group-hover:opacity-100 text-slate-400" />
                      </button>
                    ))}
                  </div>
                  {inputValue.trim() && !suggestions.find(s => s.toLowerCase() === inputValue.toLowerCase()) && (
                    <div className="h-px bg-slate-100" />
                  )}
                </div>
              )}

              {/* Create New Option */}
              {inputValue.trim() && !suggestions.find(s => s.toLowerCase() === inputValue.toLowerCase()) && (
                <div className="border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleAddTag(inputValue)}
                    className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                  >
                    <Plus className="size-3.5" />
                    Create "{inputValue}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
